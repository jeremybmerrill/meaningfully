# Feature: Search page

#   Scenario: Verify initial components are displayed
#     Given the application has started
#     And the app is navigated to the 'Settings' link.
#     Then the "Document Set name" component should be visible
#     And the "Search bar" component should be visible

#   Scenario: Verify search button is disabled if there is no query
#     Given the application has started
#     And the app is navigated to the 'Settings' link.
#     Then the search button is disabled

#   Scenario: Verify search button is disabled if there is no query
#     Given the application has started
#     And the app is navigated to the 'Settings' link.
#     And a search query has been entered
#     Then the search button is enabled

#   Scenario: Verify results are shown
#     Given the application has started
#     And the app is navigated to the 'Settings' link.
#     And a search query has been entered
#     And the saerch button has been clicked
#     Then the "Results" component should be visible
#     And the "Results" component should have multiple rows shown

#   Scenario: Verify results are shown
#     Given the application has started
#     And the app is navigated to the 'Settings' link.
#     And a search query has been entered
#     And the saerch button has been clicked
#     And a result row modal button has been clicked
#     Then the details component should be visible
#     And the details component should be scrollable