var chart, parks, hashNo, tensorObj

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
	var R = 6371000; // Radius of the earth in m
	var dLat = deg2rad(lat2 - lat1); // deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in m
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI / 180)
}

function transposeArray(a) {
	var w = a.length || 0;
	var h = a[0] instanceof Array ? a[0].length : 0;
	if (h === 0 || w === 0) {
		return [];
	}
	var i, j, t = [];
	for (i = 0; i < h; i++) {
		t[i] = [];
		for (j = 0; j < w; j++) {
			t[i][j] = a[j][i];
		}
	}
	return t;
}

function CSVToArray(strData, strDelimiter) {
	strDelimiter = (strDelimiter || ",");
	var objPattern = new RegExp(
		(
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
	);
	var arrData = [
		[]
	];
	var arrMatches = null;
	while (arrMatches = objPattern.exec(strData)) {
		var strMatchedDelimiter = arrMatches[1];
		if (
			strMatchedDelimiter.length &&
			strMatchedDelimiter !== strDelimiter
		) {
			arrData.push([]);
		}
		var strMatchedValue;
		if (arrMatches[2]) {
			strMatchedValue = arrMatches[2].replace(
				new RegExp("\"\"", "g"),
				"\""
			);
		} else {
			strMatchedValue = arrMatches[3];

		}
		arrData[arrData.length - 1].push(strMatchedValue);
	}
	return (arrData);
}

const certaintyRanges = [
	[0.0, 0.3, 0.8, 0.95],
	['I\'d guess', 'I think', 'I\'m quite sure', 'I\'m very sure']
]

function sumArr(array) {
	var total = 0;
	for (var i = 0; i < array.length; i++) {
		total += array[i];
	}
	return total;
}
$('.alert').hide()

function jsSubmitForm(e) {
	/*if ($(e).find("button").text() == 'Skicka') {
		$(e).append("Skickat. Tack för din input!")
	}*/
	console.log(e)
	var es = $(e).serialize()

	console.log(es)
	if (es.indexOf('NoOfDogs') == -1) {
		$('.alert').show()
		return false
	}
	$.post($(e).attr('js_action'), es, function(response) {
		// do something here on success
		$(e).append
	}, 'json');
	//$('[name="NoOfDogs"]').val('')

	//Ta tillbaka den här nedanstående när jag har laddat in de gamla värdena.
	$('#form_div').hide()
	$('#thanks_div').text('')
	$('#thanks_div').show().append('<h3>Thanks!</h3> Please, feel free to <a href="' + document.location.origin + '/#' + hashNo + '" onclick="openNewSubmitForm()">submit another observation</a> in a few minutes.')


	return false;
}

$(document).ready(function() {
	$('#form_div').hide()
	$('#thanks_div').hide()
	$('#probability_distribution').hide()
});

//Det verkar som jag klarar mig utan nedanstående //190609
/*$("#gform").submit(function() {
	jsSubmitForm($("#gform"))
	return false;
});*/

function openNewSubmitForm(evt) {
	$('#form_div').show()
	$('#thanks_div').hide()
	$('input[type="radio"]').prop('checked', false)
	$('.btn').removeClass('active')
	return false
}



function buildSankeyDiagram(iv, w) {
	//id = input description, w = weights
	var labels = ['bias0', ...iv]


	//Moving in the separated bias neurons to the main neurons' arrays.
	var w2 = []
	for (i = 0; i < w.length - 1; i += 2) {
		w2[i / 2] = [w[i + 1], ...w[i]]
	}

	//w2 = [w2[0]]
	console.log(w2)

	var s = 0
	var t = 0
	var v = 0
	var links = {
		source: [],
		target: [],
		value: [],
		color: []
	}
	var c
	var nl = ''
	var origPlusForLayerNumber = 0
	var destNeuronPlusForNeuronNumber = w2[0].length
	var printr = []
	var biasNodeOrderer = {
		s: 0,
		t: 0,
		v: 0.001
	}
	for (var layer in w2) {
		layNo = parseInt(layer) + 1 //To give a better name in the graph.
			//Making sure Bias Nodes show up in the correct layer.
		biasNodeOrderer.t += w2[layer].length
		links.source.push(biasNodeOrderer.s)
		links.target.push(biasNodeOrderer.t)
		links.value.push(biasNodeOrderer.v)
		links.color.push('#00000000')
		biasNodeOrderer.s += w2[layer].length
		for (var origNeuron in w2[layer]) {
			//console.log('Neuron: ' + origNeuron + '/' + w2[layer].length)
			s = parseInt(origNeuron) + parseInt(origPlusForLayerNumber)
				//console.log(t + ' = ' + destNeuron + ' + ' + destNeuronPlusForNeuronNumber)
			for (var destNeuron in w2[layer][origNeuron]) {
				t = parseInt(destNeuron) + parseInt(destNeuronPlusForNeuronNumber) + 1 //since the first neuron(BiasL0) is the bias.
				v = w2[layer][origNeuron][destNeuron]
				printr.push(s + ' - ' + t)

				//console.log('Linking ' + s + ' to ' + t + ' with a weight of ' + v + '.')
				if (v > 0) {
					links.color.push('#00000044')
				} else {
					v = -v
					links.color.push('#ff000044')
				}
				links.source.push(s)
				links.target.push(t)
				links.value.push(v)

				//}
				if (origNeuron == w2[layer].length - 1) {
					if (layer < w2.length - 1) {
						if (destNeuron == 0 && layer < w2.length - 1) {

							labels.push('L' + layNo + 'bias')
						}
						nl = 'L' + layNo + 'N' + destNeuron

					} else {
						nl = destNeuron + ' dog(s)'
					}
					//console.log('Pushing label' + nl + ' to labels...')

					labels.push(nl)
				}
			}
			console.log(printr)
			printr = []

		}
		origPlusForLayerNumber += w2[layer].length
		destNeuronPlusForNeuronNumber += w2[layer][origNeuron].length
		if (layer < w2.length - 2) {
			destNeuronPlusForNeuronNumber += 1 //To add one for each added added bias (per layer)
		}
	}

	console.log(labels)
	console.log(links)
	var sankeyData = {
		type: "sankey",
		orientation: "h",
		node: {
			pad: 15,
			thickness: 30,
			line: {
				color: "black",
				width: 0.5
			},
			label: labels,
			//color: ["blue", "blue", "blue", "blue", "blue", "blue"],
		},

		link: links
	}

	var sankeyData = [sankeyData]

	var layout = {
		/*
				title: "Basic Sankey",
				font: {
					size: 10
				}
			*/
	}

	Plotly.react('sankey-diagram', sankeyData, layout)
}

var runTheWholeShebang = async function() {
	$('#prediction_text').children().text('')
	$('#prediction_prefix').text('Thinking...')
	$('#probability_distribution').remove()
	$('<canvas class="col" id="probability_distribution">').insertAfter('#prediction_text')
	openNewSubmitForm()

	var parks = {
		"type": "FeatureCollection",
		"features": []
	}
	$.get(
		"https://docs.google.com/spreadsheets/d/e/2PACX-1vRFp-Zv8-MhnnmFqNeGvZCBzYlRhP3G59TnNRCjOU06ixyzT8wA0miWi-Ewxw4Ay5lrG3b56dj7qUXU/pub?gid=1716930661&single=true&output=csv",
		//Reading the data from google sheets...
		function(parkData) {
			parkData = CSVToArray(parkData)

			for (var i = 1; i < parkData.length; i++) {
				var p = {
					"type": "Feature",
					"properties": {
						"namn": parkData[i][0],
						"platsbeskrivning": parkData[i][1],
						"nr": i
					},
					"geometry": {
						"type": "Point",
						"coordinates": [
							parkData[i][2],
							parkData[i][3]
						]
					}
				}
				parks['features'].push(p)
			}

			function doWhenLocationHasBeenFound(position) {
				if (position) {
					for (var i in parks.features) {
						console.log(i)
						parks.features[i].properties.distance = Math.round(getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude, parks.features[i].geometry.coordinates[1], parks.features[i].geometry.coordinates[0]))
					}
				}
				if (window.location.href.indexOf('#') == -1) {
					window.location.href = location.href + "#" + parks.features[0].properties.nr;
				}
				hashNo = decodeURIComponent(document.location.hash.substr(1))
				$('[name="WhichPark"]').val(parks.features[hashNo - 1].properties.namn)
				$('[name="ParkLocationLon"]').val(parks.features[hashNo - 1].geometry.coordinates[0])
				$('[name="ParkLocationLat"]').val(parks.features[hashNo - 1].geometry.coordinates[1])
				$('[name="DistanceFromPark"]').val(parks.features[hashNo - 1].properties.distance)


				serial = 'WhichPark=' + parks.features[hashNo - 1].properties.namn +
					'&ParkLocationLon=' + parks.features[hashNo - 1].geometry.coordinates[0] +
					'&ParkLocationLat=' + parks.features[hashNo - 1].geometry.coordinates[1] +
					'&DistanceFromPark=' + parks.features[hashNo - 1].properties.distance

				//Doing the new transformation of values to tensor.
				var nowX = new Promise(function(resolve, reject) {
					$.get($("#gform").attr('js_action'), serial, function(response) {
						//console.log(response)
						var data = JSON.parse(response)
						var resolver = {}
						var valuePresent = {}
						for (var i in data['field']) {
							if (Array.isArray(data['row'][i])) {
								data['row'][i] = data['row'][i][0]
							}
							if (!isNaN(parseFloat(data['row'][i]))) {
								data['row'][i] = parseFloat(data['row'][i])

							}
							if (data['row'][i] == null) {
								data['row'][i] = 0 //'undefined' //data['row'][i]  //Fixa detta så det blir rätt.
							}
							resolver[data['field'][i]] = data['row'][i]
						}
						resolve(resolver)
							//resolve(data)
					}, 'json');
				});
				if (!model) {
					var model = new Promise(function(resolve, reject) {
						const data = tf.loadLayersModel('tfjsModel/model.json');
						resolve(data)
					});
				}
				if (!normVals) {
					var normVals = new Promise(function(resolve, reject) {
						$.getJSON("tfjsModel/normalizationValues.json", function(data) {
							//console.log(data)
							resolve(data)
						});
					});
				}
				if (!weights) {
					var weights = new Promise(function(resolve, reject) {
						$.getJSON("tfjsModel/weights.json", function(data) {
							//console.log(data)
							resolve(data)
						});
					});
				}


				Promise.all([nowX, model, normVals, weights]).then(function(values) { //Now I have all the data. Here we go (doing the same stuff as in the python script)!
					//console.log(values);
					nowX['Name'] = 'H' //For testing purposes. Should be based on who's logged in or an fraction of each based on how good observations they've done.
					nowX = values[0]
					model = values[1]
					normVals = values[2]
					weights = values[3]

					var tensorObj = {}

					for (var i in normVals['mean']) {
						if (normVals['min'][i] == normVals['max'][i]) {
							continue //This shit makes sure no features that only have one value gets included in the the tensorObj.
						}
						if (i in nowX) {
							tensorObj[i] = nowX[i]
						} else {
							if (i.substr(0, 4) == 'cat_') { //Making one-hots
								var cat = i.substr(4, i.lastIndexOf('_') - 4)
								var catVal = i.substr(i.lastIndexOf('_') + 1)
									//console.log('Checking if nowX[' + cat + '] (' + nowX[cat] + ') == ' + catVal)
								if (nowX[cat] == catVal) {
									//console.log('it was')
									tensorObj[i] = 1
								} else {
									tensorObj[i] = 0
								}
							}
							if (i.substr(0, 3) == 'vp_') { //Making value_present values
								tensorObj[i] = 1 //Alla values present ska vara 1:or eftersom det enda de mäter är huruvida något är fel på API:t, och det bör det inte kunna vara.

							}
						}
					}

					//buildSankeyDiagram(Object.keys(tensorObj), weights[0])

					//Normalizing
					j = 0
					var tensorArr = []
					var labels = []
					for (var i in tensorObj) {
						var normalizedValue = (tensorObj[i] - normVals.mean[i]) / normVals.std[i] //(normVals.max[i] - normVals.min[i])
						tensorObj[i] = normalizedValue
						labels[j] = i
						tensorArr[j] = normalizedValue
							//console.log(i + ' - ' + tensorObj[i] + ' - ' + j)
						j += 1
					}

					tf_x = tf.tensor(tensorArr)
					tf_x = tf_x.reshape([1, tensorArr.length])
					const pred = model.predict(tf_x).dataSync()
					console.log(pred)
					const predArr = Array.from(pred)
					var predNo = predArr.indexOf(Math.max(...predArr))
					var predictionPrefixString
					for (var step in certaintyRanges[0]) {
						if (Math.max(...predArr) >= certaintyRanges[0][step]) {
							predictionPrefixString = certaintyRanges[1][step] + " there "
						}
					}
					if (predNo == 10) {
						predNo = "10+"
					}
					var predictionSuffixString
					var predictionPrefixString
					if (predNo == 1) {
						predictionPrefixString += "is"
						predictionSuffixString = "dog"
					} else {
						predictionPrefixString += "are"
						predictionSuffixString = "dogs"
					}

					predictionSuffixString += ' in <a href="#" data-toggle="dropdown" class="dropdown-toggle">' + parks.features[hashNo - 1].properties.namn + /*' (' + parks.features[i].properties.distance + ' m)' + */ '<b class="caret"></b></a><ul id="park_dropdown_list" class="dropdown-menu"></ul>' + ' right now.'
						//currentParkIndex = i
					$('#prediction_prefix').text(predictionPrefixString)
					$('#prediction_number').append('h1').text(predNo)
					$('#prediction_suffix').empty()
					$('#prediction_suffix').append(predictionSuffixString)

					var sortedParks = parks
					sortedParks.features.sort((a, b) => (a.properties.distance > b.properties.distance) ? 1 : ((b.properties.distance > a.properties.distance) ? -1 : 0));
					if (!position) {
						$("#park_dropdown_list").append('Allow geolocation to get parks close to you.')
					}
					for (var j = 0; j < sortedParks.features.length; j++) {
						if (j > 4) {
							break
						}
						if (sortedParks.features[j].properties.nr != hashNo) {
							var ddl = '<li><a href="' + document.location.origin + '/#' + sortedParks.features[j].properties.nr + '" onclick="runTheWholeShebang()">' +
								sortedParks.features[j].properties.namn + ' ('
							if (typeof sortedParks.features[j].properties.distance != 'undefined') {
								ddl += sortedParks.features[j].properties.distance
							} else {
								ddl += '?'
							}
							ddl += ' m)</a></li>'
							$("#park_dropdown_list").append(ddl);
						}
					}
					$("#park_dropdown_list").append('<a href="addaplace.html">Add a missing park</a>')

					//$('#probability_distribution').empty()
					var ctx = document.getElementById('probability_distribution').getContext('2d');
					var chart = new Chart(ctx, {
						// The type of chart we want to create
						type: 'bar',

						// The data for our dataset
						data: {
							labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"],
							datasets: [{
								borderColor: "#007bff",
								backgroundColor: "#007bff",
								data: predArr.map(function(each_element) {
									return Number(each_element.toFixed(3));
								}),
								fill: 'origin',
							}, ]
						},
						// Configuration options go here
						options: {
							elements: {
								line: {
									fill: '-1', // by default, fill lines to the previous dataset
									borderWidth: 3,
								},
								//point: standardPoint,
							},
							scales: {
								yAxes: [{
									stacked: true,
									scaleLabel: {
										display: true,
										labelString: 'Probability'
									},
								}],
								xAxes: [{
									scaleLabel: {
										display: true,
										labelString: 'Number of dogs'
									},
								}]
							},
							title: {
								display: true,
								text: 'Probability Distribution'
							},
							legend: {
								display: false
							},
							tooltips: {
								enabled: true,
								mode: 'single',
								callbacks: {
									title: function(tooltipItems, data) {
										console.log(tooltipItems[0])
										return tooltipItems[0].xLabel + ' dog(s)';
									}
								}
							},
						}
					});
					$('#form_div').show()
					$('#probability_distribution').show()
				})
			}

			function noGeoLoc() {
				console.log("You have disallowed geolocation...")
				doWhenLocationHasBeenFound()
			}
			if (navigator.geolocation) {
				//navigator.geolocation.watchPosition(doWhenLocationHasBeenFound)
				navigator.geolocation.getCurrentPosition(doWhenLocationHasBeenFound, noGeoLoc, {
					timeout: 10000
				})
			} else {
				console.log("Geolocation is not supported by this browser.")
				noGeoLoc()
					//doWhenLocationHasBeenFound()
			}
		}
	)
}

runTheWholeShebang()