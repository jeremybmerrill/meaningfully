import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $, $$ } from '@wdio/globals';


// Step: Enter a search query.
When("a search query has been entered", async () => {
    const searchInput = await $('[data-testid="search-bar"]');
    await searchInput.waitForExist({ timeout: 5000 });
    // Enter a sample query.
    await searchInput.setValue("test search query");
    await browser.pause(500);
});

When("no search query has been entered", async () => {
    const searchInput = await $('[data-testid="search-bar"]');
    await searchInput.waitForExist({ timeout: 5000 });
    // Enter a sample query.
    await searchInput.clearValue();
    await browser.pause(500);
});


// Step: Verify search button state.
Then("the search button is {string}", async (state: string) => {
    const searchButton = await $('[data-testid="search-button"]');
    await searchButton.waitForExist({ timeout: 5000 });
    const isDisabled = await searchButton.getAttribute("disabled");
    if (state === "disabled") {
        expect(isDisabled).not.toBeNull();
    } else if (state === "enabled") {
        expect(isDisabled).toBeNull();
    } else {
        throw new Error(`Unknown state: ${state}`);
    }
});

// Step: Click the search button.
When("the search button has been clicked", async () => {
    const searchButton = await $('[data-testid="search-button"]');
    await searchButton.waitForExist({ timeout: 5000 });
    await searchButton.click();
    // Allow search results to load.
    await browser.pause(1000);
});

// Step: Verify that the Results component has multiple rows.
// For this example, we assume that results are rendered as multiple <tr> elements within the Results component.
Then("the {string} component should have multiple rows shown", async (componentName: string) => {
    let selector = "";
    if (componentName === "Results") {
        // In your Results component, assume each result row has a common class or data attribute.
        // Adjust this selector to match your implementation.
        selector = '[data-testid="results"] tr';
    } else {
        throw new Error(`Unknown component for rows: ${componentName}`);
    }
    const rows = await $$(selector);
    // Expect at least 2 rows.
    expect(rows.length).toBeGreaterThan(1);
});

// Step: Click a result row modal button.
When("a result row modal button has been clicked", async () => {
    // In your Results component, assume each row has a button to open the modal with data-testid="result-modal-button".
    const modalButtons = await $('[data-testid="result-modal-button"]');
    // if (modalButtons.length === 0) {
    //     throw new Error("No modal button found in results.");
    // }
    // Click the first result modal button.
    await modalButtons.click();
    await browser.pause(1000);
});

// Step: Verify the details component is scrollable.
Then("the details component should be scrollable", async () => {
    const details = await $('[data-testid="details"]');
    await details.waitForExist({ timeout: 5000 });
    // Check that scrollHeight is greater than clientHeight.
    const scrollHeight = await details.getProperty("scrollHeight");
    const clientHeight = await details.getProperty("clientHeight");
    expect(scrollHeight).toBeGreaterThan(clientHeight);
});