import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $$, $ } from '@wdio/globals';

Given("the application has started", async () => {
    // WebdriverIO Electron service typically handles app launch automatically.
    // You might add a small wait here if needed for the UI to stabilize.
    await browser.pause(500); // Optional: Adjust as needed
});

// TODO DRY 
Given("the page has been reloaded", async () => {
    // Reload the current page  
    // await browser.reloadSession();
    const currentUrl = await browser.getUrl();
    await browser.url(currentUrl);
});

Then("the {string} component should be visible", async (componentName: string) => {
    let selector: string  = `[data-testid="${componentName.toLowerCase().replace(/ /g, '-')}"]`;
    const component = await $(selector);
    await expect(component).toBeDisplayed();
});

Then("the {string} component should not be visible", async (componentName: string) => {
    let selector: string  = `[data-testid="${componentName.toLowerCase().replace(/ /g, '-')}"]`;
    const component = await $(selector);
    await expect(component).not.toBeDisplayed();
});