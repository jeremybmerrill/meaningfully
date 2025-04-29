import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $$, $ } from '@wdio/globals';
import { execSync } from 'child_process';
import path from 'path';

// // --- Selectors ---
const DATASET_ROW_SELECTOR = '[data-testid="existing-spreadsheet-row"]'; // Selector for a single dataset row/item

// execSync('sqlite3  ./e2e/test-storage/metadata.db "CREATE TABLE IF NOT EXISTS meaningfully_settings (settings_id INTEGER PRIMARY KEY AUTOINCREMENT,  settings TEXT NOT NULL );" "CREATE TABLE IF NOT EXISTS document_sets ( set_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, upload_date TEXT NOT NULL, parameters TEXT NOT NULL, total_documents INTEGER NOT NULL DEFAULT 0);"');

Given("the metadata store is empty", async () => {
    // execSync('sqlite3  ./e2e/test-storage/metadata.db "DELETE FROM document_sets"');
    // starts empty!
    1+1
});
Given("the metadata store contains {int} entries", async (count: number) => {
    // Resolve the local path for the CSV you want to upload.
    const localFilePath = path.resolve(process.cwd(), 'e2e/test-storage/constellation-test.csv');
    // Upload the file to the Selenium/Electron server.
    const remoteFilePath = await browser.uploadFile(localFilePath);
    
    for (let i = 0; i < count; i++) {
        // Pass the remote file path into browser.execute.
        await browser.execute((index, remotePath) => {
            // In the browser context, use fetch to retrieve the uploaded file as a blob.
            fetch(remotePath)
                .then(response => response.blob())
                .then(blob => {
                    const file = new File([blob], 'constellation-test.csv', { type: "text/csv" });
                    // Use your app’s API to simulate the upload.
                    if (window.api && window.api.uploadCsv) {
                        window.api.uploadCsv({
                            file: file,
                            datasetName: `Test ${index + 1}`,
                            description: "",
                            textColumns: ["paragraph"],
                            metadataColumns: ["cik", "classification"],
                            splitIntoSentences: true,
                            combineSentencesIntoChunks: true,
                            sploderMaxSize: 500,
                            chunkSize: 100,
                            chunkOverlap: 20,
                            modelName: "text-embedding-3-small",
                            modelProvider: "mock"
                        });
                    }
                });
        }, i, remoteFilePath);
    }
    // Pause a bit to let the uploads process.
    await browser.pause(500);
});

Then("no datasets should be listed", async () => {
    const datasets = await $$(DATASET_ROW_SELECTOR);
    await expect(datasets).toBeElementsArrayOfSize(0);
});

Then("{int} datasets should be listed", async (expectedCount: number) => {
    const datasets = await $$(DATASET_ROW_SELECTOR);
    await expect(datasets).toBeElementsArrayOfSize(expectedCount);
});

///////////////////////////////////////////////////////////////////////////////////////////




// Given("the metadata store is empty", async () => {
//     // TODO: Implement logic to ensure the metadata store is empty.
//     // This might involve:
//     // - Calling a specific function via browser.execute:
//     //   await browser.execute(() => (window as any).electronAPI.clearMetadataStore());
//     // - Interacting with the UI to clear data if applicable.
//     // - Restarting the app in a clean state (might be handled by wdio setup).
//     console.warn("Step 'the metadata store is empty' requires implementation.");
// });

// Given("the metadata store contains {int} entries", async (count: number) => {
//     // TODO: Implement logic to populate the metadata store with 'count' entries.
//     // Similar to the empty state, this might involve:
//     // - Calling a function via browser.execute:
//     //   await browser.execute((num) => (window as any).electronAPI.addMockMetadata(num), count);
//     // - UI interactions to add data.
//     console.warn(`Step 'the metadata store contains ${count} entries' requires implementation.`);
//     // Add a small pause if data loading is asynchronous
//     await browser.pause(200);
// });


// Then("no datasets should be listed", async () => {
//     const datasets = await $$(DATASET_ROW_SELECTOR);
//     await expect(datasets).toBeElementsArrayOfSize(0);
// });

// Then("{int} datasets should be listed", async (expectedCount: number) => {
//     const datasets = await $$(DATASET_ROW_SELECTOR);
//     await expect(datasets).toBeElementsArrayOfSize(expectedCount);
// });