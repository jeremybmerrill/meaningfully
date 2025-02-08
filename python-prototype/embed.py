#!/usr/bin/env python
# coding: utf-8

# In[1]:


from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from glob import glob

from functools import wraps
from time import time
from datetime import datetime


# In[3]:



# In[5]:

def load_csv_to_documents(fname, text_column_name):
    from non_stupid_csv_reader import NonStupidCSVReader
    #TODO: automatically guess the text column name
    # TODO: let users select multiple text columns (sewing them together into one entry? or embedding them separately? idk.)
    documents = NonStupidCSVReader().load_data(fname, "paragraph")

    # TODO: if embedding multiple columns, this is a way to embed them together.
    # bizarrely, by default, LlamaIndex embeds the metadata too.
    # we don't want that. Just embed the dang'd text.
    # cf. https://docs.llamaindex.ai/en/stable/module_guides/loading/documents_and_nodes/usage_documents/
    for document in documents:
        document.excluded_embed_metadata_keys = document.metadata.keys()


# In[6]:


# just for lookin'

len(documents)


# In[19]:


from llama_index.core.schema import TextNode, TransformComponent, NodeRelationship
from llama_index.core.node_parser import SentenceSplitter

class Sploder(TransformComponent):
    def __call__(self, nodes, max_string_token_count=50, **kwargs):
        new_nodes = []
        splitter = SentenceSplitter() # just for the token_size method
                                      # TODO just go get the token_size method
        for node in nodes:
            new_nodes.append(node)
            if splitter._token_size(node.text) > max_string_token_count: continue
            if NodeRelationship.NEXT in node.relationships:
                b_c_node = TextNode(
                                text =  node.text + \
                                        node.relationships[NodeRelationship.NEXT].metadata["original_text"], 
                                metadata=node.metadata)
                new_nodes.append(b_c_node)
            if NodeRelationship.NEXT in node.relationships and NodeRelationship.PREVIOUS in node.relationships:
                a_b_c_node = TextNode(text=node.relationships[NodeRelationship.PREVIOUS].metadata["original_text"] + \
                                       node.text + \
                                       node.relationships[NodeRelationship.NEXT].metadata["original_text"],
                                  metadata=node.metadata
                                 )
                new_nodes.append(a_b_c_node)
        return new_nodes


# In[20]:


from typing import Any, Callable, List
from llama_index.core import Document
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.node_parser import SentenceWindowNodeParser
from llama_index.core.extractors import TitleExtractor
from llama_index.core.ingestion import IngestionPipeline, IngestionCache
from llama_index.core.node_parser.text.utils import split_by_sentence_tokenizer_internal

import openai
import os
from dotenv import load_dotenv
load_dotenv()

import tiktoken


openai.api_key = os.environ["OPENAI_API_KEY"]
# Settings.embed_model = OpenAIEmbedding(model=MODEL_NAME)


# via https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/node_parser/text/utils.py
def split_by_sentence_tokenizer() -> Callable[[str], List[str]]:
    # via https://stackoverflow.com/questions/14095971/how-to-tweak-the-nltk-sentence-tokenizer
    from nltk.tokenize.punkt import PunktSentenceTokenizer, PunktParameters
    punkt_param = PunktParameters()    
    punkt_param.abbrev_types = set(['dr', 'vs', 'mr', 'mrs', 'prof', 'inc', 'corp', 'ltd'])
    tokenizer = PunktSentenceTokenizer(punkt_param)
    return lambda text: split_by_sentence_tokenizer_internal(text, tokenizer)

def get_text_transformations(use_sploder=True):
    text_transformations = [
        # automatically splits by sentences in a logical way
        # my sentence splitter handlers abbreviations better.
        SentenceWindowNodeParser(sentence_splitter=split_by_sentence_tokenizer()), 
    ]
    if USE_SPLODER:
        text_transformations.append(
            Sploder(max_string_token_count=SPLODER_MAX_SIZE),
                                        # for reasonably short sentences
                                        # add nodes for:
                                        # - the sentence and the sentence after
                                        # - the sentence before, tjhe sentence, and the sentence after
                                        # in hopes of capturing paragraph-level meaning too (but only for short sentences)
        )
    return text_transformations


def create_preview_nodes(documents, text_transformations):
    price_estimation_pipeline = IngestionPipeline(
        transformations=text_transformations
    )
    preview_nodes = price_estimation_pipeline.run(documents=documents)

price_per_1M = {"text-embedding-3-small": 0.020,
                "text-embedding-3-large": 0.130}

def estimate_cost(preview_nodes):
    enc = tiktoken.encoding_for_model(MODEL_NAME)

    token_count = sum([len(enc.encode(node.text)) for node in preview_nodes])
    estimated_price = token_count * (price_per_1M[MODEL_NAME] / 1_000_000)
    print("cost estimate: ${:.2f} ({:,.0f} tokens)".format(estimated_price, token_count))


# this is just monkeypatching to look at what's going on.
# from llama_index.embeddings.openai.base import get_embeddings
# def _get_text_embeddings(self, texts: List[str]) -> List[List[float]]:
#     """Get text embeddings.

