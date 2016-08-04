let cheerio = require('cheerio');
let Promise = require('bluebird');
let mongodb = Promise.promisifyAll(require('mongodb'));
let MongoClient = Promise.promisifyAll(mongodb.MongoClient);
let request = Promise.promisifyAll(require('request'), { multiArgs: true });

// Load environment variables first
require('dotenv').config();

let url = process.env.MONGODB_URL || 'mongodb://localhost:27017/test';
let numPages = process.env.NUM_PAGES || 20;

MongoClient.connectAsync(url).then((db) => {
  let articlesCollection = db.collection('articles');

  getLongReads(1).then((arr) => {

    return Promise.each(arr, (el) => {
      return articlesCollection.update({
        title: el.title
      }, el, {
        upsert: true
      });
    });

  }).then(()=> {
    db.close();
  }, (err) => {
    console.log('Error 1: ', err);
  });
}, (err) => {
  console.log('Error 2: ', err);
});

function getLongReads(pageNum) {
  let articles = [];

  let options = {
    uri: 'https://longreads.com/',
    method: 'GET',
    qs: {
      'page': pageNum
    }
  }

  return new Promise((resolve, reject) => {
    request.getAsync(options).then((res) => {
      let $ = cheerio.load(res[1]);

      $('div.our-picks div.article').each(function(i) {
        articles.push({
          author: getAuthor($(this)),
          minutes: getMinuteLength($(this)),
          pubDate: getPubDate($(this)),
          source: getSource($(this)),
          title: getTitle($(this)),
          url: getArticleUrl($(this)),
          words: getWordLength($(this))
        });
      });

      resolve(articles);
    }, (err) => {
      reject(err);
    });
  });
}

function getAuthor(data) {
  let author = data.find('div.article_details_left div:first-child').text();
  return author.replace(/^\S+\s|\s+$/g, '');
}

function getMinuteLength(data) {
  let length = data.find('div.article_details_right div:nth-child(2)').text();
  return length.match(/[\d]+/) ? parseInt(length.match(/[\d]+/)[0]) : null;
}

function getPubDate(data) {
  let date = data.find('div.article_details_right div:nth-child(1)').text();
  return date.replace(/^\S+\s|\s+$/g, '').trim();
}

function getSource(data) {
  let source = data.find('div.article_details_left div:nth-child(2)').text();
  return source.replace(/^\S+\s|\s+$/g, '');
}
function getTitle(data) {
  return data.find('a.article-title').text().trim();
}

function getArticleUrl(data) {
  return data.find('a.article-title').attr('href');
}

function getWordLength(data) {
  let length = data.find('div.article_details_right div:nth-child(2)').text();
  if (length.match(/\(([^)]+)\)/)) {
    length = length.match(/\(([^)]+)\)/)[1];
    return length.substr(0, length.indexOf(' '));
  } else {
    return null; 
  }
}
