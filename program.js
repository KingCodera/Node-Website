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

fs.readdir(__dirname + '/server/torrents', function(err, files) {	
	var index = 0;
	while (index < files.length) {
		var file = files[index];
		var suffix = '.torrent';
		if (file.indexOf(suffix, file - suffix.length) !== -1) {
			var torrent = fs.readFileSync(__dirname + '/server/torrents/' + file);
			var parsedTorrent = parseTorrent(torrent);
			scraper.scrape(extend({}, parsedTorrent), db, {});
		}
		index++;		
	}
});

