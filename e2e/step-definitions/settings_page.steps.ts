import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $ } from '@wdio/globals';

// Selectors
const OPENAI_API_KEY_INPUT = '[data-testid="openai-api-key-input"]';
const SAVE_BUTTON = '[data-testid="save"]';
const FAKE_API_KEY = "sk-proj-meaningfullytesting-1234567890123456789012345678901234567890"

// Step: Simulate entering an OpenAI API Key on the page.
When("the OpenAI API Key value is set on the page", async () => {
    const input = await $(OPENAI_API_KEY_INPUT);
    await input.waitForDisplayed({ timeout: 5000 });
    // Clear existing value and set a new one.
    await input.clearValue();
    // Provide a new key value.
    await input.setValue(FAKE_API_KEY);
    await browser.pause(500);
});

// // Step: Simulate clicking the Save button.
// When('the "Save" component has been clicked', async () => {
//     const btn = await $(SAVE_BUTTON);
//     await btn.waitForDisplayed({ timeout: 5000 });
//     await btn.click();
//     await browser.pause(500);
// });

Then('the {string} component should be empty', async (componentName: string) => {
    let selector = `[data-testid="${componentName.toLowerCase().replace(/ /g, '-')}"]`;
    const input = await $(selector);
    await input.waitForDisplayed({ timeout: 5000 });
    const value = await input.getValue();
    // Verify that the input is empty.
    expect(value).toBe("");
});

// Then: Verify that the OpenAI API Key's text is masked.
Then('the text of the {string} component is masked', async (componentName: string) => {
    let selector = `[data-testid="${componentName.toLowerCase().replace(/ /g, '-')}"]`;
    const input = await $(selector);
    await input.waitForDisplayed({ timeout: 5000 });
    const value = await input.getValue();
    // We assume the masking inserts "*******" into the displayed value.
    expect(value).toContain("*******");
});

// Then: Verify that the text of the "OpenAI API Key input" component is a masked version of the set value.
Then('the text of the {string} component is a masked version of the set value.', async (componentName: string) => {
    // This step may be similar to the previous, but you can add further checks if needed.
    let selector = `[data-testid="${componentName.toLowerCase().replace(/ /g, '-')}"]`;
    const input = await $(selector);
    await input.waitForDisplayed({ timeout: 5000 });
    const value = await input.getValue();
    // Check that the value both contains "*******" and does not equal the plain key.
    expect(value).toContain("*******");
    expect(value).not.toEqual(FAKE_API_KEY);
});