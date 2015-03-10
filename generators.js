"use strict";

var fs = require('fs');
var path = require('path');
var testFilePath = path.join(__dirname, 'test', 'test.txt');

function asyncFlow(generatorFunction) {
    function callback(err) {
        if(err) {
            return generator.throw(err);
        }
        var results = [].slice.call(arguments, 1);
        generator.next(results.length > 1 ? results : results[0]);
    }
    var generator = generatorFunction(callback);
    generator.next();
}

asyncFlow(function* (callback) {
//  Синхронный код!
    var fileName = path.basename(testFilePath);
    var myself = yield fs.readFile(testFilePath, 'utf8', callback);
    
    yield fs.writeFile(path.join(__dirname, 'test', 'clone_of_' + fileName), myself, callback);
    console.log('Clone created');
});

// THUNKS
function asyncFlowWithThunks(generatorFunction) {
    function callback(err) {
        if(err) {
            return generator.throw(err);
        }
        var results = [].slice.call(arguments, 1);
        var thunk = generator.next(results.length > 1 ? results : results[0]).value;
        thunk && thunk(callback);
    }
    var generator = generatorFunction();
    var thunk = generator.next().value;
    thunk && thunk(callback);
}

asyncFlowWithThunks(function* () {
    var myself = yield readFileThunk(__filename, 'utf8');
    yield writeFileThunk("clone of clone.js", myself);
    console.log("Clone created");
});

function readFileThunk(filename, options) {
    return function(callback) {
        fs.readFile(filename, options, callback);
    };
}

function writeFileThunk(path, body) {
    return function(callback) {
        fs.writeFile(path, body, callback);
    };
}