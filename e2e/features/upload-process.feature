Feature: Upload page

  Scenario: Verify upload page is shown once a file is selected
    Given the application has started
    And a file has been selected in the "Upload a Spreadsheet" component
    Then the "CSV Upload Settings" component should be visible
    And the "Preview" component should not be visible

  Scenario: Verify preview is shown if a column is selected
    Given the application has started
    And a file has been selected in the "Upload a Spreadsheet" component
    And the column "paragraph" has been selected as column to embed
    Then the "CSV Upload Settings" component should be visible
    And the "Preview" component should be visible
    And the "Cost Estimate" component should be visible
    And the "Preview" component should contain a header row with name "paragraph"
    And the "Preview" component should contain HTML linebreaks not unescaped newlines

  Scenario: Verify metadata columns are shown if metadata columns are selected
    Given the application has started
    And a file has been selected in the "Upload a Spreadsheet" component
    And the column "paragraph" has been selected as column to embed
    And the metadata column with name "font-size" has been selected 
    And the metadata column with name "cik" has been selected 
    Then the "CSV Upload Settings" component should be visible
    And the "Preview" component should be visible
    And the "Preview" component should contain a header row with name "font-size"
    And the "Preview" component should contain a header row with name "cik"

  Scenario: Verify upload button is disabled if no column is selected
    Given the application has started
    # todo there needs to be a navigation to the homepage first, to reset things.
    And a file has been selected in the "Upload a Spreadsheet" component
    And no column has been selected as column to embed
    Then the "CSV Upload Settings" component should be visible
    And the "Preview" component should not be visible
    And the "Upload button" component should be disabled

  Scenario: Verify upload button is enabled if a column is selected
    Given the application has started
    And a file has been selected in the "Upload a Spreadsheet" component
    And the column "paragraph" has been selected as column to embed
    Then the "CSV Upload Settings" component should be visible
    And the "Preview" component should be visible
    And the "Upload button" component should be enabled

