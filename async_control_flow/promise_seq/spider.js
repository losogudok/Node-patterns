var utils = require('../utils');
var request = utils.promisify(require('request'));
var mkdirp = utils.promisify(require('mkdirp'));
var path = require('path');
var fs = require('fs');
var readFile = utils.promisify(fs.readFile);
var writeFile = utils.promisify(fs.writeFile);

spider(process.argv[2], 1)
    .then(function() {
        console.log('Download complete');
    })
    .catch(function(err) {
        console.log(err);
    });

function download(url, filename) {
    console.log('Downloading ' + url);
    var body;
    return request(url)
        .then(function(results) {
            body = results[1];
            return mkdirp(path.dirname(filename));
        })
        .then(function() {
            return writeFile(filename, body);
        })
        .then(function() {
            console.log('Downloaded and saved: ' + url);
            return body;
        });
}

function spider(url, nesting) {
    var filename = utils.urlToFilename(url);
    return readFile(filename, 'utf8')
        .then(
        function(body) {
            return spiderLinks(url, body, nesting);
        },
        function(err) {
            if(err.code !== 'ENOENT') {
                throw err;
            }
            return download(url, filename)
                .then(function(body) {
                    return spiderLinks(url, body, nesting);
                });
        }
    );
}

function spiderLinks(currentUrl, body, nesting) {
    var promise = Promise.resolve();
    if(nesting === 0) {
        return promise;
    }
    var links = utils.getPageLinks(currentUrl, body);
    links.forEach(function(link) {
        promise = promise.then(function() {
            return spider(link, nesting - 1);
        });
    });
    return promise;
}

