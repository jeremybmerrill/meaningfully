import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $$, $ } from '@wdio/globals';
import { execSync } from 'child_process';


//execSync('sqlite3  ./e2e/test-storage/metadata.db "CREATE TABLE IF NOT EXISTS meaningfully_settings (settings_id INTEGER PRIMARY KEY AUTOINCREMENT,  settings TEXT NOT NULL );" "CREATE TABLE IF NOT EXISTS document_sets ( set_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, upload_date TEXT NOT NULL, parameters TEXT NOT NULL, total_documents INTEGER NOT NULL DEFAULT 0);"');

// --- Steps ---

Given("the settings store is empty", async () => {
    execSync('sqlite3  ./e2e/test-storage/metadata.db "DELETE FROM meaningfully_settings"');
    
});

Given("the setting store has an OpenAI API Key value", async () => {
    execSync('sqlite3  ./e2e/test-storage/metadata.db "DELETE FROM meaningfully_settings"');
    execSync(`sqlite3  ./e2e/test-storage/metadata.db "INSERT OR REPLACE INTO meaningfully_settings (settings_id, settings) VALUES (1, '{\"openAIKey\":\"sk-proj-meaningfullytesting-1234567890\"}')"`);
});


// // TODO DRY 
// Then("the {string} component should be visible", async (componentName: string) => {
//     let selector: string;
//     switch (componentName) {
//         case "API Key Status":
//             selector = API_KEY_STATUS_COMPONENT_SELECTOR;
//             break;
//         default:
//             throw new Error(`Unknown component name: ${componentName}`);
//     }
//     const component = await $(selector);
//     await expect(component).toBeDisplayed();
// });
