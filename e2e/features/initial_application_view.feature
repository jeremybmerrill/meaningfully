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

  Scenario: Verify Existing Spreadsheets with 1 dataset
    Given the application has started

    # set an API key
    
    And the settings store is empty 
    And the app is navigated to the 'Settings / API Keys' link
    And the uploadCsv function has been mocked
    And the OpenAI API Key value is set on the page
    And the "Save" component has been clicked

    And a file has been selected in the "Upload a Spreadsheet" component
    And the column "paragraph" has been selected as column to embed
    And the metadata column with name "font-size" has been selected 
    And the metadata column with name "cik" has been selected
    And the "Dataset Name input" component has been set to "Test Dataset 1"
    And the "Upload button" component has been clicked
    And the app is navigated to the "Home" link
    Then the "Existing Spreadsheets" component should be visible
    And 1 datasets should be listed

    And the dataset "Test Dataset 1" should be listed

    # And the page has been reloaded
    # Then the "Existing Spreadsheets" component should be visible
    # And 2 datasets should be listed
    # And the dataset "Test Dataset 1" should be listed
    # And the dataset "Test Dataset 2" should be listed