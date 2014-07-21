var graph = $("#container");

$.getJSON('/tracker/scraperdata.json', function(json) {
	var INFOHASH_720 = [
		'200da9d080d06d8a67edbef56a19d2c25423f586',
		'bbc3e83b1a7aaa8f4233475fde37f5ff3193f05e',
		'db1982ae41769118d1550e157789b62ec72edf7a',
		'a25e3cf2235681e945eafdcc5aecb5466ab16d2f',
		'4da0cfc5cadaef3bf22f8f60379c4e123cde31c1',
		'691d224668c94c45804301ced41e0f1545210780',
		'0917bf15cda85a7d45b68ea0fa4e023070d8a7c6',
		'7815ff1a413d2b37a4a6df8be0369ba2264bef2e',
		'9682887c84d6c46d1e4b7daf853627605135ebcd',
		'179971480e93d08ccad23d43279e0877f2f97759',
		'24b1aac0058d2df635c01c1a9fe0db0806d2895a',
		'4f7cdd4ae16ed7d174ef51351bc0c23769d61109',
		'822fc964d30343261163bdc2c6a9ac02cbe9cf2f',
		'aca8fe049d4a4a8eab21c68141e8f739ab1a3b9a',
		'c1dedf4cfc8e30744fce5debcea2f1444fce7b22'
	]
	var INFOHASH_480 = [
		'834229037201eefff32b89236e8b75ed76d74ce3',
		'd11a42a4afa023744535bedaa33a0e88d0d8e897',
		'229db9604a3f3b267bd769fa14587ba667656c35',
		'b20dcee4919daf04cecbaa9333a43399c83f92c4',
		'0e2ed8cb5f93b995f3e6d3f26d545fab2d6c14a1',
		'283ae90c72773597f8c98154119423629599f5b2',
		'e4b6f24d955817c075a26e3fce7d398b96239db5',
		'928440d825d95b17202690c540b34f33cbab42e4',
		'cc3efe6f94c7106efb3caefd2b2f5bd352dab25f',
		'16d3c15e21f58260766bbd155eac812116e4a872',
		'edd2c52e91983e6d42c3f4ac57f144544695332a',
		'c8e4ee07ce638733df526fc65899420af4d7d2dc',
		'f7f7e4363ccc39a1062b6674184e277050cab360',
		'b313c25f419e6ba074623747539a482916b659ea',
		'9cf0ad6c6964ccd8a1581ddb067295b7c2cd8013'
	]

	// Minglong 720p info
	var DATA720M = INFOHASH_720.map(function(crc) {
		if (json[crc] === undefined) {
			return 0;
		}
		return json[crc].minglong;
	});

	// AniDex 720p info
	var DATA720A = INFOHASH_720.map(function(crc) {
		if (json[crc] === undefined) {
			return 0;
		}
		return json[crc].anidex;
	});

	// Minglong 480p info
	var DATA480M = INFOHASH_480.map(function(crc) {
		if (json[crc] === undefined) {
			return 0;
		}
		return json[crc].minglong;
	});

	// AniDex 720p info
	var DATA480A = INFOHASH_480.map(function(crc) {
		if (json[crc] === undefined) {
			return 0;
		}
		return json[crc].anidex;
	});

	var data = {
	    chart: {
	    	type: 'bar'
	    },
	    title: {
	    	text: 'Total Downloads'
	    },
	    xAxis: {
	    	categories: ['Episode 01', 'Episode 02', 'Episode 03', 'Episode 04', 'Episode 05', 'Episode 06', 'Episode 07', 'Episode 08', 'Episode 09', 'Episode 10', 'Episode 11', 'Episode 12', 'Episode 13', 'Episode 14', 'Episode 15']
	    },
	    yAxis: {
	    	min: 0,
	    	title: {
	    		text: 'Number of Downloads'
	    	}
	    },
	    legend: {
	    	reverse: true
	    },
	    plotOptions: {
	    	series: {
	    		stacking: 'normal'
	    	}
	    },
	    series: [{
		        name: '720p Minglong',
		        data: DATA720M
	    	}, {
		        name: '720p AniDex',
		        data: DATA720A
	    	}, {
		        name: '480p Minglong',
		        data: DATA480M
	    	}, {
		        name: '480p AniDex',
		        data: DATA480A
	    	}],
		credits: {
			enabled: true,
			text: 'Doki Enterprises',
			href: 'https://doki.co',
			position: {
				align: 'right',
				x: -10,
				verticalAlign: 'bottom',
				y: -5
			},
			style: {
				cursor: 'pointer',
				color: '#909090',
				fontSize: '9px'
			}
		}
	};

	graph.highcharts(data);
});