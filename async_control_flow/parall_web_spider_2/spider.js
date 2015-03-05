"use strict";

var fs = require('fs');
var path = require('path');
var utilities = require('./utils');
var mkdirp = require('mkdirp');
var prompt = require('prompt');
var request = require('request');
var async = require('../my_async');
var conf = {
    prompt: {
        properties: {
            url: {
                pattern: /^http:\/\//,
                description: 'Enter URL to download',
                message: 'URL must contain protocol',
                required: true
            },
            nesting: {
                pattern: /\d*/,
                description: 'Enter nesting number',
                message: 'Nesting must be a number',
                required: true
            }
        }
    }
};

prompt.start();

prompt.get(conf.prompt, function(err, result) {
    if (err) {
        console.error(err);
    }
    spider(result.url, Number(result.nesting), function(err, filename) {
        if(err) {
            console.log(err);
        } else {
            console.log('Download complete');
        }
    });
});

function spiderLinks(currentUrl, body, nesting, callback) {
    if(nesting === 0) {
        return process.nextTick(callback);
    }
    var links = utils.getPageLinks(currentUrl, body);
    if(links.length === 0) {
        return process.nextTick(callback);
    }
    var completed = 0, 
        errored = false;

    function done(err) {
        if(err) {
            errored = true;
            return callback(err);
        }
        if(++completed === links.length && !errored) {
            return callback();
        }
    }
    links.forEach(function(link) {
        spider(link, nesting - 1, done);
    });
}

function saveFile(filename, contents, callback) {
    mkdirp(path.dirname(filename), function(err) {
        if(err) {
            return callback(err);
        }
        fs.writeFile(filename, contents, callback);
    });
}

function download(url, filename, callback) {
    console.log('Downloading ' + url);
    request(url, function(err, response, body) {
        if(err) {
            return callback(err);
        }
        saveFile(filename, body, function(err) {
            console.log('Downloaded and saved: ' + url);
            if(err) {
                return callback(err);
            }
            callback(null, body);
        });
    });
}

function spider(url, nesting, callback) {
    var filename = utilities.urlToFilename(url);
    fs.readFile(filename, 'utf8', function(err, body) {
        if(err) {
            if(err.code !== 'ENOENT') {
                return callback(err);
            }

            return download(url, filename, function(err, body) {
                if(err) {
                    return callback(err);
                }
                spiderLinks(url, body, nesting, callback);
            });
        }

        spiderLinks(url, body, nesting, callback);
    });
}
