/**
 * New node file
 */
var parseTorrent = require('parse-torrent');
var scraper = require('./server/torrentscraper.js');
var fs = require('fs');
var extend = require('util')._extend;

var db = {};

db.readdb = function() {
	db.db = JSON.parse(fs.readFileSync('./public/tracker/scraperdata.json'));
}

db.writedb = function() {
	fs.writeFileSync('./public/tracker/scraperdata.json', JSON.stringify(db.db, null, 4), 'utf8');
}

db.readdb();

fs.readdir(__dirname + '/server/btf', function(err, files) {
	if (err) {
		console.log(err.message);
	}	
	for (var i in files) {				
		var file = files[i];
		var suffix = '.btf';
		if (file.indexOf(suffix, file - suffix.length) !== -1) {
			var torrent = fs.readFileSync(__dirname + '/server/btf/' + file);
			var parsedTorrent = parseTorrent(torrent);
			if (parsedTorrent.name.indexOf('[Doki]') === -1) {
				fs.unlinkSync(__dirname + '/server/btf/' + file)
				console.log('Deleting: ' + parsedTorrent.name);
			} else {
				scraper.scrape(extend({}, parsedTorrent), db, {});
			}
		}
	}
});

