# Data scraping with http + cheerio

This script parses article information from the Longreads source code and saves it as BSON to a Mongo database. It is used to power the REST API I built [here](https://longreads-api.herokuapp.com/).

## Technologies used:
+ node.js
+ MongoDB
+ http module for requests
+ cheerio module for DOM traversal/data retrieval

## Future additions?
Currently the scraper retrieves only basic article information, limited to: title, author, source, publication date, and length. More sophisticated data, such as articles descriptions or tags, is not supported. 