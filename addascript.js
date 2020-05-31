var isIE = /*@cc_on!@*/ false || !!document.documentMode;
if (isIE) {
	alert("Det verkar som att du använder Internet Explorer. Vissa funktioner på sajten kan därför fungera dåligt. Vänligen överväg att byta till en modern webbläsare, såsom Chrome eller Firefox.")
}

var pointLayer, tidigareSynpunkter, globalValues, zoomYtor, parkeringar, aktivParkering, currentLocationCircle, currentLocationDot

var baseMaps = {
	"Light": L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVycmthcmxzb24iLCJhIjoiY2p3aWE5dzR0MmU0eTQzbXFpeDBmanBrZSJ9.IcsRbVMHdM1nkNHEPZvAbg'),
	"Colored": L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVycmthcmxzb24iLCJhIjoiY2p3aWE5dzR0MmU0eTQzbXFpeDBmanBrZSJ9.IcsRbVMHdM1nkNHEPZvAbg'),
	"Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
		options: {
			position: 'bottomleft'
		},
	}),
}

var map = L.map('map', {
	//center: [59.3274541, 18.0543566],
	zoom: 13,
	layers: [baseMaps['Satellite']]
})

var parkMarkerToBeAdded, popupContent; // replace marker

map.on('click', function(e) {
	var popupContent = ''
	popupContent += '<form style="width:200px" js_action="https://script.google.com/macros/s/AKfycbyHBSts9-u_ixD-ZfidpQpABO_173B9OaklBGCT/exec" id="gform">'
	popupContent += '<input type="text" name="ParkName" class="form-control" value="" placeholder="New park name" pattern=".{2,}" required title="2 characters minimum">'
	popupContent += '<input type="text" name="LocationDescription" class="form-control" value="" placeholder="Location Description" pattern=".{10,}" required title="10 characters minimum">'
	popupContent += '<input type="hidden" value="aNewPark" name="WhichPark">'
	popupContent += '<input type="hidden" value="' + e.latlng.lng + '" name="ParkLocationLon">'
	popupContent += '<input type="hidden" value="' + e.latlng.lat + '" name="ParkLocationLat">'
	popupContent += '<button type="button" id="submit_button" class="btn btn-primary" onClick="jsSubmitForm(this.form)">Submit</button>'
	popupContent += '</form>'
	if (typeof(parkMarkerToBeAdded) === 'undefined') {
		parkMarkerToBeAdded = new L.circle(e.latlng, {
			draggable: true,
			radius: 0,
			weight: 0
		});
		parkMarkerToBeAdded.bindPopup(popupContent, {
			maxWidth: "auto"
		})
		parkMarkerToBeAdded.addTo(map);
		/*$("#gform").submit(function() {
			jsSubmitForm($("#gform"))
			return false;
		});*/
	} else {
		parkMarkerToBeAdded.setLatLng(e.latlng);
	}
	parkMarkerToBeAdded.bindPopup(popupContent)

	parkMarkerToBeAdded.openPopup()
});

function updateCurrentLocationMarker(e) {
	//L.marker(e.latlng).addTo(map)
	//	.bindPopup("You are within " + radius + " meters from this point").openPopup();
	if (currentLocationDot) {
		map.removeLayer(currentLocationDot)
		map.removeLayer(currentLocationCircle)
	}
	currentLocationDot = L.circle(e.latlng, {
		radius: e.accuracy / 2,
		fillColor: '#007bff',
		color: '#007bff',
		weight: 2,
		opacity: 1,
		fillOpacity: 0.1
	}).addTo(map);

	currentLocationCircle = L.circle(e.latlng, {
		radius: 1,
		fillColor: '#007bff',
		color: '#007bff',
		weight: 4,
		opacity: 1,
		fillOpacity: 0.8
	}).addTo(map);
}

map.on('locationfound', updateCurrentLocationMarker);
map.locate({
	setView: true,
	zoom: 12,
	//watch: true,
	//maxZoom: 8
});

//Add layers to top right menu
L.control.layers(baseMaps).addTo(map)

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
var colors = {
	'red99': '#e6194B',
	'green99': '#3cb44b',
	'yellow100': '#ffe119',
	'blue100': '#4363d8',
	'orange9999': '#f58231',
	'purple95': '#911eb4',
	'cyan99': '#42d4f4',
	'magenta99': '#f032e6',
	'lime95': '#bfef45',
	'pink9999': '#fabebe',
	'teal99': '#469990',
	'lavender9999': '#e6beff',
	'brown99': '#9A6324',
	'beige99': '#fffac8',
	'maroon9999': '#800000',
	'mint99': '#aaffc3',
	'olive95': '#808000',
	'apricot95': '#ffd8b1',
	'navy9999': '#000075',
	'grey100': '#a9a9a9',
	'white100': '#ffffff',
	'black100': '#000000',
}


function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition) //Only happens once, as opposed to .watchPosition
	} else {
		console.log("Geolocation is not supported by this browser.")
		$('[name="SenderLocation"]').val('NotAvailable')
	}

}

function showPosition(position) {
	console.log(position)
	map.panTo(new L.LatLng(position.coords.latitude, position.coords.longitude));
}
getLocation()

var goToPositionButton = L.Control.extend({
	options: {
		position: 'topright'
	},
	onAdd: function(map) {
		//<button id="add-button" type="button" class="btn btn-secondary btn-sm"><span class="fa fa-location-arrow"></span></button>
		var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom btn btn-secondary btn-sm');
		container.appendChild(L.DomUtil.create('span', 'fa fa-location-arrow'))
		container.onclick = function() {
			map.panTo(currentLocation.dot._latlng)
		}
		return container;
	}
});

map.addControl(new goToPositionButton());

function jsSubmitForm(e) {
	if (e.checkValidity()) {
		var es = $(e).serialize()
		console.log(es)
		$.post($(e).attr('js_action'), es, function(response) {
			// do something here on success
			$(e).append
		}, 'json');
		$('body').children().remove()
		$('body').append('<div class="col-md-6 offset-md-3 mt-5 text-center" id="thanks"><h2>' +
			'Thank you for your contribution! </h2>' +
			'<p>Your suggestion will go live in a couple of minutes. Initially, the algorithm will assume that the park is like other parks in its predictions. With just a few observations for the newly added park (submitted by users) it will adjust and make predictions specifically tailored to the new park. <a href="https://karlssonprojects.com/DogParkPopPredict/">Take me back to the front page.</a></p></div>')
	}
	return false;
}

allMarkers = []

$.get(
	"https://docs.google.com/spreadsheets/d/e/2PACX-1vRFp-Zv8-MhnnmFqNeGvZCBzYlRhP3G59TnNRCjOU06ixyzT8wA0miWi-Ewxw4Ay5lrG3b56dj7qUXU/pub?gid=1716930661&single=true&output=csv",
	//Reading the data from google sheets...
	function(data) {
		data = CSVToArray(data)
		for (var i = 1; i < data.length; i++) {
			console.log(data[i])
			allMarkers.push(L.marker([data[i][3], data[i][2]], {
					icon: L.AwesomeMarkers.icon({
						icon: 'help-buoy',
						markerColor: '#007bff'
					})
				}).bindPopup('<b>' + data[i][0] + '</b><br>' + data[i][1])
				.openPopup())
			console.log(data[i][2] + data[i][3])
		}
		//console.log(data)
		var group = L.featureGroup(allMarkers).addTo(map);
		//map.fitBounds(group.getBounds());
	}
)