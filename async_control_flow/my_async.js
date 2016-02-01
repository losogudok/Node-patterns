"use strict";

function iterateSeries(collection, iteratorCallback, finalCallback) {

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

function PromiseTaskQueue(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
}

PromiseTaskQueue.prototype.next = function() {
    var self = this;
    while(self.running < self.concurrency && self.queue.length) {
        var task = self.queue.shift();
        task().then(function() {
            self.running--;
            self.next();
        });
        self.running++;
    }
};

//  var tasks = [...]
//  var promise = Promise.resolve();
//  tasks.forEach(function(task) {
//      promise = promise.then(function() {
//          return task();
//      });
//  });
//  promise.then(function() {
////    All tasks completed
//  });

function seqPromise(collection, iterator) {
    var promise = Promise.resolve();
    collection.forEach(function(item) {
        promise = promise.then(function() {
            return iterator(item);
        });
    });
    return promise;
}

module.exports.seqPromise  = seqPromise;
module.exports.iterateSeries = iterateSeries;
module.exports.iterateParallel = iterateParallel;
module.exports.TaskQueue = TaskQueue;
module.exports.PromiseTaskQueue = PromiseTaskQueue;
