
let natural = await import("natural");
let { IngestionPipeline, Document, SentenceSplitter } = await import("llamaindex");
const abbreviations_ = [] // ['dr.', 'vs.', 'mr.', 'ms.', 'mx.', 'mrs.', 'prof.', 'inc.', 'corp.', 'co.', 'llc.', 'ltd.', 'etc.', 'n.a.'];
class CustomSentenceSplitter extends SentenceSplitter {
  constructor(options = {}) {
    super(options);
    // Create custom tokenizer with abbreviations
    const abbreviations = abbreviations_;
    const tokenizer = new natural.default.SentenceTokenizer(abbreviations);
    // Override the default split_text method
    this.splitText = (text) => {
      return tokenizer.tokenize(text);
    };
    this.splitTextMetadataAware = (text, metadata) =>{
      const metadataLength = this.tokenSize(metadata);
      const effectiveChunkSize = this.chunkSize - metadataLength;
      return tokenizer.tokenize(text);
    }

  }
} 

let documents = [
    new Document({ text: "JPMorgan Chase & Co. elected Mark Weinberger as a director, effective January 16, 2024, and the Board of Directors appointed him as a member of the Audit Committee.  Mr. Weinberger was Global Chairman and Chief Executive Officer of Ernst & Young from 2013 to 2019.  He was also elected a director of JPMorgan Chase Bank, N.A. and a manager of JPMorgan Chase Holdings LLC, and may be elected a director of such other subsidiary or subsidiaries as may be determined from time to time." }),
  ];

let pipeline = new IngestionPipeline({
  transformations: [
    new CustomSentenceSplitter({ chunkSize: 50, chunkOverlap: 10 }),
  ],
});

console.log("pipeline output")

let nodes = await pipeline.run({ documents });
nodes.forEach((node) => {
  console.log(node["relationships"]["SOURCE"]);
});

