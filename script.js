const debug = document.getElementById('debug');
let hrValues = [];
let minHr = Infinity;
let maxHr = -Infinity;

function movingAverage(data, windowSize) {
	const result = [];
	for (let i = 0; i < data.length; i++) {
		const start = Math.max(0, i - windowSize + 1);
		const subset = data.slice(start, i + 1);
		const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
		result.push(avg);
	}
	return result;
}

function updateStats() {
	if (hrValues.length === 0) {
		return;
	}

	const avg = (hrValues.reduce((a, b) => a + b, 0) / hrValues.length).toFixed(1);
	minHr = Math.min(...hrValues);
	maxHr = Math.max(...hrValues);

	document.getElementById('avgHr').textContent = avg;
	document.getElementById('minHr').textContent = minHr;
	document.getElementById('maxHr').textContent = maxHr;
	document.getElementById('hrList').textContent = hrValues.join(', ');

	plotGraph();
}

function plotGraph() {
	const xValues = hrValues.map((_, i) => i + 1);
	const ma = movingAverage(hrValues, 5);

	const trace1 = {
		x: xValues,
		y: hrValues,
		mode: 'lines+markers',
		name: 'Heart Rate',
		line: {color: 'blue'}
	};

	const trace2 = {
		x: xValues,
		y: ma,
		mode: 'lines',
		name: 'Moving Average',
		line: {color: 'orange', width: 3}
	};

	Plotly.newPlot(
		'graph',
		[trace1, trace2],
		{
			title: 'Heart Rate over Time',
			xaxis: { title: 'Sample Number' },
			yaxis: { title: 'Heart Rate (bpm)' },
			legend: { orientation: 'h', y: 1.15, x: 0.5, xanchor: 'center' },
			margin: { l: 50, r: 20, t: 60, b: 50 }
		},
		{ responsive: true }
	);
}

async function connectDevice() {
	try {
		const device = await navigator.bluetooth.requestDevice({
			acceptAllDevices: true,
			optionalServices: [0x180d, 'heart_rate']
		});

		log(`Connected to: ${device.name || 'Unknown device'}`);
		const server = await device.gatt.connect();
		const hrService = await server.getPrimaryService('heart_rate');
		const hrChar = await hrService.getCharacteristic(0x2a37);

		hrChar.addEventListener('characteristicvaluechanged', (event) => {
			const value = event.target.value;
			const rate = value.getUint8(1);
			document.getElementById('hr').textContent = rate;
			hrValues.push(rate);
			updateStats();
		});

		await hrChar.startNotifications();
		log('Heart rate notifications started');
	} catch (error) {
		log(`Error: ${error.message}`, true);
	}
}

function log(message, isError = false) {
	const line = document.createElement('div');
	line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
	line.style.color = isError ? '#ff4d4f' : '#00ff66';
	debug.appendChild(line);
	debug.scrollTop = debug.scrollHeight;
}

document.getElementById('connect').addEventListener('click', connectDevice);

window.addEventListener('load', () => {
	hrValues = [];
	plotGraph();
});
