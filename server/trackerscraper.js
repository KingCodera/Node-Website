var jsdom = require('jsdom');
var fs = require('fs');

var data;
var file = './public/tracker/trackerdata.json';

var CRC32_720 = ['41A8EF6E', 'DC4C5227', '53CCBF23', 'E60EB29D', '642CD016', 'DAF45E61', '80AF7DDE', '94829407', '13724447', 'C3BAA85F', '3BF0E652', '7013D6B0', 'BB3653A2', '746A98A5', '7C1477BF']
var CRC32_480 = ['4D21A9E6', '3135F999', 'B58DF346', '7E4F8192', '41BA56F6', '628D3DA4', '1665BCDD', 'B2591ED1', '24085882', 'EE9CEEE9', '8B5F64D3', 'A91F8A28', '0FE1BD52', 'C9F83A29', '852D33AD']

var readdb = function() {
	data = JSON.parse(fs.readFileSync(file, 'utf8'));
};

var writedb = function() {
	fs.writeFileSync(file, JSON.stringify(data, null, 4), 'utf8');
};

var getDownloads = function(crc) {
	var value = 0;	
	var link = "http://tracker.anime-index.org/index.php?page=torrents&search=" + crc;
	jsdom.env(
			link,
			["http://code.jquery.com/jquery.js"],
			function (errors, window) {						
				value += parseInt(window.$("a[title~='History']").text(), 10);						
				window.close();				
				var link = "http://tracker.minglong.org/doki/index.php?search=" + crc;
				jsdom.env(
						link,
						["http://code.jquery.com/jquery.js"],
						function (errors, window) {				
							var regex = new RegExp("[0-9]+");
							value += parseInt(window.$(".number").text(), 10);						
							window.close();							
							data[crc] = value;
							writedb();
							console.log("Done updating: " + crc);
						}
				);					
			}
	);
};

exports.update = function() {
	readdb();

	for (var index in CRC32_480) {	
		if (data[CRC32_480[index]] === undefined) {
			data[CRC32_480[index]] = {};
		}
		getDownloads(CRC32_480[index]);	
	}

	for (var index in CRC32_720) {
		if (data[CRC32_720[index]] === undefined) {
			data[CRC32_720[index]] = {};
		}
		getDownloads(CRC32_720[index]);	
	}	
}