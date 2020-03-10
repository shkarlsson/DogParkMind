var Theta1String, Theta1Array, Theta2String, Theta2Array

function getArrayFromDom(domAdress) {
    var string = domAdress
    array = Papa.parse(string, {
        delimiter: ' ',
        dynamicTyping: true,
    }).data
    array.splice(0, 5)
    array.splice(array.length - 3, 3)
    for (var i in array) { array[i].splice(0, 1) }
    return array
}


function sigmoid(t) {
    if (Array.isArray(t)) {
        var r = []
        for (var i = 0; i < t.length; i++) {
            r.push(sigmoid(t[i]))
        }
        return r
    }
    return 1 / (1 + Math.pow(Math.E, -t));
}

function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200 || httpRequest.status === 0) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
}

fetchJSONFile('mlData/Theta1.json', function(data) {
    // do something with your data
    console.log(data);
});

// this requests the file and executes a callback with the parsed result once
//   it is available

$(function() {


    //Helst vill jag använda denna key för den är på mitt privata konto: AIzaSyDd2jd-93JedPXBk7vkt7ijhqyis0iwEeQ
    $.get(
        "https://sheets.googleapis.com/v4/spreadsheets/1kSEiqQllEHYUSTO6Mx_BVtDM6HQXnd2KE_FkoBJzpfI/values/Settings!L1:CV2?key=AIzaSyCdG8ErvyPaYfNXw4Dh4E_QjjPNn78Z6aA",
        function(data) {
            //console.log($("#Theta1Text")['all'])
            var Theta1Array = getArrayFromDom(document.getElementById('Theta1Text')['contentDocument']['all']['3']['innerHTML'])
            var Theta2Array = getArrayFromDom(document.getElementById('Theta2Text')['contentDocument']['all']['3']['innerHTML'])
            var Theta3Array = getArrayFromDom(document.getElementById('Theta3Text')['contentDocument']['all']['3']['innerHTML'])
            var normMuSigma = getArrayFromDom(document.getElementById('normMuSigmaText')['contentDocument']['all']['3']['innerHTML'])
            //$('#about').append(data.values[0][0]); // data.values contains the array of rows from the spreadsheet. Each row is also an array of cell values.
            // Modify the code below to suit the structure of your spreadsheet.
            //$(data.values).each(function() {});
            console.log(data.values[0])
            for (var p in data.values[0]) {
                if (data.values[0][p] == "") { data.values[0][p] = "nullLabel: " + p } //Tror inte att "" matas in i plotly ordentligt.
            }

            //JS Prediction

            //Normalize X
            var X = data.values[1]
            var mu = normMuSigma[0]
            var sigma = normMuSigma[1]
            X = math.dotDivide(math.subtract(X, mu), sigma)
            var numLabels = Theta3Array[0].length


            //% You need to return the following variables correctly 
            //p = zeros(size(X, 1), 1);
            //var num_labels = Theta2.shape[1];
            //var a1 = nj.concatenate(1, X); //För att lägga till biasen
            console.log(X)
            var a1 = X
            a1 = [1, ...a1]
            var z2 = math.multiply(a1, Theta1Array)
            var a2 = sigmoid(z2)
            a2 = [1, ...a2]
            var z3 = math.multiply(a2, Theta2Array)
            var a3 = sigmoid(z3)
            a3 = [1, ...a3]
            var z4 = math.multiply(a3, Theta3Array)
            var P = sigmoid(z4)
            console.log(math.sum(P))

            var predictionGraphData = [{
                x: ['0 dogs', '1 dog', '2 dogs', '3 dogs', '4 dogs', '5 dogs', '6 dogs', '7 dogs', '8 dogs', '9 dogs', '10+ dogs'],
                y: P,
                type: 'bar'
            }];

            Plotly.newPlot('predictionGraph', predictionGraphData, {
                title: "Current Dog Park Popularity Prediction",
                font: {
                    size: 16
                },
                yaxis: {
                    title: 'Probability (Confidence)',
                    titlefont: {
                        size: 14
                    },
                    showticklabels: true,
                    showline: false,
                    tickvals: [0, Math.max(...predictionGraphData[0].y) * 1.05], //3 dots ("...") expands array onto where more than one argument can be taken.
                    ticktext: ['low', 'high'],
                }
            });
/*
            var sankeyData = {
                label: [],
                color: [],
                source: [],
                target: [],
                value: [],
                lineColor: [],
            }
            sankeyData.label.push('Bias') //Bias that is always equal to 1 (and will be multiplied by something according to the Neural Network)
            sankeyData.label.push(...data.values[0])

            for (var i = 0; i < Theta1Array.length; i++) {
                //sankeyData.label.push("Theta1(" + i + ")") //Används endast när label inte redan är definierat.
                sankeyData.color.push("red")
                for (var j = 0; j < Theta1Array[i].length; j++) { //Börja från 1 eftersom arrayerna kommer från octave och läses in med första värder som null.
                    sankeyData.source.push(i)
                    if (Theta1Array[i][j] > 0) {
                        sankeyData.lineColor.push('#333');
                    } else {
                        sankeyData.lineColor.push('#d22');
                    }
                    sankeyData.target.push(Theta1Array.length + j + 1) //-1 eftersom arrayernas första kolumn är null. //+1 för att bias-talet läggs in i varje Theta, men inte i raderna (Det finns alltid en mer rad i nästa array än det finns värden i föregående arrays rader).
                    sankeyData.value.push(Math.abs(Theta1Array[i][j]));
                }
            }

            sankeyData.label.push("Neuron A/Bias");
            sankeyData.color.push("blue");
            for (var i = 0; i < Theta2Array.length; i++) {
                sankeyData.label.push("Neuron A/" + i)
                sankeyData.color.push("blue")
                for (var j = 0; j < Theta2Array[i].length; j++) { //Börja från 1 eftersom arrayerna kommer från octave och läses in med första värder som null.
                    sankeyData.source.push(Theta1Array.length + i)
                    if (Theta2Array[i][j] > 0) {
                        sankeyData.lineColor.push('#333')
                    } else {
                        sankeyData.lineColor.push('#d22')
                    }
                    sankeyData.target.push(Theta1Array.length + Theta2Array.length + j + 1) //-1 eftersom arrayernas första kolumn är null. //+1 för att bias-talet läggs in i varje Theta, men inte i raderna (Det finns alltid en mer rad i nästa array än det finns värden i föregående arrays rader).
                    sankeyData.value.push(Math.abs(Theta2Array[i][j]))
                }
            }

            sankeyData.label.push('0 dogs', '1 dog', '2 dogs', '3 dogs', '4 dogs', '5 dogs', '6 dogs', '7 dogs', '8 dogs', '9 dogs', '10+ dogs')
            sankeyData.color.push('green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green')

            sankeyData.lineColor.push('white')
            sankeyData.source.push(0)
            sankeyData.target.push(Theta1Array.length)
            sankeyData.value.push(0.001)

            var thetasGraphData = [{
                type: "sankey",
                orientation: "h",
                node: {
                    pad: 15,
                    thickness: 30,
                    line: {
                        color: "black",
                        width: 0.0
                    },
                    label: sankeyData.label,
                    color: sankeyData.color
                },

                link: {
                    source: sankeyData.source,
                    target: sankeyData.target,
                    value: sankeyData.value,
                    color: sankeyData.lineColor,
                }
            }]


            Plotly.react(
                'sankeyDiagramDiv',
                thetasGraphData, {
                    title: "Neural Network Theta Representation",
                    font: {
                        size: 16
                    }
                })
            */
        });





});