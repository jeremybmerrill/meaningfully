import { expect, test } from 'vitest'
import { CustomSentenceSplitter } from './sentenceSplitter'
import { SentenceSplitter, IngestionPipeline, Document } from "llamaindex";

// do these tests just to make sure that we can factor out my hacky fixes when llamaindex is fixed.
// test that original sentenceSplitter splits on abbreviations
// test that original sentenceSplitter splits on abbreviations even when specified

// test that my modified sentenceSplitter excludes metadata when arg is specified
// test that my modified sentenceSplitter includes metadata when arg is specified the other way



let documents = [
    new Document({ text: "JPMorgan Chase & Co. elected Mark Weinberger as a director, effective January 16, 2024, and the Board of Directors appointed him as a member of the Audit Committee.  Mr. Weinberger was Global Chairman and Chief Executive Officer of Ernst & Young from 2013 to 2019.  He was also elected a director of JPMorgan Chase Bank, N.A. and a manager of JPMorgan Chase Holdings LLC, and may be elected a director of such other subsidiary or subsidiaries as may be determined from time to time." }),
];

let originalSentenceSplitterPipeline = new IngestionPipeline({
    transformations: [  
        new SentenceSplitter({ chunkSize: 50, chunkOverlap: 10 }),
        ],
    });
let customSentenceSplitterPipeline = new IngestionPipeline({
    transformations: [
      new CustomSentenceSplitter(),
    ],
  });

test("my modified sentenceSplitter doesn't eliminate spaces", () => {
    customSentenceSplitterPipeline.run({documents: documents}).then((nodes) => {
        expect(nodes.some((node) => node["text"].indexOf("Co.elected") > -1)).toEqual(false);
        expect(nodes.some((node) => node["text"].indexOf("Mr.Weinberger") > -1)).toEqual(false);
        expect(nodes.some((node) => node["text"].indexOf("A.and") > -1)).toEqual(false);
    });
});

test("original sentenceSplitter does eliminate spaces", () => {
    originalSentenceSplitterPipeline.run({documents: documents}).then((nodes) => {
        expect(nodes.some((node) => node["text"].indexOf("Co.elected") > -1)).toEqual(true);
        expect(nodes.some((node) => node["text"].indexOf("Mr.Weinberger") > -1)).toEqual(true);
        expect(nodes.some((node) => node["text"].indexOf("A.and") > -1)).toEqual(true);
    });
});

let noAbbrevsCustomSentenceSplitterPipeline = new IngestionPipeline({
    transformations: [
      new CustomSentenceSplitter({abbreviations: []}),
    ],
  });


  test("my modified sentenceSplitter doesn't split on specified abbreviations", () => {
    customSentenceSplitterPipeline.run({documents: documents}).then((nodes) => {
        expect(nodes.map((node) => node["text"])).not.toContainEqual("Mr.");
    });
});

test("original sentenceSplitter splits in silly places, like Mr", () => {
    noAbbrevsCustomSentenceSplitterPipeline.run({documents: documents}).then((nodes) => {
        expect(nodes.map((node) => node["text"])).toContainEqual("Mr.");
    });
});
// test('adds 1 + 2 to equal 3', () => {
//   expect(sum(1, 2)).toBe(3)
// })