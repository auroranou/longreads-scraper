# Data scraping with http + cheerio

This script parses article information from the Longreads source code and saves it as BSON to a Mongo database. It is used to power the REST API I built [here](https://longreads-api.herokuapp.com/).

## Technologies used:
+ node.js
+ MongoDB
+ http module for requests
+ cheerio module for DOM traversal/data retrieval

## Running locally
First, make sure MongoDB is installed locally. Instructions to install the Community Edition for various platforms are available [here](https://docs.mongodb.com/manual/administration/install-community/).

On OS X El Capitan, you can set up a local Mongo instance using Homebrew:
```
brew install mongodb
```

Create the default directory that the `mongod` process will use for writing data, `/data/db`:
```
sudo mkdir -p /data/db
```

Once the `/data/db` directory has been created, you'll likely need to update permissions:
```
sudo chmod 0755 /data/db
sudo chown $USER /data/db
```

At this point, you should be able to run [`mongod`](https://docs.mongodb.com/manual/reference/program/mongod/) to start the MongoDB daemon.
