var cheerio = require('cheerio');
var http = require('http');
var MongoClient = require('mongodb').MongoClient;

dbConnect();

function dbConnect(){
  var url = 'mongodb://localhost:27017/test';
  
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log('connected correctly to server');

    var collection = db.collection('longreads');
    collection.ensureIndex('title', {sparse: true, unique: true}, function() {
      for (var i = 0; i < 20; i++) {
        // if (i > 4) {
        //   db.close();
        //   return;
        // } 
        (function() {
          getLongReads(i + 1, function(err, data) {
            if (err) throw err;
            collection.insert(data, function(err, response) {
              if (err) throw err;
            });
          });
        }(i));
      }
    });
  });
}

function getLongReads(pageNum, callback) {
  var body = '';
  var longReads = [];
  var url = 'http://longreads.com/?q=&page=';

  http.get(url + pageNum, function(response) {
    response.on('data', function(d) {
      body += d;
    });
    response.on('end', function() {
      var $ = cheerio.load(body);
      console.log('loading ', url, pageNum);
      $('div.our-picks div.article').each(function(i) {
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
      return callback(null, longReads);
    });
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
  return length.match(/[\d]+/) ? parseInt(length.match(/[\d]+/)[0]) : null;
}

function getWordLength(data) {
  var length = data.find('div.article_details_right div:nth-child(2)').text();
  return length.match(/\(([^)]+)\)/) ? length.match(/\(([^)]+)\)/)[1] : null;
}