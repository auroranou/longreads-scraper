let cheerio = require('cheerio');
let MongoClient = require('mongodb').MongoClient;
let request = require('request');

// Load environment variables first
require('dotenv').config();

// Connect to the database, either a local instance or the production version 
dbConnect();

function dbConnect(){
  let url = process.env.MONGODB_URL || 'mongodb://localhost:27017/test';

  MongoClient.connect(url, (err, db) => {
    if (err) throw err;
    console.log('connected correctly to server');

    // Initialize the collection
    let collection = db.collection('articles');
    collection.createIndex('title', {
      sparse: true,
      unique: true
    });

    getLongReads(1, (err, articles) => {
      try {
        collection.insert(articles, (err, res) => {
          console.log(err, res);
          db.close();
        });
      } catch(e) {
        console.log(e);
      }
    });
  });
}

function getLongReads(pageNum, callback) {
  let articles = [];

  let options = {
    uri: 'https://longreads.com/',
    method: 'GET',
    qs: {
      'page': pageNum
    }
  }

  request(options, (err, res, body) => {
    if (err) throw new Error(err);

    let $ = cheerio.load(body);
    console.log('loading', pageNum);

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
    console.log(articles);
    return callback(null, articles);
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
