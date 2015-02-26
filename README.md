# Data scraper for Longreads.com

This script parses article information from the Longreads source code and saves it as BSON to a Mongo database. It is used to power the REST API I built [here](https://longreads-api.herokuapp.com/).

## Technologies used:
+ node.js
+ MongoDB
+ http module for requests
+ cheerio module for DOM traversal/data retrieval

## Suggestions for improvement:
Currently the scraper retrieves only basic article information. More sophisticated data, such as descriptions or tags, is not supported. 