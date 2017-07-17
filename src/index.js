var os = require('os');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var request = require('request');

var url = 'http://www.unicode.org/emoji/charts/emoji-list.html';
var catalogPath = path.join(__dirname, '..', 'dist', 'emoji.json');

var entryTypes = [

	/* Standard */ {
		test: function(values) {
			return values.length === 5;
		},
		keys: [
			{ index: 3, name:'name',       transform:parseAsText       },
			{ index: 0, name:'number',     transform:parseAsNumber     },
			{ index: 1, name:'codes',      transform:parseAsTexts      },
			{ index: 1, name:'codePoints', transform:parseAsCodePoints },
			{ index: 1, name:'character',  transform:parseAsCharacter  },
			{ index: 4, name:'keywords',   transform:parseAsKeywords   },
		],
	},

];

function buildCatalog(done) {
	downloadChart(function(err, body) {
		if (err) return done(err);
		parseMarkup(body, function(err, catalog) {
			if (err) return done(err);
			writeCatalog(catalog, done);
		});
	});
}

function downloadChart(done) {
	console.log('Downloading the emoji chart...');
	request.get(url, function(err, resp, body) {
		if (err || resp.statusCode >= 400) return done(err);
		done(null, body);
	});
}

function writeCatalog(data, done) {
	console.log('Writing JSON catalog...');
	var json = JSON.stringify(data, null, 4);
	fs.writeFile(catalogPath, json, function(err) {
		if (err) return done(err);
		console.log(data.length + ' entries written to ' + catalogPath);
		done();
	});
}

function parseMarkup(body, done) {
	console.log('Parsing the markup...');
	var $ = cheerio.load(body);
	var rows = $('table tr').map(function(i, row) {
		return $(row).find('td').map(function(i, cell) {
			return $(cell).text();
		});
	}).get();
	console.log('Transcribing emoji details...');
	var entries = rows.map(parseEntry)
		.filter(function(e){ return e });
	done(null, entries);
}

function parseEntry(values) {
	if (values.length === 0) return;
	var entryType = entryTypes.find(function(type) {
		return type.test(values);
	});
	if (!entryType) return null;
	return transcribeEmoji(entryType, values);
}

function transcribeEmoji(entryType, values) {
	var entry = {};
	entryType.keys.forEach(function(key) {
		var value = values[key.index];
		entry[key.name] = key.transform(value);
	});
	return entry;
}

function parseAsCharacter(text) {
	var codePoints = parseAsCodePoints(text);
	return codePoints.map(function(c){ return String.fromCodePoint(c) })
		.join('');
}

function parseAsCodePoints(text) {
	return text.split(' ')
		.map(function(s){ return s.trim(); })
		.map(function(s){ return s.replace('U+', ''); })
		.map(function(s){ return parseInt(s, 16); });
}

function parseAsNumber(text) {
	return parseInt(text, 10);
}

function parseAsKeywords(text) {
	return text.split('|')
		.map(function(s){ return s.trim(); })
}

function parseAsText(text) {
	return text;
}

function parseAsTexts(text) {
	return text.split(' ')
		.map(function(s){ return s.trim(); })
}

function handleError(err) {
	console.error(err);
	os.exit(1);
}

buildCatalog(function(err) {
	if (err) return handleError(err);
});
