import { SentenceSplitter } from "llamaindex";
import natural from "natural";


/*
LlamaIndex's includes the length of the metadata as part of the size of the chunk when splitting by sentences. 
This produces very unintuitive behavior: e.g. when the user specifies a chunk-size of 50 and nodes have metadata of length 40, 
the resulting split sentences are about 10 tokens long -- as opposed to the specified 50.

This modified SentenceSplitter adds a `include_metadata_in_chunksize` flag that disables the above behavior,
ignoring metadata when calculating chunksize (i.e. only including the size of the text datga when calculating chunksize.)

*/
// TODO: make this configurable
const INCLUDE_METADATA_IN_CHUNKSIZE = false;
SentenceSplitter.prototype.splitTextMetadataAware = function(text: string, metadata: string): string[] {
  const metadataLength = this.tokenSize(metadata);
  const effectiveChunkSize = INCLUDE_METADATA_IN_CHUNKSIZE ? this.chunkSize - metadataLength : this.chunkSize;
  if (effectiveChunkSize <= 0) {
    throw new Error(
      `Metadata length (${metadataLength}) is longer than chunk size (${this.chunkSize}). Consider increasing the chunk size or decreasing the size of your metadata to avoid this.`,
    );
  } else if (effectiveChunkSize < 50) {
    console.log(
      `Metadata length (${metadataLength}) is close to chunk size (${this.chunkSize}). Resulting chunks are less than 50 tokens. Consider increasing the chunk size or decreasing the size of your metadata to avoid this.`,
    );
  }
  return this._splitText(text, effectiveChunkSize);
}

export class CustomSentenceSplitter extends SentenceSplitter {
  constructor(options: { chunkSize?: number; chunkOverlap?: number } = {}) {
    super(options);
    // Create custom tokenizer with abbreviations
    const abbreviations = ['dr. ', 'vs. ', 'mr. ', 'ms. ', 'mx. ', 'mrs. ', 'prof. ', 'inc. ', 'corp. ', 'co. ', 'llc. ', 'ltd. ', 'etc.'];
    const tokenizer = new natural.SentenceTokenizer(abbreviations);
    // Override the default split_text method
    this.splitText = (text: string): string[] => {
      return tokenizer.tokenize(text);
    };
  }
} 