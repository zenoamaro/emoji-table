var os = require('os');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var request = require('request');

var url = 'http://www.unicode.org/emoji/charts/full-emoji-list.html';
var dest = path.join(__dirname, '..', 'dist');
var catalog = path.join(dest, 'emoji.json');

var columns = [
	{ index: 1, name:'code',    transform:parseText    },
	{ index: 2, name:'emoji',   transform:parseText    },
	{ index:12, name:'name',    transform:parseText    },
	{ index:13, name:'version', transform:parseVersion },
	{ index:15, name:'tags',    transform:parseTags    },
];

downloadChart(function(body) {
	var rows = parseMarkup(body);
	var emoji = transcribeEmoji(rows);
	writeCatalog(emoji, function() {
		console.log(emoji.length + ' emoji written to ' + catalog);
	});
});

function downloadChart(done) {
	console.log('Downloading the emoji chart...');
	request.get(url, function(err, resp, body) {
		if (err || resp.statusCode >= 400) handleError(err);
		done(body);
	});
}

function parseMarkup(body) {
	console.log('Parsing the markup...');
	var $ = cheerio.load(body);
	var rows = $('table tr').slice(1);
	return rows.map(function(i, row) {
		return $(row).find('td').map(function(i, cell) {
			return $(cell).text();
		});
	}).get();
}

function transcribeEmoji(rows) {
	console.log('Transcribing emoji details...');
	return rows.map(function(cells) {
		var spec = {};
		columns.forEach(function(col) {
			var cell = cells[col.index];
			spec[col.name] = col.transform(cell);
		});
		return spec;
	});
}

function parseText(text) {
	return text;
}

function parseTags(text) {
	return text.split(', ');
}

function parseVersion(text) {
	var version = text.match(/\d+\.\d+/)[0];
	return parseFloat(version, 10);
}

function writeCatalog(data, done) {
	console.log('Writing JSON catalog...');
	var json = JSON.stringify(data, null, 4);
	fs.mkdir(dest, function() {
		fs.writeFile(catalog, json, function(err) {
			if (err) handleError(err);
			done();
		});
	});
}

function handleError(err) {
	console.error(err);
	os.exit(1);
}