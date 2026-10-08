import { Given, When, Then } from '@wdio/cucumber-framework';
import path from 'path';
import { expect, $$, $ } from '@wdio/globals';

// Selectors – adjust these if needed.
const CSV_UPLOAD_PAGE_SELECTOR = '[data-testid="csv-upload-settings"]';
const PREVIEW_COMPONENT_SELECTOR = '[data-testid="preview"]';

const TEST_CSV_FILE_NAME = "newline-test.csv"; // The name of the test CSV file to use.
const TEST_LARGE_CSV_FILE_NAME = "complaints-2025-09-03_09_25.csv"; // a large CSV file
// Step: Simulate file selection using the test CSV file.
Given(
    "a file has been selected in the {string} component", 
    async (componentName: string) => {
        // Locate the file input inside the specified component.
        const fileInputSelector = `[data-testid="${componentName
            .toLowerCase()
            .replace(/ /g, '-')}"] input[type="file"]`;
        const fileInput = await $(fileInputSelector);
        // The upload zone hides its native <input type="file">; unhide it so WebDriver can set its value.
        await browser.execute((el) => el.classList.remove('hidden'), fileInput);
        // Resolve path to the test CSV file.
        const filePath = path.resolve(process.cwd(), `e2e/test-storage/${TEST_CSV_FILE_NAME}`);
        // Upload the file (this copies the file to a temporary location on the Selenium server).
        const remoteFilePath = await browser.uploadFile(filePath);
        await fileInput.setValue(remoteFilePath);
        // Allow time for the file selection to process.
        await browser.pause(1000);
    }
);


// Step: Simulate file selection using the test CSV file.
Given(
    "a large file has been selected in the {string} component", 
    async (componentName: string) => {
        // Locate the file input inside the specified component.
        const fileInputSelector = `[data-testid="${componentName
            .toLowerCase()
            .replace(/ /g, '-')}"] input[type="file"]`;
        const fileInput = await $(fileInputSelector);
        // The upload zone hides its native <input type="file">; unhide it so WebDriver can set its value.
        await browser.execute((el) => el.classList.remove('hidden'), fileInput);
        // Resolve path to the test CSV file.
        const filePath = path.resolve(process.cwd(), `e2e/test-storage/${TEST_LARGE_CSV_FILE_NAME}`);
        // Upload the file (this copies the file to a temporary location on the Selenium server).
        const remoteFilePath = await browser.uploadFile(filePath);
        await fileInput.setValue(remoteFilePath);
        // Allow time for the file selection to process.
        await browser.pause(1000);
    }
);

// Step: Simulate choosing a column to embed.
// Columns are sorted into bins by drag and drop, or by clicking a column's card and then
// choosing a bin from the menu that appears. WebDriver can't reliably drive HTML5 drag and drop,
// so these steps use the click path.
const moveColumnToBin = async (columnName: string, bin: "text" | "search" | "show" | "none") => {
    const chip = await $(`${CSV_UPLOAD_PAGE_SELECTOR} [data-testid="column-chip-${columnName}"]`);
    await chip.waitForDisplayed({ timeout: 5000 });
    await chip.click();
    const destination = await $(`${CSV_UPLOAD_PAGE_SELECTOR} [data-testid="column-move-menu"] [data-testid="move-to-${bin}"]`);
    await destination.waitForDisplayed({ timeout: 5000 });
    await destination.click();
    await browser.pause(500);
};

When("the column {string} has been selected as column to embed", async (columnName: string) => {
    await moveColumnToBin(columnName, "text");
});
When("no column has been selected as column to embed", async () => {
    const chips = await $$(`${CSV_UPLOAD_PAGE_SELECTOR} [data-testid="column-bin-text"] [data-column-chip]`);
    for (const columnName of await chips.map(chip => chip.getAttribute("data-column-chip"))) {
        await moveColumnToBin(columnName, "none");
    }
});

// Step: put a column in the "Details to show only" bin.
When("the metadata column with name {string} has been selected", async (columnName: string) => {
    await moveColumnToBin(columnName, "show");
});

When("the text column with name {string} has been selected", async (columnName: string) => {
    await moveColumnToBin(columnName, "text");
});

// Step: put a column in the "Additional details to search and show" bin.
When("the metadata column with name {string} has been selected to also be searched", async (columnName: string) => {
    await moveColumnToBin(columnName, "search");
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
        await headerRow.waitForDisplayed({ timeout: 5000 });
        const headerText = await headerRow.getText();
        expect(headerText).toContain(columnName);
    }
);
Then ('the "Preview" component should contain HTML linebreaks not unescaped newlines', async () => {
        // Assumes the Preview component renders a table with a <thead> row.
        let selector = `${PREVIEW_COMPONENT_SELECTOR} table td`;
        const dataRows = await $$(selector);
        await dataRows[0].waitForDisplayed({ timeout: 5000 });
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
        await component.waitForDisplayed({ timeout: 5000 });
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
        await component.waitForDisplayed({ timeout: 5000 });
        expect(component).toBeEnabled();
    }
);