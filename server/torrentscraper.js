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

exports.scrape = function(torrent, db) {	
	var self = this;
	var peerId = new Buffer('01234567890123456789');
	
	self._db = db;
	self._opts = {};
	self._peerId = Buffer.isBuffer(peerId) ? peerId : new Buffer(peerId, 'utf8');
	self._port = 6881;
	self._infoHash = Buffer.isBuffer(torrent.infoHash) ? torrent.infoHash : new Buffer(torrent.infoHash, 'hex');
	self.torrentLength = torrent.length;
	
	if (typeof torrent.announce === 'string') {
		torrent.announce = [torrent.announce];
	}
	
	torrent.announce.map(function(announceUrl) {		
		if (announceUrl.indexOf('udp:') === 0) {
			// TODO: Handle UDP request.
		} else {
			console.log("Processing torrent with infoHash: " + self._infoHash.toString('hex'));
			// HTTP request.
			var opts = extend({
				info_hash: self._infoHash.toString('binary')
			}, self._opts);
			
			announceUrl = announceUrl.replace('announce', 'scrape');
			
			var fullUrl = announceUrl + '?' + common.querystringStringify(opts);
			var req = http.get(fullUrl, function(res) {
				if (res.statusCode !== 200) {
					res.resume(); // consume the whole stream
					return;
				}
				res.pipe(concat(function(data) {
					if (data && data.length)
						handleResponse(announceUrl, data, self);
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
	console.log(data.files + ' vs ' + self._infoHash.toString());
	console.log(data.files + ' vs ' + self._infoHash.toString('binary'));
	data = data[self._infoHash.toString()];

	if (!data) {
		console.log('No data');
	} else {
		// TODO: optionally handle data.flags.min_request_interval (separate
		// from announce interval)		
		var infohash = self._infoHash.toString('hex');		
		if (self._db.db[infohash] === undefined) {
			self._db.db[infohash] = {};
		}
		
		if (requestUrl.indexOf('minglong') !== -1) {
			// Add data to minglong stats.
			self._db.db[infohash].minglong = data.downloaded;			
		} else if (requestUrl.indexOf('anime-index') !== -1) {
			// Add data to anidex stats.
			self._db.db[infohash].anidex = data.downloaded;			
		}
		
		self._db.writedb();
	}
};