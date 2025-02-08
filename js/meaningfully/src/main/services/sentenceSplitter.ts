import { SentenceSplitter } from "llamaindex";
import natural from "natural";

export class CustomSentenceSplitter extends SentenceSplitter {
  constructor(options: { chunkSize?: number; chunkOverlap?: number } = {}) {
    super(options);
    
    // Create custom tokenizer with abbreviations
    const abbreviations = ['dr', 'vs', 'mr', 'mrs', 'prof', 'inc', 'corp', 'ltd'];
    const tokenizer = new natural.SentenceTokenizer(abbreviations);
    // Override the default split_text method
    this.splitText = (text: string): string[] => {
      return tokenizer.tokenize(text);
    };
  }
} 