var testData = require('./data/project4_data/data-parser');
var defaults = require('./lib/defaults');
var _ = require('lodash');
var args = process.argv;
var fs = require('fs');

var aco = require('./lib/aco/ant_colony.js');
var pso = require('./lib/pso/particle_optimization.js');
var kmeans = require('./lib/clustering/kmeans.js');
//var compete = require('./lib/competitive/competitive.js');

//Grab passed in values
var data = testData[args[2]](ready);

function determineClusterDistances(inputs, centers) {

}

function ready(data, numberOfInputs, numberOfOutputs) {
	var clusteringType = args[3];
	var bestResult = 2000000000; //Some arbitrarily large value
	var clusteringMethod = null;
	var results = "";

	var filename = args[2].replace('-', '_');
    filename += args[3];

	switch(clusteringType) {
		case ('aco') : 
			aco.init(data);
			for(var i = 0; i < 1000; i++) {
				aco.progress(50);
				bestResult = Math.min(bestResult, determineClusterDistances(data, aco.centers));
			}

			break;
		case ('pso') :
			console.log(args[2] + " pso");
			var options = {
				numSwarms: args[4],		//The number of desierd swarms
				numClusters: args[5],	//The number of desired clusters
				c1: args[6],			//The 'personal' influence
				c2: args[7],			//The 'social' influence
				w: args[8]				//The inertia
			};

			filename += args[6] + args[7] + args[8];
			var resultsArray = [];
			//Initialze the PSO, then run it a bunch of times, logging the results as we go
			for(var m = 0; m < 10; m++) {
				bestResult = 10000000000000000000;
				pso.init(options.numSwarms, options.numClusters, data);
				resultsArray.push([]);
				for(var i = 0; i < 50; i++) {
					var best = pso.progress(1, options, data);

					bestResult = Math.min(bestResult, best.min);
					resultsArray[m].push(bestResult);
				}
				console.log(bestResult);
			}

			for(var i = 0; i < resultsArray[0].length; i++) {
				for(var j = 0; j < resultsArray.length; j++) {
					results += resultsArray[j][i] + ',';
				}
				results += "\n";
			}
			

			break;
		case ('kmeans') :
			console.log(args[2] + " k-means");
			kmeans.init({ data: data, numCenters : args[4] });
			for(var i = 0; i < 50; i++) {
				var centroids = kmeans.progress(1);

				var value = _.reduce(_.map(centroids.centers, function(center) {
					return _.reduce(center.data, function (cur, next) {
						return kmeans.euclidean(next, center.position) + ((cur instanceof Array) ? kmeans.euclidean(cur, center.position) : cur);
					});
				}), function (cur, next) {
					return cur + next;
				});

				bestResult = Math.min(bestResult, value);
			}
			console.log(bestResult);
			break;
		case ('compete') :
			for(var i = 0; i < 1000; i++) {
				compete.train(data);
				bestResult = Math.min(bestResult, determineClusterDistances(data, compete.centers));
			}

			break;
		default:
			break;
	}

    
    storeData(filename, results);
}

function storeData(filename, data, callback) {
    fs.appendFile('./data/project4_data/results/' + filename + '.csv', data + '\n', function (err) {
        if (err) {
            console.log(err);
        } else {
            if (callback) {
                callback.apply();
            }
        }
    });
}