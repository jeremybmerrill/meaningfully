Feature: Search page

  Background: 
    Given the application has started
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

  Scenario: Verify initial components are displayed
    Given the app is navigated to the "Test Dataset 1" dataset link
    Then the "Document Set name" component should be visible
    And the "Search bar" component should be visible
    And the "Search button" component should be visible

  Scenario: Verify search button is disabled if there is no query
    Given the app is navigated to the "Test Dataset 1" dataset link
    And no search query has been entered
    Then the "Search button" component should be visible
    And the "Search button" component should be disabled

  @ifquery
  Scenario: Verify search button is enabled if there is a query
    Given the app is navigated to the "Test Dataset 1" dataset link
    And a search query has been entered
    Then the "Search button" component should be enabled

  @verifyresults
  Scenario: Verify results are shown
    Given the app is navigated to the "Test Dataset 1" dataset link
    And a search query has been entered
    And the "search" button has been clicked
    Then the "Results" component should be visible
    And the "Results" component should have multiple rows shown

  @resultmodal
  Scenario: Verify the result modal is shown
    Given the app is navigated to the "Test Dataset 1" dataset link
    And a search query has been entered
    And the "search" button has been clicked
    And a result row modal button has been clicked
    Then the "Details" component should be visible
    # And the details component should be scrollable # can't be handled by the current test case whose text is too short to need scrolling

  @csvdownload
  Scenario: Verify download CSV button works
    Given the app is navigated to the "Test Dataset 1" dataset link
    And a search query has been entered
    And the "search" button has been clicked
    Then the "Download CSV button" component should be enabled
    When the "Download CSV" button has been clicked
    Then a CSV file named "results.csv" should be downloaded