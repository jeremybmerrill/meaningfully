Feature: Upload page

  Background: 
    Given the application has started
    And the app is navigated to the "Home" link

    # TODO: this should be in a background step
    And the settings store is empty 
    And the app is navigated to the 'Settings / API Keys' link
    And the uploadCsv function has been mocked
    And the OpenAI API Key value is set on the page
    And the "Save" component has been clicked

    And the app is navigated to the "Home" link

  Scenario: Verify upload page is shown once a file is selected
    When a file has been selected in the "Upload a Spreadsheet" component
    Then the "CSV Upload Settings" component should be visible
    And the "Preview" component should not be visible

  Scenario: Verify preview is shown if a column is selected
    When a file has been selected in the "Upload a Spreadsheet" component
    And the column "paragraph" has been selected as column to embed
    Then the "CSV Upload Settings" component should be visible
    And the "Preview" component should be visible
    And the "Cost Estimate" component should be visible
    And the "Preview" component should contain a header row with name "paragraph"
    And the "Preview" component should contain HTML linebreaks not unescaped newlines

  Scenario: Verify metadata columns are shown if metadata columns are selected
    When a file has been selected in the "Upload a Spreadsheet" component
    And the column "paragraph" has been selected as column to embed
    And the metadata column with name "font-size" has been selected 
    And the metadata column with name "cik" has been selected 
    Then the "CSV Upload Settings" component should be visible
    And the "Preview" component should be visible
    And the "Preview" component should contain a header row with name "font-size"
    And the "Preview" component should contain a header row with name "cik"

  Scenario: Verify upload button is disabled if no column is selected
    When a file has been selected in the "Upload a Spreadsheet" component
    And no column has been selected as column to embed
    Then the "CSV Upload Settings" component should be visible
    And the "Preview" component should not be visible
    And the "Upload button" component should be disabled

  Scenario: Verify upload button is enabled if a column is selected
    When a file has been selected in the "Upload a Spreadsheet" component
    And the column "paragraph" has been selected as column to embed
    Then the "CSV Upload Settings" component should be visible
    And the "Preview" component should be visible
    And the "Upload button" component should be enabled

  @largefile
  Scenario: Verify upload page is shown once a file is selected
    When a large file has been selected in the "Upload a Spreadsheet" component
    Then the "CSV Upload Settings" component should be visible
    And the "Preview" component should not be visible
