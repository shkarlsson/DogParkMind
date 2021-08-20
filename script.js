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
	var es = $(e).serialize()
	console.log('The variable "es" to be json-ified and submitted is a ' + typeof es + ' and has the following value:')
	console.log(es)
	if (es.indexOf('NoOfDogs') == -1) {
		$('.alert').show()
		return false
	}
	$.post($(e).attr('js_action'), es, function(response) {
		$(e).append
	}, 'json');

	//Take back below when old values have been loaded.
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

function openNewSubmitForm(evt) {
	$('#form_div').show()
	$('#thanks_div').hide()
	$('input[type="radio"]').prop('checked', false)
	$('.btn').removeClass('active')
	return false
}


var showResults = async function() {
	$('#prediction_text').children().text('')
	$('#prediction_prefix').text('Please allow me to see your location so that I can figure out the closest dog parks to you...')
	$('#probability_distribution').remove()
	$('<canvas class="col" id="probability_distribution">').insertAfter('#prediction_text')
	openNewSubmitForm()

	var parks = {
		"type": "FeatureCollection",
		"features": []
	}
	$.get(
		//Reading the data from google sheets...
		"https://docs.google.com/spreadsheets/d/e/2PACX-1vRFp-Zv8-MhnnmFqNeGvZCBzYlRhP3G59TnNRCjOU06ixyzT8wA0miWi-Ewxw4Ay5lrG3b56dj7qUXU/pub?gid=1716930661&single=true&output=csv",

		function(parkData) {
			parkData = CSVToArray(parkData)
			console.log(parkData)

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

			function doWhenLocationHasOrHasNotBeenFound(position) {
				$('#prediction_prefix').text('Thinking...')
				if (!position) {
					var position = {
						coords: {
							latitude: 59.320,
							longitude: 18.005
						}
					}

				}
				var closestParkDistance = 999999
				var closestParkIdx = 0
				for (var i in parks.features) {
					parks.features[i].properties.distance = Math.round(getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude, parks.features[i].geometry.coordinates[1], parks.features[i].geometry.coordinates[0]))
					if (parks.features[i].properties.distance < closestParkDistance) {
						closestParkDistance = parks.features[i].properties.distance
						closestParkIdx = i
					}
				}

				if (window.location.href.indexOf('#') == -1) {
					window.location.href = location.href + "#" + parks.features[closestParkIdx].properties.nr;
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
						console.log(data)
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


				Promise.all([nowX, model, normVals, weights]).then(function(values) { //Now I have all the data. Here we go (doing the same stuff as in the python script generating the training data)!
					nowX['Name'] = 'H' //For testing purposes. This be based on who's logged in or an fraction of each based on how good/many observations they've made.
					nowX = values[0]
					model = values[1]
					normVals = values[2]
					weights = values[3]

					var tensorObj = {}

					for (var i in normVals['mean']) {
						if (normVals['min'][i] == normVals['max'][i]) {
							continue //This makes sure no features that only have one value gets included in the the tensorObj.
						}
						if (i in nowX) {
							tensorObj[i] = nowX[i]
						} else {
							if (i.substr(0, 4) == 'cat_') { //Making one-hots
								var cat = i.substr(4, i.lastIndexOf('_') - 4)
								var catVal = i.substr(i.lastIndexOf('_') + 1)
								if (nowX[cat] == catVal) {
									tensorObj[i] = 1
								} else {
									tensorObj[i] = 0
								}
							}
							if (i.substr(0, 3) == 'vp_') { 
								//"vp_..." is a bool mask indicating whether real values are present in the corresponding (other) columns. This is only relevant for building the training data, so here all are set to 1.
								tensorObj[i] = 1
							}
						}
					}

					//Normalizing array
					j = 0
					var tensorArr = []
					var labels = []
					for (var i in tensorObj) {
						var normalizedValue = (tensorObj[i] - normVals.mean[i]) / normVals.std[i] //(normVals.max[i] - normVals.min[i])
						tensorObj[i] = normalizedValue
						labels[j] = i
						tensorArr[j] = normalizedValue
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
							var ddl = '<li><a href="' + document.location.origin + '/#' + sortedParks.features[j].properties.nr + '" onclick="showResults()">' +
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

					var ctx = document.getElementById('probability_distribution').getContext('2d');
					var chart = new Chart(ctx, {
						type: 'bar',

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

						options: {
							elements: {
								line: {
									fill: '-1', // by default, fill lines to the previous dataset
									borderWidth: 3,
								},
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
				doWhenLocationHasOrHasNotBeenFound()
			}
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(doWhenLocationHasOrHasNotBeenFound, noGeoLoc, {
					timeout: 10000
				})
			} else {
				console.log("Geolocation is not supported by this browser.")
				noGeoLoc()
			}
		}
	)
}
googleDocCallback = function () {
	console.log('Running window.googleDocCallback()')
	return true;
}; //According to https://stackoverflow.com/questions/28546969/cors-authorization-on-google-sheets-api-requests

showResults()