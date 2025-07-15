//@ts-nocheck
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
      new CustomSentenceSplitter({ chunkSize: 50, chunkOverlap: 10 }),
    ],
  });

test("my modified sentenceSplitter doesn't eliminate spaces", () => {
    customSentenceSplitterPipeline.run({documents: documents}).then((nodes) => {
        expect(nodes.some((node) => node["text"].indexOf("Co.elected") > -1)).toEqual(false);
        expect(nodes.some((node) => node["text"].indexOf("Mr.Weinberger") > -1)).toEqual(false);
        expect(nodes.some((node) => node["text"].indexOf("A.and") > -1)).toEqual(false);
    });
});

// test("original sentenceSplitter does eliminate spaces", () => {
//     originalSentenceSplitterPipeline.run({documents: documents}).then((nodes) => {
//         expect(nodes.some((node) => node["text"].indexOf("Co.elected") > -1)).toEqual(true);
//         expect(nodes.some((node) => node["text"].indexOf("Mr.Weinberger") > -1)).toEqual(true);
//         expect(nodes.some((node) => node["text"].indexOf("A.and") > -1)).toEqual(true);
//     });
// });

let noAbbrevsCustomSentenceSplitterPipeline = new IngestionPipeline({
    transformations: [
      new CustomSentenceSplitter({ chunkSize: 50, chunkOverlap: 10, abbreviations: []}),
    ],
  });


  test("my modified sentenceSplitter doesn't split on specified abbreviations", () => {
    customSentenceSplitterPipeline.run({documents: documents}).then((nodes) => {
        expect(nodes.map((node) => !!node["text"].match(/Mr\.$/))).not.toContainEqual(true);
    });
});

// this is only a problem on branch fix/sentence-splitter-spaces
// where the chunker is eliminated entirely in favor of just splitting by sentences with natural.
test("original sentenceSplitter splits in silly places, like Mr", () => {
    noAbbrevsCustomSentenceSplitterPipeline.run({documents: documents}).then((nodes) => {
        expect(nodes.map((node) => !!node["text"].match(/Mr\.$/))).toContainEqual(true);
    });
});

const testcases = [
    ["USA v. 4227 JENIFER STREET N.W. WASHINGTON, D.C., AND ELECTRONIC DEVICES THEREIN UNDER RULE 41", "USA v. 4227 JENIFER STREET N.W. WASHINGTON, D.C., AND ELECTRONIC DEVICES THEREIN UNDER RULE 41"],
    ["JPMorgan Chase & Co. elected Mark Weinberger as a director, effective January 16, 2024, and the Board of Directors appointed him as a member of the Audit Committee.", "JPMorgan Chase & Co. elected Mark Weinberger as a director, effective January 16, 2024, and the Board of Directors appointed him as a member of the Audit Committee."],
    ["Mr. Weinberger was Global Chairman and Chief Executive Officer of Ernst & Young from 2013 to 2019.", "Mr. Weinberger was Global Chairman and Chief Executive Officer of Ernst & Young from 2013 to 2019."],
    ["He was also elected a director of JPMorgan Chase Bank, N.A. and a manager of JPMorgan Chase Holdings LLC, and may be elected a director of such other subsidiary or subsidiaries as may be determined from time to time.", "He was also elected a director of JPMorgan Chase Bank, N.A. and a manager of JPMorgan Chase Holdings LLC, and may be elected a director of such other subsidiary or subsidiaries as may be determined from time to time."],

];
testcases.forEach(([testcase_input, testcase_expected_output]) => {
    test(`my sentenceSplitter correctly handles short sentence ${testcase_input}`, () => {
        customSentenceSplitterPipeline.run({documents: [new Document({text: testcase_input})]}).then((nodes) => {
            expect(nodes.length).toEqual(1);
            expect(nodes[0]["text"]).toEqual(testcase_expected_output);
        });
    })
});
