 function iterateSeries(collection, iteratorCallback, finalCallback) {
     "use strict";

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

function iterateParallel(collection, iterator, final) {
  var completed = 0;

  function done(err) {
      if (err) {
          return final(err);
      }
      else {
        completed++;
        if (completed === collection.length) {
          final();
        }
      }
  }

  collection.forEach(function(item){
      iterator(item, done)
  });
}


module.exports.iterateSeries = iterateSeries;
module.exports.iterateParallel = iterateParallel;
