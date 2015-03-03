"use strict";

var fs = require('fs');
var path = require('path');
var utils = require('./url_utils');
var mkdirp = require('mkdirp');
var prompt = require('prompt');
var request = require('request');
var conf = {
    prompt: {
        properties: {
            url: {
                pattern: /^http:\/\//,
                description: 'Enter URL to download',
                message: 'URL must contain protocol',
                required: true
            }
        }
    }
};

prompt.start();

prompt.get(conf.prompt, function (err, result) {
    if (err) {
        console.error(err);
    }
    spider(result.url, function(err, filename, downloaded) {
        if(err) {
            return console.log(err);
        }
        else if(downloaded){
            return console.log('Completed the download of "'+ filename +'"');
        }
        console.log('"'+ filename +'" was already downloaded');
    });
});

function spider(url, nesting, callback) {
    var filename = utils.urlToFilename(url);

    fs.readFile(filename, 'utf-8', function (err, body) {
        if (err) {
            if (err.code !== "ENOENT") {
                return callback(err);
            }   
            return download(url, filename, function(err){
                if (err) {
                    return callback(err);
                }
                spiderLinks(url, body, nesting, callback);
            });
        }
        spiderLinks(url, body, nesting, callback);
    });
}

function spiderLinks(url, body, nesting, callback) {
    var links;
    if (nesting === 0) {
        return process.nextTick(callback);
    }
    links = getPageLinks(url, body);
    function iterate(index) {
        if (index === links.length) {
            return callback();
        }
        spider(links[index], nesting - 1, Function(err){
            if (err) {
                return callback(err);
            }       
            iterate(index + 1);
        });
    }
}



function download(url, filename, callback) {
    console.log('Downloading ' + url);
    request(url, function(err, res, body) {
        if(err) {
            return callback(err);
        }
        saveFile(filename, body, function(err) {
            console.log('Downloaded and saved: ' + url);
            if(err) {
                return callback(err);
            }
            callback(null);
        });
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