//@ts-nocheck
import { BaseEmbedding } from "llamaindex";

export class MockEmbedding extends BaseEmbedding {
    constructor() {
        super();
    }   
    async getTextEmbedding(text: string): Promise<number[]> {
        return new Promise((resolve) => {
            resolve([1, 0, 0, 0, 0, 0]);
        });
    }
};