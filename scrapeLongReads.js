var async = require('async');
var cheerio = require('cheerio');
var fs = require('fs');
var http = require('http');
var MongoClient = require('mongodb').MongoClient

var url = 'mongodb://localhost:27017/test';
var longReads = [];
var pageNum = 1;

// connect to mongodb
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Connected correctly to server");

  var collection = db.collection('longreads');
  collection.ensureIndex( "title", {sparse: true, unique: true}, function() {
    // initiate get request with pageNum = 1 and collection = longreads
    getLongReads(pageNum, collection);
  });
// db.close();
});

function getLongReads(pageNum, collection) {
  var body = '';

  http.get('http://longreads.com/articles/search/?q=&page=' + pageNum, function(response) {
    response.on('data', function(d) {
      body += d;
    });
    response.on('end', function() {
      var $ = cheerio.load(body);
      $('div.article').each(function(i) {
        var title = $(this).find('a.article-title').text();
        // console.log(i, title);
        var articleUrl = $(this).find('a.article-title').attr('href');
        // console.log(articleUrl);
        var author = $(this).find('div.article_details_left div:first-child').text();
        // console.log(author);
        var source = $(this).find('div.article_details_left div:nth-child(2)').text();
        // console.log(source);
        var pubDate = $(this).find('div.article_details_right div:nth-child(1)').text();
        // console.log(pubDate);
        var length = $(this).find('div.article_details_right div:nth-child(2)').text();
        // console.log(length)
        longReads.push({
          title: title.trim(),
          articleUrl: articleUrl,
          author: format(author),
          source: format(source),
          pubDate: format(pubDate),
          minuteLength: getMinuteLength(length),
          wordLength: getWordLength(length)
        });
      });
      insertRecord(longReads, collection);
    });
  });
}

function insertRecord(data, collection) {
  collection.insertMany(data, function(err, result) {
    if (err) throw err;
    console.log(result);
    while (pageNum <= 5) {
      longReads = [];
      // increment pageNum and call get longReads
      pageNum++
      getLongReads(pageNum, collection);
    }
  });
}

function format(str) {
  return str.replace(/^\S+\s|\s+$/g, '');
}

function getMinuteLength(str) {
  return str.match(/[\d]+\sminutes/) ? str.match(/[\d]+\sminutes/)[0] : null;
}

function getWordLength(str) {
  return str.match(/\(([^)]+)\)/) ? str.match(/\(([^)]+)\)/)[1] : null;
}