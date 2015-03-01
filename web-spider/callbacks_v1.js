var http = require('http');
var fs = require('fs');
var path = require('path');

function urlToFilename() {
    
}

function spider(url, callback) {
    var filename = urlToFilename(url);
    fs.exists(filename, function (exists) { //[1]
        if (!exists) {
            console.log("Downloading " + url);
            http.get("http://www.google.com/index.html", function(res) {
              mkdirp(path.dirname(filename), function (err) { //[3]
                    if (err) {
                        callback(err);
                    } 
                    else {
                        fs.writeFile(filename, body, function (err) { //[4]
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, filename, true);
                            }
                        });
                    }
                });
            })
            .on('error', function(err) {
              callback(err);
            });
        } else {
            callback(null, filename, false);
        }
    });
}