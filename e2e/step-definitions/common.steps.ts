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


// These depend on the idea that the Feature file specifies a name that,
// by convention, is the same as the data-testid attribute in the component
// subject to lowercasing and spaces-to-dashes.
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

// Navigation step: go to the search page.
// Adjust the URL as needed for your Electron app.
Given("the app is navigated to the {string} link", async (linkText: string) => {
    // Example: navigate to a search page with a document set id of 1.
    const settingsLink = await $('.navbar').$(`a*=${linkText}`);
    await settingsLink.click();
    // Wait for the search bar to be displayed as indicator of page load.
});
