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

Given("the uploadCsv function has been mocked", async () => {
    // This step is to ensure that the uploadCsv function is mocked in the browser context.
    // It might be set up in your test environment or application code.
    return browser.execute(() => {
        // @ts-ignore
        if (window.testHooks && window.testHooks.overrideUploadCsv) {
            const originalUploadCsv = window.api.uploadCsv;
            window.testHooks.overrideUploadCsv(async (formData: {
                    file: File,
                    datasetName: string,
                    description: string,
                    textColumns: string[],
                    metadataColumns: string[],
                    splitIntoSentences: boolean,
                    combineSentencesIntoChunks: boolean,
                    sploderMaxSize: number,
                    chunkSize: number,
                    chunkOverlap: number,
                    modelName: string,
                    modelProvider: string
                  }) => {
                // Mock implementation of uploadCsv
                console.log("Mock uploadCsv called with:", formData);
                formData["modelProvider"] = "mock"; // Ensure modelProvider is set to "mock" so we don't hit a paid API.
                return originalUploadCsv(formData);
            });
                     
        }
    });
});
// And a dataset "Test Dataset 1" has been uploaded
// And a dataset "Test Dataset 2" has been uploaded
// Given("a dataset {string} has been uploaded", async (datasetName: string) => {
//     const localFilePath = path.resolve(process.cwd(), 'e2e/test-storage/constellation-test.csv');
//     // Upload the file to the Selenium/Electron server.
//     const remoteFilePath = await browser.uploadFile(localFilePath);

//     await browser.execute((index, remotePath) => {
//         // In the browser context, use fetch to retrieve the uploaded file as a blob.
//         fetch(remotePath)
//             .then(response => response.blob())
//             .then(blob => {
//                 const file = new File([blob], 'constellation-test.csv', { type: "text/csv" });
//                 // Use your app’s API to simulate the upload.
//                 if (window.api && window.api.uploadCsv) {
//                     window.api.uploadCsv({
//                         file: file,
//                         datasetName: datasetName,
//                         description: "",
//                         textColumns: ["paragraph"],
//                         metadataColumns: ["cik", "classification"],
//                         splitIntoSentences: true,
//                         combineSentencesIntoChunks: true,
//                         sploderMaxSize: 500,
//                         chunkSize: 100,
//                         chunkOverlap: 20,
//                         modelName: "text-embedding-3-small",
//                         modelProvider: "mock"
//                     });
//                 }
//             });
//     }, remoteFilePath, datasetName);
//     await browser.pause(500);
// });


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

Then("the dataset {string} should be listed", async (datasetName: string) => {
    const datasetNames = await $$(DATASET_ROW_SELECTOR).map((datasetRow) => datasetRow.$$('td')[0].getText());
    expect(datasetNames).toContain(datasetName);
});
Then("the dataset {string} should not be listed", async (datasetName: string) => {
    const datasetNames = await $$(DATASET_ROW_SELECTOR).map((datasetRow) => datasetRow.$$('td')[0].getText());
    expect(datasetNames).not.toContain(datasetName);
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