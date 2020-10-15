Feature: Yahoo Search
	As a user of Yahoo Search
	I should be able to search for a word
	to get information about the topic

	Scenario: Search for an apple
		Given I navigate to the "yahoo/search" page
		And I am on the "yahoo/search" page
		When I enter "apple fruit" into the search box
		And click on 'Search Web'
		Then I am on the "apple fruit" yahoo search results page
		And take a screenshot with error

	Scenario: Search for a city
		Given I navigate to the "yahoo/search" page
		And I am on the "yahoo/search" page
		When I enter "city" into the search box
		And click on 'Search Web'
		Then I am on the "city" yahoo search results page
		And take a screenshot

	Scenario: Search for Yahoo stocks
		Given I navigate to the "yahoo/search" page
		And I am on the "yahoo/search" page
		When I enter "yahoo stock" into the search box
		And click on 'Search Web'
		Then I am on the "yahoo stock" yahoo search results page
		And take a screenshot with id "33"

