"use strict";

var fs = require('fs');
var path = require('path');
var utils = require('../utils');
var mkdirp = require('mkdirp');
var prompt = require('prompt');
var request = require('request');

prompt.start();

prompt.get({
    properties: {
        url: {
            pattern: /^http:\/\//,
            description: 'Enter URL to download',
            message: 'URL must contain protocol',
            required: true
        }
    }
}, function (err, result) {
    if (err) {
        console.log(err);
        return 1;
    }
    spider(result.url, function(err, filename, downloaded) {
        if(err) {
            console.log(err);
        }
        else if(downloaded){
            console.log('Completed the download of "'+ filename +'"');
        }
        else {
            console.log('"'+ filename +'" was already downloaded');
        }
    });
});

function spider(dlurl, callback) {
    var filename = utils.urlToFilename(dlurl);
    console.log(filename);
    fs.exists(filename, function (exists) { //[1]
        if (!exists) {
            console.log("Downloading " + dlurl);
            request(dlurl, function(err, res, body) {
                if (err) {
                    callback(err);
                }
                else {
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
                }
            });
        }
        else {
            callback(null, filename, false);
        }
    });
}

