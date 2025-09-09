import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $$, $, browser } from '@wdio/globals';
import { execSync } from 'child_process';


//execSync('sqlite3  ./e2e/test-storage/metadata.db "CREATE TABLE IF NOT EXISTS meaningfully_settings (settings_id INTEGER PRIMARY KEY AUTOINCREMENT,  settings TEXT NOT NULL );" "CREATE TABLE IF NOT EXISTS document_sets ( set_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, upload_date TEXT NOT NULL, parameters TEXT NOT NULL, total_documents INTEGER NOT NULL DEFAULT 0);"');

// --- Steps ---

Given("the settings store is empty", async () => {
    //execSync('sqlite3  ./e2e/test-storage/metadata.db "DELETE FROM meaningfully_settings"');
    await browser.execute(() => {
        // @ts-ignore
        if (window.api && window.api.setSettings) {
            window.api.setSettings({ 
                openAIKey: "", 
                oLlamaBaseURL: "",
                azureOpenAIKey: "",
                azureOpenAIEndpoint: "",
                azureOpenAIApiVersion: "",
                mistralApiKey: "",
                geminiApiKey: ""
            });
        }
    });
    await browser.pause(500); // Optional: Adjust as needed
});

Given("the setting store has an OpenAI API Key value", async () => {
    // execSync('sqlite3  ./e2e/test-storage/metadata.db "DELETE FROM meaningfully_settings"');
    // execSync(`sqlite3  ./e2e/test-storage/metadata.db "INSERT OR REPLACE INTO meaningfully_settings (settings_id, settings) VALUES (1, '{\"openAIKey\":\"\"}')"`);
    await browser.execute(() => {
        // @ts-ignore
        if (window.api && window.api.setSettings) {
            window.api.setSettings({ 
                openAIKey: "sk-proj-meaningfullytesting-1234567890123456789012345678901234567890", 
                oLlamaBaseURL: "",
                azureOpenAIKey: "",
                azureOpenAIEndpoint: "",
                azureOpenAIApiVersion: "",
                mistralApiKey: "",
                geminiApiKey: ""
            });
        }
    });
    await browser.pause(500); // Optional: Adjust as needed
});

// TODO: use APIs instead of shelling out to sqlite3
// // Step: Simulate empty settings store.
// When("the settings store is empty", async () => {
//     // Implement your method to clear the settings store.
//     // For example, using browser.execute to call your electronAPI:
//     await browser.execute(() => {
//         // @ts-ignore
//         if (window.api && window.api.clearSettings) {
//             window.api.clearSettings();
//         }
//     });
//     await browser.pause(500);
// });

// // Step: Simulate settings store with an OpenAI API Key value.
// When("the setting store has an OpenAI API Key value", async () => {
//     // Implement your method to add a key.
//     await browser.execute(() => {
//         // @ts-ignore
//         if (window.api && window.api.setSettings) {
//             // Set a dummy API key.
//             window.api.setSettings({ openAIKey: "sk-dummyapikeyvalue", oLlamaBaseURL: "" });
//         }
//     });
//     await browser.pause(500);
// });