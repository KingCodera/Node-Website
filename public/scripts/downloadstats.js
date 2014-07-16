var graph = $("#container");

$.getJSON('/tracker/trackerdata.json', function(json) {
	var CRC32_720 = ['41A8EF6E', 'DC4C5227', '53CCBF23', 'E60EB29D', '642CD016', 'DAF45E61', '80AF7DDE', '94829407', '13724447', 'C3BAA85F', '3BF0E652', '7013D6B0', 'BB3653A2', '746A98A5', '7C1477BF']
	var CRC32_480 = ['4D21A9E6', '3135F999', 'B58DF346', '7E4F8192', '41BA56F6', '628D3DA4', '1665BCDD', 'B2591ED1', '24085882', 'EE9CEEE9', '8B5F64D3', 'A91F8A28', '0FE1BD52', 'C9F83A29', '852D33AD']

	var DATA720 = CRC32_720.map(function(crc) {
		return json[crc];
	});

	var DATA480 = CRC32_480.map(function(crc) {
		return json[crc];
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
		        name: '720p',
		        data: DATA720
	    	}, {
		        name: '480p',
		        data: DATA480
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