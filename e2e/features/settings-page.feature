Feature: Settings Page

  Background: 
    Given the application has started
    And the settings store is empty
    And the app is navigated to the 'Settings / API Keys' link

  Scenario: OpenAI API Key value is empty if settings store is empty
    Then the "OpenAI API Key input" component should be visible
    And the "OpenAI API Key input" component should be empty

  Scenario: new OpenAI API Key values are persisted and masked
    When the OpenAI API Key value is set on the page
    And the "Save" component has been clicked
    And the app is navigated to the 'Settings / API Keys' link
    Then the "OpenAI API Key input" component should be visible
    And the text of the "OpenAI API Key input" component is masked
    And the text of the "OpenAI API Key input" component is a masked version of the set value.

  Scenario: after save, the app is navigated back to the home page
    When the OpenAI API Key value is set on the page
    And the "Save" component has been clicked
    Then the "Upload a Spreadsheet" component should be visible
    And the "Existing Spreadsheets" component should be visible