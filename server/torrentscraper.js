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
var compact2string = require('compact2string');
var concat = require('concat-stream');
var debug = require('debug')('bittorrent-tracker:client');
var dgram = require('dgram');
var EventEmitter = require('events').EventEmitter;
var extend = require('extend.js');
var hat = require('hat');
var http = require('http');
var inherits = require('inherits');
var querystring = require('querystring');
var url = require('url');

var ACTION_SCRAPE = 2;

function toUInt16(n) {
	var buf = new Buffer(2);
	buf.writeUInt16BE(n, 0);
	return buf;
}

var MAX_UINT = 4294967295;

exports.scrape = function(torrent, db, opts) {		
	var peerId = new Buffer('01234567890123456789');
	
	opts._db = db;
	opts._opts = {};
	opts._peerId = Buffer.isBuffer(peerId) ? peerId : new Buffer(peerId, 'utf8');
	opts._port = 6881;
	opts._infoHash = Buffer.isBuffer(torrent.infoHash) ? torrent.infoHash : new Buffer(torrent.infoHash, 'hex');
	opts.torrentLength = torrent.length;
	
	if (typeof torrent.announce === 'string') {
		torrent.announce = [torrent.announce];
	}
	
	torrent.announce.map(function(announceUrl) {		
		if (announceUrl.indexOf('udp:') === 0) {
			// TODO: Handle UDP request.
		} else {
			console.log("Processing torrent with infoHash: " + opts._infoHash.toString('hex'));
			// HTTP request.
			var options = extend({
				info_hash: opts._infoHash.toString('binary')
			}, opts._opts);
			
			announceUrl = announceUrl.replace('announce', 'scrape');
			
			var fullUrl = announceUrl + '?' + common.querystringStringify(options);
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
				console.log(err.message);
			})
		}
	});	
};

var handleResponse = function(requestUrl, data, object) {
	var self = object;	
	
	try {
		data = bencode.decode(data);		
	} catch (err) {
		console.log(err.message);
		return;
	}
	var failure = data['failure reason'];
	if (failure) {
		console.log(failure);
		return;
	}

	var warning = data['warning message'];
	if (warning) {
		console.log(warning);
		return;
	}
	
	data = data.files || data.host || {};
	data = data[self._infoHash.toString()];
	var infohash = self._infoHash.toString('hex');

	if (!data) {
		console.log('No data ' + infohash);
	} else {
		// TODO: optionally handle data.flags.min_request_interval (separate
		// from announce interval)		
		
		if (self._db.db[infohash] === undefined) {
			self._db.db[infohash] = {};
		}
		
		if (requestUrl.indexOf('minglong') !== -1) {
			// Add data to minglong stats.
			self._db.db[infohash].minglong = data.downloaded;
			console.log(infohash + ' minglong data added');
		} else if (requestUrl.indexOf('anime-index') !== -1) {
			// Add data to anidex stats.
			self._db.db[infohash].anidex = data.downloaded;
			console.log(infohash + ' anidex data added');
		}
		
		self._db.writedb();
	}
};
