import { Given, When, Then } from '@wdio/cucumber-framework';
import path from 'path';
import { expect, $$, $ } from '@wdio/globals';

// Selectors – adjust these if needed.
const UPLOAD_COMPONENT_SELECTOR = '[data-testid="upload-a-spreadsheet"]';
const CSV_UPLOAD_PAGE_SELECTOR = '[data-testid="csv-upload-settings"]';
const PREVIEW_COMPONENT_SELECTOR = '[data-testid="preview"]';

const TEST_CSV_FILE_NAME = "newline-test.csv"; // The name of the test CSV file to use.
const INDEX_OF_COLUMN_TO_EMBED = 4; 

// Step: Simulate file selection using the test CSV file.
Given(
    "a file has been selected in the {string} component", 
    async (componentName: string) => {
        // Locate the file input inside the specified component.
        const fileInputSelector = `[data-testid="${componentName
            .toLowerCase()
            .replace(/ /g, '-')}"] input[type="file"]`;
        const fileInput = await $(fileInputSelector);
        // Resolve path to the test CSV file.
        const filePath = path.resolve(process.cwd(), `e2e/test-storage/${TEST_CSV_FILE_NAME}`);
        // Upload the file (this copies the file to a temporary location on the Selenium server).
        const remoteFilePath = await browser.uploadFile(filePath);
        await fileInput.setValue(remoteFilePath);
        // Trigger change event if necessary.
        await browser.execute((input: HTMLInputElement) => {
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        }, fileInput);
        // Allow time for the file selection to process.
        await browser.pause(1000);
    }
);

// Step: Simulate choosing a column to embed.
When("the column {string} has been selected as column to embed", async (columnName: string) => {
    // Assume the CSV Upload page contains a <select> for the text column.
    // Here we target the first select element inside the CSV Upload page.
    const selectSelector = `${CSV_UPLOAD_PAGE_SELECTOR} select[data-testid="column-to-embed-select"]`;
    const selectElem = await $(selectSelector);
    await selectElem.waitForExist({ timeout: 5000 });
    // Select by index (skipping the default placeholder at index 0).
    await selectElem.selectByVisibleText(columnName); // Replace with the actual index of the column you want to embed.
    await browser.pause(500);
});
When("no column has been selected as column to embed", async () => {
    const selectSelector = `${CSV_UPLOAD_PAGE_SELECTOR} select[data-testid="column-to-embed-select"]`;
    // Select the default empty option, assuming it has an empty value.
    await $(selectSelector).selectByAttribute('value', '');
    await browser.pause(500);
});

// Step: Simulate selecting two metadata columns.
When("the metadata column with name {string} has been selected", async (columnName: string) => {
    const checkboxSelector = `${CSV_UPLOAD_PAGE_SELECTOR} input[type="checkbox"][id="metadata-${columnName}"]`;
    const checkbox = await $(checkboxSelector);
    await checkbox.click();
    await browser.pause(500);
});

// Step: Verify header row content in the Preview component.
Then(
    'the {string} component should contain a header row with name {string}',
    async (componentName: string, columnName: string) => {
        // Assumes the Preview component renders a table with a <thead> row.
        let selector = "";
        if (componentName === "Preview") {
            selector = `${PREVIEW_COMPONENT_SELECTOR} table thead tr`;
        } else {
            throw new Error(`Unknown component: ${componentName}`);
        }
        const headerRow = await $(selector);
        await headerRow.waitForExist({ timeout: 5000 });
        const headerText = await headerRow.getText();
        expect(headerText).toContain(columnName);
    }
);
Then ('the "Preview" component should contain HTML linebreaks not unescaped newlines', async () => {
        // Assumes the Preview component renders a table with a <thead> row.
        let selector = `${PREVIEW_COMPONENT_SELECTOR} table td`;
        const dataRows = await $$(selector);
        await dataRows[0].waitForExist({ timeout: 5000 });
        const cellText = await dataRows[0].getText(); 
        const cellHTML = await dataRows[0].getHTML(); // TIGHT-COUPLING: This assumes that the first cell of newline-test.csv contains text with linebreaks (with a \n in the CSV, which should be a <br> in the component under test).
        console.log('cellText: ', cellText);
        console.log('cellText length: ', await dataRows[0].getHTML());
        // Check if the text contains HTML linebreaks
        const hasLineBreaks = cellHTML.includes('<br />');
        // Check if the text does not contain unescaped newlines
        const hasUnescapedNewlines = cellText.includes('\\n');
        expect(hasLineBreaks).toBe(true);
        expect(hasUnescapedNewlines).toBe(false);
    }
);
Then(
    'the {string} component should be disabled',
    async (componentName: string) => {
        // Assumes the Preview component renders a table with a <thead> row.
        const selector = `[data-testid="${componentName
            .toLowerCase()
            .replace(/ /g, '-')}"]`;
        const component = await $(selector);
        await component.waitForExist({ timeout: 5000 });
        expect(component).toBeDisabled();
    }
);

Then(
    'the {string} component should be enabled',
    async (componentName: string) => {
        // Assumes the Preview component renders a table with a <thead> row.
        const selector = `[data-testid="${componentName
            .toLowerCase()
            .replace(/ /g, '-')}"]`;
        const component = await $(selector);
        await component.waitForExist({ timeout: 5000 });
        expect(component).toBeEnabled();
    }
);