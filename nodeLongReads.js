var cheerio = require('cheerio');
var http = require('http');
var MongoClient = require('mongodb').MongoClient;

var longReads = [];
var url = 'mongodb://localhost:27017/test';

dbConnect();

function dbConnect(){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log('connected correctly to server');

    var collection = db.collection('longreads');
    collection.ensureIndex('title', {sparse: true, unique: true}, function() {
      getLongReads(1, collection);
    });
  });
}

function getLongReads(pageNum, collection) {
  var body = '';
  http.get('http://longreads.com/articles/search/?q=&page=' + pageNum, function(response) {
    response.on('data', function(d) {
      body += d;
    });
    response.on('end', function() {
      var $ = cheerio.load(body);
      $('div.article').each(function(i) {
        longReads.push({
          title: getTitle($(this)),
          articleUrl: getArticleUrl($(this)),
          author: getAuthor($(this)),
          source: getSource($(this)),
          pubDate: getPubDate($(this)),
          minuteLength: getMinuteLength($(this)),
          wordLength: getWordLength($(this))
        });
      });
      insertRecord(longReads, collection);
      //  getLongReads(pageNum++, collection);
    });
  });
}

function insertRecord(data, collection) {
  collection.insert(data, function(err, response) {
    if (err) throw err;
    // console.log(response);
  });
}

function getTitle(data) {
  var title = data.find('a.article-title').text();
  return title.trim();
}

function getArticleUrl(data) {
  var articleUrl = data.find('a.article-title').attr('href');
  return articleUrl;
}

function getAuthor(data) {
  var author = data.find('div.article_details_left div:first-child').text();
  return author.replace(/^\S+\s|\s+$/g, '');
}

function getSource(data) {
  var source = data.find('div.article_details_left div:nth-child(2)').text();
  return source.replace(/^\S+\s|\s+$/g, '');
}

function getPubDate(data) {
  var pubDate = data.find('div.article_details_right div:nth-child(1)').text();
  return pubDate.replace(/^\S+\s|\s+$/g, '');
}

function getMinuteLength(data) {
  var length = data.find('div.article_details_right div:nth-child(2)').text();
  return length.match(/[\d]+/) ? length.match(/[\d]+/)[0] : null;
}

function getWordLength(data) {
  var length = data.find('div.article_details_right div:nth-child(2)').text();
  return length.match(/\(([^)]+)\)/) ? length.match(/\(([^)]+)\)/)[1] : null;
}