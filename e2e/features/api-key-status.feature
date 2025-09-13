Feature: API Key Status Banner

  Scenario: Verify API Key Status Banner is shown if setting store is empty
    Given the application has started
    When the settings store is empty
    And the page has been reloaded
    Then the "API Key Status" component should be visible

  Scenario: Verify API Key Status Banner is not shown if API Key is set
    Given the application has started
    When the setting store has an OpenAI API Key value    
    And the page has been reloaded
    Then the "API Key Status" component should not be visible
