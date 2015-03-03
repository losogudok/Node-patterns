iterateSeries(collection, iteratorCallback, finalCallback) {
    function iterate(index) {
        if (index === collection.length) {
            return finalCallback();
        }
        iteratorCallback(collection[index], function(err){
            if (err) {
                return finalCallback(err);
            }       
            iterate(index + 1);
        });
    }
    iterate(0);
}

module.exports.iterateSeries = iterateSeries;