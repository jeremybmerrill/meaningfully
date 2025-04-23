Feature: Initial Application View

  Scenario: Verify initial components are displayed
    Given the application has started
    Then the "Upload a Spreadsheet" component should be visible
    And the "Existing Spreadsheets" component should be visible

  Scenario: Verify empty state for Existing Spreadsheets
    Given the application has started
    And the metadata store is empty
    And the page has been reloaded
    Then the "Existing Spreadsheets" component should be visible
    And no datasets should be listed

  Scenario: Verify Existing Spreadsheets with data
    Given the application has started
    And the metadata store contains 3 entries
    And the page has been reloaded
    Then the "Existing Spreadsheets" component should be visible
    And 3 datasets should be listed