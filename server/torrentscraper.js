/**
 * Scrapes data from trackers.
 * 
 * SCRAPE PACKET: INT64 CONNECTION_ID INT32 ACTION INT32 TRANSACTION_ID
 * 
 * INT8[20] info_hash
 */
var BN = require('bn.js');
var bencode = require('bencode');
var common = require('./lib/common');
var concat = require('concat-stream');
var dgram = require('dgram');
var extend = require('extend.js');
var http = require('http');
var querystring = require('querystring');

exports.scrape = function(torrent, db, opts) {
	var peerId = new Buffer('01234567890123456789');
	
	opts._db = db;
	opts._opts = {};
	opts._peerId = Buffer.isBuffer(peerId) ? peerId : new Buffer(peerId, 'utf8');
	opts._port = 6881;
	opts._infoHash = new Buffer(torrent.infoHash, 'hex');
	opts.torrentLength = torrent.length;
	opts._name = torrent.name;
	
	if (typeof torrent.announce === 'string') {
		torrent.announce = [torrent.announce];
	}
	
	torrent.announce.map(function(announceUrl) {
		if (announceUrl.indexOf('udp:') === 0) {
			// TODO: Handle UDP request.
		} else if (announceUrl.indexOf('anime-index') === -1 && announceUrl.indexOf('minglong') === -1) {
			// Old torrent ignore.
		} else {			
			// HTTP request.

			var options = extend({
				info_hash: opts._infoHash.toString('binary')
			}, opts._opts);
			
			announceUrl = announceUrl.replace('announce', 'scrape');
			var query = common.querystringStringify(options).replace(/\+/g, '%2B');
			var query2 = querystring.stringify(options);
			query = query.replace(/\./g, '%2E');
			query = query.replace(/\//g, '%2F');
			query = query.replace(/\*/g, '%2A');
			opts._query = query;
			opts._query2 = query2;

			var fullUrl = announceUrl + '?' + query;
						
			if (!(opts._infoHash.toString('binary') === common.querystringParse(query).info_hash)) {
				console.log("HTTP GET: " + fullUrl);
			}

			var req = http.get(fullUrl, function(res) {
				if (res.statusCode !== 200) {
					res.resume(); // consume the whole stream
					return;
				}
				res.pipe(concat(function(data) {
					if (data && data.length)
						handleResponse(announceUrl, data, opts);
				}))
			})

			req.on('error', function(err) {
				console.log(err.message + ' on ' + opts._infoHash.toString('hex'))
				console.log('query: ' + fullUrl + '?' + opts._query);
			})
		}
	});	
};

var handleResponse = function(requestUrl, data, object) {
	var self = object;	
	
	try {
		data = bencode.decode(data);		
	} catch (err) {
		console.log(err.message + ' on ' + self._name);		
		return;
	}
	var failure = data['failure reason'];
	if (failure) {
		console.log(failure + ' on ' + self._name);
		return;
	}

	var warning = data['warning message'];
	if (warning) {
		console.log(warning);
		return;
	}
	
	var original = data;
	data = data.files || data.host || {};
	var backup = data.files || data.host || {};
	data = data[self._infoHash.toString()];
	var infohash = self._infoHash.toString('hex');

	if (!data) {
		if (!backup) {
			console.log("FAILURE: Unable to find info_hash in return.");
		} else {
			console.log("FAILURE: Empty reply received.");
			console.log(requestUrl);
		}
	} else {
		// TODO: optionally handle data.flags.min_request_interval (separate
		// from announce interval)
		
		if (self._db.db[infohash] === undefined) {
			self._db.db[infohash] = {
				"minglong": 0,
				"anidex": 0,
				"name": ""
			};
		}

		self._db.db[infohash].name = self._name;
		
		if (requestUrl.indexOf('minglong') !== -1) {
			// Add data to minglong stats.
			self._db.db[infohash].minglong = data.downloaded;						
		} else if (requestUrl.indexOf('anime-index') !== -1) {
			// Add data to anidex stats.
			self._db.db[infohash].anidex = data.downloaded;
			//console.log(data.name + ' anidex data added');
		}
		
		self._db.writedb();
	}
};