#     By default, this is a wrapper around _get_text_embedding.
#     Can be overridden for batch queries.

#     """
#     client = self._get_client()
#     retry_decorator = self._create_retry_decorator()
#     print(texts)
#     @retry_decorator
#     def _retryable_get_embeddings():
#         return get_embeddings(
#             client,
#             texts,
#             engine=self._text_engine,
#             **self.additional_kwargs,
#         )

#     return _retryable_get_embeddings()

# OpenAIEmbedding._get_text_embeddings = _get_text_embeddings


# In[24]:

def embed_documents(documents, text_transformations, embedding_step):
    # run the pipeline
    pipeline = IngestionPipeline(
        transformations=text_transformations + [
            embedding_step
        ]
    )
    start_time = datetime.now()
    nodes = pipeline.run(documents=documents)
    end_time = datetime.now()
    duration = end_time - start_time
    print("took {}s to embed {} documents".format(duration.total_seconds(), len(documents)))
    return nodes


from llama_index.vector_stores.postgres import PGVectorStore
from llama_index.vector_stores.duckdb import DuckDBVectorStore
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

model_dims = {
    "text-embedding-3-small": 1536,
    "text-embedding-3-large": 3072
}


def create_vector_store_and_persist(project_name, vector_store_type, nodes):
    start_time = datetime.now()
    if vector_store_type == "chroma":
        db = chromadb.PersistentClient(path="./chroma")
        chroma_collection = db.get_or_create_collection("{}".format(project_name))
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    elif vector_store_type == "duckdb":
        vector_store = DuckDBVectorStore("{}2.duckdb".format(project_name), persist_dir="../duckdb/")
    elif vector_store_type == "postgres":
        vector_store = PGVectorStore.from_params(
            database="meaningfully",
            host="localhost",
            # password=url.password,
            port=5432,
            user="jeremybmerrill",
            table_name=project_name,
            embed_dim=model_dims[MODEL_NAME],  # openai embedding dimension
            hnsw_kwargs={
                "hnsw_m": 16,
                "hnsw_ef_construction": 64,
                "hnsw_ef_search": 40,
                "hnsw_dist_method": "vector_cosine_ops",
            },
        )
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex(
        nodes, storage_context=storage_context, show_progress=True
    )
    end_time = datetime.now()
    duration = end_time - start_time
    print("took {}s to store {} nodes".format(duration.total_seconds(), len(nodes)))
    #index = VectorStoreIndex.from_documents(documents)
    return index

from llama_index.core.vector_stores.types import (
    MetadataFilter,
    MetadataFilters,
    FilterOperator,
)
def search(index, query, n_results=10):
    retriever = index.as_retriever(
        similarity_top_k=n_results,
        embed_model=OpenAIEmbedding(model_name=MODEL_NAME)
    )
    result_nodes = retriever.retrieve(query)
    return result_nodes
    

def node_to_dict(node, metadata_columns_to_display):
    d = {"text": node.text, **{k:node.metadata[k] for k in metadata_columns_to_display}}
    if hasattr(node, "score"):
        d["score"] = node.score
    return d

def nodes_to_df(nodes, metadata_columns_to_display):
    return pd.DataFrame(
        [node_to_dict(node, metadata_columns_to_display) for node in nodes]
    )

#
def display_nodes(nodes, metadata_columns_to_display):
    # just for lookin'
    with pd.option_context('display.max_colwidth', 500):
        display(nodes_to_df(nodes, metadata_columns_to_display))






def main():
    # for each document set (eventually)
    # read CSV probably using NonStupidCSVReader
    import re
    import os

    fname = glob('../sample-data/*.csv')[0]
    # fname = "../sample-data/Tweets by @NYCFireWire - Sheet1.csv"
    fname = "../sample-data/constellation-10q.csv"
    project_name = re.sub(r"\W", "_", os.path.basename(fname).split(".")[0])


    VECTOR_STORE = "chroma"
    MODEL_NAME = "text-embedding-3-small"
    USE_SPLODER = True
    SPLODER_MAX_SIZE = 50

    metadata = {
        "../sample-data/Tweets by @NYCFireWire - Sheet1.csv":["date", "acct", "url", "addr", "notes"],
        "../sample-data/constellation-10q.csv": ["fn", "paragraph_index"]
    }

    documents = load_csv_to_documents(fname)
    text_transformations = get_text_transformations()
    preview_nodes = create_preview_nodes(documents, text_transformations)
    
    # display an arbitrary sample of the preview nodes from the middle, but retaining the order 
    display_nodes(preview_nodes[len(preview_nodes)//2:(len(preview_nodes)//2)+10], metadata[fname])

    estimate_cost(preview_nodes) # prints cost estimate

    embedding_step = OpenAIEmbedding(model=MODEL_NAME )
    nodes = embed_documents(documents, text_transformations, embedding_step)

    index = create_vector_store_and_persist(project_name, vector_store_type=, nodes)
    display_nodes(search(index, "snow at our factory cost us a lot of money"), metadata[fname])
