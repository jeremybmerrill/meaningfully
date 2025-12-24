import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $$, $ } from '@wdio/globals';

Given("the application has started", async () => {
    // WebdriverIO Electron service typically handles app launch automatically.
    // You might add a small wait here if needed for the UI to stabilize.
    await browser.pause(500); // Optional: Adjust as needed
});

Given("the page has been reloaded", async () => {
    // Reload the current page  
    // await browser.reloadSession();
    const currentUrl = await browser.getUrl();
    await browser.url(currentUrl);
});


// Step: Simulate clicking the Save button.
When('the {string} component has been clicked', async (componentName: string) => {
    let selector: string  = `[data-testid="${componentName.toLowerCase().replace(/ /g, '-')}"]`;
    const btn = await $(selector);
    await btn.waitForDisplayed({ timeout: 5000 });
    await btn.click();
    await browser.pause(500);
});


// Step: Simulate clicking the Save button.
When('the {string} component has been clicked, waiting {int}', async (componentName: string, waitTime: number) => {
    let selector: string  = `[data-testid="${componentName.toLowerCase().replace(/ /g, '-')}"]`;
    const btn = await $(selector);
    await btn.waitForDisplayed({ timeout: 5000 });
    await btn.click();
    await browser.pause(waitTime);
});


// These depend on the idea that the Feature file specifies a name that,
// by convention, is the same as the data-testid attribute in the component
// subject to lowercasing and spaces-to-dashes.
Then("the {string} component should be visible", async (componentName: string) => {
    let selector: string  = `[data-testid="${componentName.toLowerCase().replace(/ /g, '-')}"]`;
    const component = await $(selector);
    await component.waitForDisplayed({ timeout: 5000 });
    await expect(component).toBeDisplayed();
});

Then("the {string} component should not be visible", async (componentName: string) => {
    let selector: string  = `[data-testid="${componentName.toLowerCase().replace(/ /g, '-')}"]`;
    const component = await $(selector);
    await expect(component).not.toBeDisplayed();
});

// Navigation step: go to the search page.
// Adjust the URL as needed for your Electron app.
Given("the app is navigated to the {string} navbar link", async (linkText: string) => {
    // Example: navigate to a search page with a document set id of 1.
    const settingsLink = await $('.navbar').$(`a*=${linkText}`);
    await settingsLink.click();
    await browser.pause(200);
    // Wait for the search bar to be displayed as indicator of page load.
});

const DATASET_ROW_SELECTOR = '[data-testid="existing-spreadsheet-row"]'; // Selector for a single dataset row/item
Given("the app is navigated to the {string} dataset link", async (linkText: string) => {
    // Example: navigate to a search page with a document set id of 1.
    //const settingsLink =  await (await $$(DATASET_ROW_SELECTOR).filter((elem) => !!elem.$(`a*=${linkText}`))).map((row) => row.$(`a*=${linkText}`) )[0];
    //const datasetLink = await $(`a*=${linkText}`);
    const anchorElement = await $(`a=${linkText}`);    
    await anchorElement.click();
    await browser.pause(500);
    // const datasetRow = await $$(DATASET_ROW_SELECTOR);
    // const filteredRows = await datasetRow.filter((elem) => !!elem.$(`a*="${linkText}"`));
    // if (filteredRows.length === 0) {
    //     throw new Error(`No link found with text: ${linkText}`);
    // }
    // const link = await filteredRows[0].$(`a*=${linkText}`);
    // await link.waitForDisplayed({ timeout: 5000 });
    // await link.click();
    // Wait for the search bar to be displayed as indicator of page load.
});

When("the {string} component has been set to {string}", async (componentName: string, val: string) => {
    let selector = `[data-testid="${componentName.toLowerCase().replace(/ /g, '-')}"]`;
    const input = await $(selector);
    await input.waitForDisplayed({ timeout: 5000 });
    // Clear existing value and set a new one.
    await input.clearValue();
    // Provide a new key value.
    await input.setValue(val);
    await browser.pause(500);
});

