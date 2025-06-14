import { SentenceSplitter, splitBySep, splitByRegex, splitByChar, Settings } from "llamaindex";
import natural from "natural"

/*
LlamaIndex's includes the length of the metadata as part of the size of the chunk when splitting by sentences. 
This produces very unintuitive behavior: e.g. when the user specifies a chunk-size of 50 and nodes have metadata of length 40, 
the resulting split sentences are about 10 tokens long -- as opposed to the specified 50.

This modified SentenceSplitter adds a `include_metadata_in_chunksize` flag that disables the above behavior,
ignoring metadata when calculating chunksize (i.e. only including the size of the text datga when calculating chunksize.)

Additionally, splitTextMetadataAware does some bizarre stuff where it will split sentences at abbreviations -- even if the 
underlying tokenizer knows about the abbreviations, I think due to some weird sub-sentence splitting. It also sews sentence
chunks back together in a way that eliminates spaces, e.g. `JPMorgan Chase & Co.elected Mark Weinberger` and  `Mr.Weinberger was Global Chairman`.

I also tried making SentenceSplitter just split on sentences (with Natural) but this misbehaved by splitting TOO much. I do need short sentences grouped
together (whether they are true short sentences, or false-positives like "USA v. one 12 ft. I.B.M. mainframe").


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

const default_abbreviations= ['dr.', 'vs.', 'mr.', 'ms.', 'mx.', 'mrs.', 'prof.', 'inc.', 'corp.', 'co.', 'llc.', 'ltd.', 'etc.', "i.e.",
  "etc.",
  "vs.",
  "A.S.A.P.",
];

// verbatim copies
type TextSplitterFn = (text: string) => string[];
type _Split = {
  text: string;
  isSentence: boolean;
  tokenSize: number;
};


// This varies from SentenceSplitter in two ways:
// 1. it uses abbreviations set here.
// 2. it uses a custom SentenceTokenizer with a second trimSentences arguemnt that controls
//    whether or not leading/trailing whitespace is preserved.
//    We want to preserve it, so that when sentences are merged back again, we don't end up with 
//    sentences that are not separated by spaces.
// Because JavaScript is stupid, we have to copy over almost the whole SentenceSplitter just to make those few small changes.
export class CustomSentenceSplitter extends SentenceSplitter {

  // this function is new.
  chunkingTokenizerFn = (): TextSplitterFn => {
    return (text: string) => {
      try {
        return this.tokenizer.tokenize(text);
      } catch {
        return [text];
      }
    };
  };
  #splitFns: Set<TextSplitterFn> = new Set();
  #subSentenceSplitFns: Set<TextSplitterFn> = new Set();
  abbreviations: string[];
  tokenizer: natural.SentenceTokenizer;

  constructor(params: { chunkSize?: number; chunkOverlap?: number; abbreviations?: string[] } = {}) {
    super(params);
    // Create custom tokenizer with abbreviations
    this.abbreviations = params.abbreviations || default_abbreviations;

    // I modified my local node_modules/natural/lib/natural/tokenizers/index.d.ts to add the second argument to the natural.SentenceTokenizer constructor.
    // once that gets fixed in the next version of the library, remove the ts-ignore.
    // @ts-ignore
    this.tokenizer = new natural.SentenceTokenizer(this.abbreviations, false); // false is don't trim sentences

    // copied from the superclass.
    this.#splitFns.add(splitBySep(this.paragraphSeparator));

    this.#splitFns.add(this.chunkingTokenizerFn()); // the ONLY change here in the constructor.

    // copied from the superclass.
    this.#subSentenceSplitFns.add(splitByRegex(this.secondaryChunkingRegex));
    this.#subSentenceSplitFns.add(splitBySep(this.separator));
    this.#subSentenceSplitFns.add(splitByChar());

    // left over from a failed attempt to JUST use natural.SentenceTokenizer
    // but I DO in fact need the merge stuff.
    // const tokenizer = 
    // Override the default splitText method
    // this.splitText = (text: string): string[] => {
    //   return tokenizer.tokenize(text);
    // };
    // /* tslint:disable:no-unused-variable */
    // this.splitTextMetadataAware = (text: string, metadata: string): string[] => {
    //   return tokenizer.tokenize(text);
    // }
  }


  //just verbatim copies of the parent class

  _splitText(text: string, chunkSize: number): string[] {
    if (text === "") return [text];

    const callbackManager = Settings.callbackManager;

    callbackManager.dispatchEvent("chunking-start", {
      text: [text],
    });
    const splits = this.#split(text, chunkSize);
    const chunks = this.#merge(splits, chunkSize);

    callbackManager.dispatchEvent("chunking-end", {
      chunks,
    });
    return chunks;
  }

  #split(text: string, chunkSize: number): _Split[] {
    const tokenSize = this.tokenSize(text);
    if (tokenSize <= chunkSize) {
      return [
        {
          text,
          isSentence: true,
          tokenSize,
        },
      ];
    }
    const [textSplitsByFns, isSentence] = this.#getSplitsByFns(text);
    const textSplits: _Split[] = [];

    for (const textSplit of textSplitsByFns) {
      const tokenSize = this.tokenSize(textSplit);
      if (tokenSize <= chunkSize) {
        textSplits.push({
          text: textSplit,
          isSentence,
          tokenSize,
        });
      } else {
        const recursiveTextSplits = this.#split(textSplit, chunkSize);
        textSplits.push(...recursiveTextSplits);
      }
    }
    return textSplits;
  }

  #getSplitsByFns(text: string): [splits: string[], isSentence: boolean] {
    for (const splitFn of this.#splitFns) {
      const splits = splitFn(text);
      if (splits.length > 1) {
        return [splits, true];
      }
    }
    for (const splitFn of this.#subSentenceSplitFns) {
      const splits = splitFn(text);
      if (splits.length > 1) {
        return [splits, false];
      }
    }
    return [[text], true];
  }

  #merge(splits: _Split[], chunkSize: number): string[] {
    const chunks: string[] = [];
    let currentChunk: [string, number][] = [];
    let lastChunk: [string, number][] = [];
    let currentChunkLength = 0;
    let newChunk = true;

    const closeChunk = (): void => {
      chunks.push(currentChunk.map(([text]) => text).join(""));
      lastChunk = currentChunk;
      currentChunk = [];
      currentChunkLength = 0;
      newChunk = true;

      let lastIndex = lastChunk.length - 1;
      while (
        lastIndex >= 0 &&
        currentChunkLength + lastChunk[lastIndex]![1] <= this.chunkOverlap
      ) {
        const [text, length] = lastChunk[lastIndex]!;
        currentChunkLength += length;
        currentChunk.unshift([text, length]);
        lastIndex -= 1;
      }
    };

    while (splits.length > 0) {
      const curSplit = splits[0]!;
      if (curSplit.tokenSize > chunkSize) {
        throw new Error("Single token exceeded chunk size");
      }
      if (currentChunkLength + curSplit.tokenSize > chunkSize && !newChunk) {
        closeChunk();
      } else {
        if (
          curSplit.isSentence ||
          currentChunkLength + curSplit.tokenSize <= chunkSize ||
          newChunk
        ) {
          currentChunkLength += curSplit.tokenSize;
          currentChunk.push([curSplit.text, curSplit.tokenSize]);
          splits.shift();
          newChunk = false;
        } else {
          closeChunk();
        }
      }
    }

    // Handle the last chunk
    if (!newChunk) {
      chunks.push(currentChunk.map(([text]) => text).join(""));
    }

    return this.#postprocessChunks(chunks);
  }

  #postprocessChunks(chunks: string[]): string[] {
    const newChunks: string[] = [];
    for (const chunk of chunks) {
      const trimmedChunk = chunk.trim();
      if (trimmedChunk !== "") {
        newChunks.push(trimmedChunk);
      }
    }
    return newChunks;
  }
} 