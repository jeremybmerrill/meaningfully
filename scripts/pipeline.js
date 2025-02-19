let { IngestionPipeline, Document, SentenceSplitter } = await import("llamaindex");

let { SentenceTokenizer } = await import("natural")

class CustomSentenceSplitter extends SentenceSplitter {
  constructor(options = {}) {
    super(options);
    // Create custom tokenizer with abbreviations
    const abbreviations = ['dr. ', 'vs. ', 'mr. ', 'ms. ', 'mx. ', 'mrs. ', 'prof. ', 'inc. ', 'corp. ', 'co. ', 'llc. ', 'ltd. ', 'etc. '];
    const tokenizer = new SentenceTokenizer(abbreviations);
    // Override the default split_text method
    this.splitText = (text) => {
      return tokenizer.tokenize(text);
    };
  }
} 

documents = [
    new Document({ text: "JPMorgan Chase & Co. elected Mark Weinberger as a director, effective January 16, 2024, and the Board of Directors appointed him as a member of the Audit Committee.  Mr. Weinberger was Global Chairman and Chief Executive Officer of Ernst & Young from 2013 to 2019.  He was also elected a director of JPMorgan Chase Bank, N.A. and a manager of JPMorgan Chase Holdings LLC, and may be elected a director of such other subsidiary or subsidiaries as may be determined from time to time." }),
  ];

pipeline = new IngestionPipeline({
  transformations: [
    new CustomSentenceSplitter({ chunkSize: 50, chunkOverlap: 10 }),
  ],
});


nodes = await pipeline.run({ documents });

console.log(nodes);