"use strict";

var utils = require('../utils');
var thunkify = require('thunkify');
var co = require('co');
var path = require('path');
var request = thunkify(require('request'));
var fs = require('fs');
var mkdirp = thunkify(require('mkdirp'));
var readFile = thunkify(fs.readFile);
var writeFile = thunkify(fs.writeFile);
var nextTick = thunkify(process.nextTick);
var spiderings = {};

co(function* () {
    try {
        yield spider(process.argv[2], 1);
        console.log('Download complete');
    }
    catch(err) {
        console.log(err);
    }
})
.then(function(){

});


function* download(url, filename) {
    console.log('Downloading ' + url);
    var results = yield request(url);
    var body = results[1];
    yield mkdirp(path.dirname(filename));
    yield writeFile(filename, body);
    console.log('Downloaded and saved:' + url);
    return body;
}

function* spider(url, nesting) {
    var filename = utils.urlToFilename(url);
    var body;
    if (spiderings[url]) {
        return;
    }
    try {
        body = yield readFile(filename, 'utf8');
    }
    catch(err) {
        if(err.code !== 'ENOENT') {
            throw err;
        }
        spiderings[url] = true;
        body = yield download(url, filename);
    }
    yield spiderLinks(url, body, nesting);
}

function* spiderLinks(currentUrl, body, nesting) {
    if(nesting === 0) {
        return nextTick();
    }
    var links = utils.getPageLinks(currentUrl, body);
    var tasks = links.map(function(link) {
        return spider(link, nesting - 1);
    });
    yield tasks;
}