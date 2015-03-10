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
  var completed = 0,
      globalErr = false;

  function done(err) {
      if (err) {
          globalErr = true;
          return final(err);
      }
      else {
        completed++;
        if (completed === collection.length && !globalErr) {
          final();
        }
      }
  }

  collection.forEach(function(item){
      iterator(item, done);
  });
}

function TaskQueue(concurrency) {
  this.concurrency = concurrency;
  this.running = 0;
  this.queue = [];
}

TaskQueue.prototype = {
  pushTask: function(task) {
    this.queue.push(task);
    this.next();  
  },
  next: function() {
    var self = this;
    while(self.running < self.concurrency && self.queue.length) {
      var task = self.queue.shift();
      task(function(err) {
        self.running--;
        self.next();
      });
      self.running++;
    }
  }
};


module.exports.iterateSeries = iterateSeries;
module.exports.iterateParallel = iterateParallel;
module.exports.TaskQueue = TaskQueue;
