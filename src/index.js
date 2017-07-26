var os = require('os');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var request = require('request');
var _ = require('underscore');

var urlEmoji = 'http://www.unicode.org/emoji/charts/emoji-list.html';
var urlSynonyms = 'https://raw.githubusercontent.com/wooorm/emoticon/02438db383babedcf0a81f421198d846afae30c8/index.json';
var catalogPath = path.join(__dirname, '..', 'dist', 'emoji.json');
var categories = {};

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
			{ index: 1, name:'emoji',      transform:parseAsEmoji      },
			{ index: 1, name:'group',      transform:parseAsGroup      },
			{ index: 1, name:'subGroup',   transform:parseAsSubGroup   },
			{ index: 4, name:'keywords',   transform:parseAsKeywords   },
		],
	},

];

function buildCatalog(done) {
	download(urlEmoji, function(err, bodyEmoji) {
		if (err) return done(err);
		parseMarkup(bodyEmoji, function(err, catalogEmoji) {
			if (err) return done(err);
			download(urlSynonyms, function(err, bodySynonyms) {
				if (err) return done(err);
				parseJson(bodySynonyms, function(err, catalogSynonyms) {
					if (err) return done(err);
					writeCatalog(joinCatalogs(catalogEmoji, catalogSynonyms), done);
				});	
			});	
		});
	});
}

function download(url, done) {
	console.log('Downloading... ' + url);
	request.get(url, function(err, resp, body) {
		if (err || resp.statusCode >= 400) return done(err);
		done(null, body);
	});
}

function joinCatalogs(catalogEmoji, catalogSynonyms, done) {
	console.log('Joining catalogs...');
	var result = _.map(catalogEmoji, function(item){
		return _.extend(item, _.findWhere(catalogSynonyms, { emoji: item.emoji }));
	});
	return result;
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

function parseJson(body, done) {
	console.log('Parsing JSON string...');
	done(null, JSON.parse(body));
}

function parseMarkup(body, done) {
	console.log('Parsing the markup...');
	var $ = cheerio.load(body);
	var lastGroup, lastSubGroup = '';
	var rows = [];
	$('table tr').each(function(i, row) {
		var th = $(row).find('th');
		lastGroup = th.hasClass('bighead')?th.text():lastGroup;
		lastSubGroup = th.hasClass('mediumhead')?th.text():lastSubGroup;
		$(row).find('td a img').map(function(j, title) {
			categories[$(title).attr('title').split(' ').filter(function(word) {
   				return word.startsWith('U+');
			}).join(' ')] = {group: lastGroup, subGroup: lastSubGroup};
		});
		rows.push($(row).find('td').map(function(j, cell) {
			return $(cell).text();
		}));
	});
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

function parseAsEmoji(text) {
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

function parseAsGroup(text) {
	return categories[text].group;
}

function parseAsSubGroup(text) {
	return categories[text].subGroup;
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
