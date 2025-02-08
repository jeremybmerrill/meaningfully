#!/usr/bin/env python
# coding: utf-8

# In[2]:


from glob import glob
import os
import re

csvs = glob('../sample-data/*.csv')
print("Possible project names:")
for fname in csvs:
    possible_project_name = re.sub(r"\W", "_", os.path.basename(fname).split(".")[0])
    print(possible_project_name)


# In[4]:


from llama_index.vector_stores.postgres import PGVectorStore
from llama_index.vector_stores.duckdb import DuckDBVectorStore
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

from llama_index.core import VectorStoreIndex, StorageContext
import re
project_name = 'constellation_10q'

VECTOR_STORE = "chroma"

if VECTOR_STORE == 'chroma':
    chroma_client = chromadb.PersistentClient(path="./chroma")
    chroma_collection = chroma_client.get_or_create_collection("{}".format(project_name))
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
elif VECTOR_STORE == "duckdb":
    vector_store = DuckDBVectorStore("{}2.duckdb".format(project_name), persist_dir="../duckdb/")
elif VECTOR_STORE == "postgres":
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


# In[5]:


import os
from dotenv import load_dotenv
load_dotenv()

# from llama_index.core import Settings
from llama_index.embeddings.openai import OpenAIEmbedding

MODEL_NAME = "text-embedding-3-small"
# Settings.embed_model = OpenAIEmbedding(model=MODEL_NAME)


index = VectorStoreIndex.from_vector_store(vector_store=vector_store)


# In[6]:


from llama_index.core.vector_stores.types import (
    MetadataFilter,
    MetadataFilters,
    FilterOperator,
)

filters = MetadataFilters(
    filters=[
        #MetadataFilter(key="date", value="February 15", operator=FilterOperator.TEXT_MATCH),
        # MetadataFilter(key="author", value="sven@timescale.com"),
    ],
    # condition="or",
)

retriever = index.as_retriever(
    similarity_top_k=10,
    #filters=filters,
    embed_model = OpenAIEmbedding(model=MODEL_NAME)
)
result_nodes = retriever.retrieve("we fired an executive")


# In[7]:


METADATA_COLUMNS_TO_DISPLAY = ["date", "acct", "url", "addr", "notes"]


# In[8]:


import pandas as pd
# just for lookin'
result_nodes_list = []
for node_with_score in result_nodes:
    result_node_dict = {"text": node_with_score.node.text.replace("\n", ' '), **node_with_score.node.metadata}
    # TODO add shingles
    result_node_dict["score"] = node_with_score.score
    result_nodes_list.append(result_node_dict)
result_nodes_df = pd.DataFrame(result_nodes_list)
with pd.option_context('display.max_colwidth', 500):
    display(result_nodes_df[["text"] + [c for c in METADATA_COLUMNS_TO_DISPLAY if c in result_nodes_df.columns] + ["score"]])


# In[9]:


# mimicing asking for more results
# TODO: Figure out how to not re-embed the query
retriever.similarity_top_k=30
result_nodes = retriever.retrieve("we fired an executive and he isn't getting paid")


# In[10]:


import pandas as pd
# just for lookin'
result_nodes_list = []
for node_with_score in result_nodes:
    result_node_dict = {"text": node_with_score.node.text.replace("\n", ' '), **node_with_score.node.metadata}
    # TODO add shingles
    result_node_dict["score"] = node_with_score.score
    result_nodes_list.append(result_node_dict)
result_nodes_df = pd.DataFrame(result_nodes_list)
with pd.option_context('display.max_colwidth', 500):
    display(result_nodes_df[["text"] + [c for c in METADATA_COLUMNS_TO_DISPLAY if c in result_nodes_df.columns] + ["score"]])


# In[ ]:




