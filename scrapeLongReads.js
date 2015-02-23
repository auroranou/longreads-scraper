var async = require('async');
var cheerio = require('cheerio');
var fs = require('fs');
var http = require('http');

var body = '';
var longReads = [];

// async.eachSeries(array, iterator, callback);
var arr = [1,2,3,99,78,212,350,456,560]
// var arr = [1,2]
async.eachSeries(arr, function(i, callback){
  getLongReads(i);
  callback();
});

function getLongReads(pageNum) {
  http.get('http://longreads.com/articles/search/?q=&page=' + pageNum, function(response) {
    response.on('data', function(d) {
      body += d;
    });
    response.on('end', function() {
      var $ = cheerio.load(body);
      $('div.article').each(function(i) {
        var title = $(this).find('a.article-title').text();
        // console.log(title);
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
      // db.longreadsdb.insert(longReads);
    });
    fs.writeFileSync('longReads.json', JSON.stringify(longReads));
    console.log(longReads.length);
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