var async = require('async');
var cheerio = require('cheerio');
var fs = require('fs');
var http = require('http');

var body = '';
var longReads = [];

for (var i = 3; i < 6; i++) {
	getLongReads(i);
}
// getLongReads(5);

function getLongReads(pageNum) {
	http.get('http://longreads.com/articles/search/?q=&page=' + pageNum, function(response) {
		response.on('data', function(d) {
			body += d;
		});
		response.on('end', function() {
			var $ = cheerio.load(body);
			$('div.article').each(function(i) {
				var title = $(this).find('a.article-title').text();
				title = title.trim().replace(/(^\s+|\s+$)/g,'');
				// console.log(i, title);
				var articleUrl = $(this).find('a.article-title').attr('href');
				// console.log(articleUrl);
				var author = $(this).find('div.article_details_left').children().first().text();
				author = author.replace(/[^\s]*\s/, '');
				// console.log(author);
				var source = $(this).find('div.article_details_left').children().last().text();
				source = source.replace(/[^\s]*\s/, '');
				// console.log(source);
				var pubDate = $(this).find('div.article_details_right').children().first().text();
				pubDate = pubDate.trim().replace(/[^\s]*\s+/, '');
				// console.log(pubDate);
				var length = $(this).find('div.article_details_right').children().last().text();
				minuteLength = length.trim()
					.replace(/\([^)]*\)/, '')
					.replace(/[^\d]+/, '');
				// console.log(minuteLength);
				wordLength = length.match(/\(([^)]+)\)/)[1];
				// console.log(wordLength);
				longReads.push({
					title: title,
					articleUrl: articleUrl,
					author: author,
					source: source,
					pubDate: pubDate,
					minuteLength: minuteLength,
					wordLength: wordLength
				});
			});
			fs.writeFileSync('longReads.json', JSON.stringify(longReads));
			// console.log(longReads);
		});
	});
}
