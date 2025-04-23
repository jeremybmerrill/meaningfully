import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $$ } from '@wdio/globals';
import { execSync } from 'child_process';


// // --- Selectors ---
const UPLOAD_COMPONENT_SELECTOR = '[data-testid="upload-spreadsheet"]';
const EXISTING_SPREADSHEETS_SELECTOR = '[data-testid="existing-spreadsheets"]';
const DATASET_ROW_SELECTOR = '[data-testid="existing-spreadsheet-row"]'; // Selector for a single dataset row/item

execSync('sqlite3  ./e2e/test-storage/metadata.db "CREATE TABLE IF NOT EXISTS meaningfully_settings (settings_id INTEGER PRIMARY KEY AUTOINCREMENT,  settings TEXT NOT NULL );" "CREATE TABLE IF NOT EXISTS document_sets ( set_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, upload_date TEXT NOT NULL, parameters TEXT NOT NULL, total_documents INTEGER NOT NULL DEFAULT 0);"');
// // --- Steps ---

Given("the application has started", async () => {
    // WebdriverIO Electron service typically handles app launch automatically.
    // You might add a small wait here if needed for the UI to stabilize.
    await browser.pause(500); // Optional: Adjust as needed
});

Given("the metadata store is empty", async () => {
    execSync('sqlite3  ./e2e/test-storage/metadata.db "DELETE FROM document_sets"');
});
Given("the metadata store contains {int} entries", async (count: number) => {
    console.warn(`Step 'the metadata store contains ${count} entries' requires implementation.`);
    execSync('sqlite3  ./e2e/test-storage/metadata.db "DELETE FROM document_sets"');
    for (let i = 0; i < count; i++) {
        execSync(`sqlite3  ./e2e/test-storage/metadata.db "INSERT INTO document_sets (name, upload_date, parameters, total_documents) VALUES ('Test ${i+1}', date('now'), '{}', 0)"`);
    }
    // Add a small pause if data loading is asynchronous
    await browser.pause(200);
});
// TODO DRY 
Given("the page has been reloaded", async () => {
    // Reload the current page  
    // await browser.reloadSession();
    const currentUrl = await browser.getUrl();
    await browser.url(currentUrl);
});

// TODO DRY 
Then("the {string} component should be visible", async (componentName: string) => {
    let selector: string;
    switch (componentName) {
        case "Upload a Spreadsheet":
            selector = UPLOAD_COMPONENT_SELECTOR;
            break;
        case "Existing Spreadsheets":
            selector = EXISTING_SPREADSHEETS_SELECTOR;
            break;
        default:
            throw new Error(`Unknown component name: ${componentName}`);
    }
    const component = await $(selector);
    await expect(component).toBeDisplayed();
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