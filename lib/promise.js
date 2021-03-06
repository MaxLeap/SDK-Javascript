'use strict';
var _ = require('underscore');

var Promise = module.exports = function Promise(fn) {
  /**
   * A Promise is returned by async methods as a hook to provide callbacks to be
   * called when the async task is fulfilled.
   *
   * <p>Typical usage would be like:<pre>
   *    query.find().then(function(results) {
   *      results[0].set("foo", "bar");
   *      return results[0].saveAsync();
   *    }).then(function(result) {
   *      console.log("Updated " + result.id);
   *    });
   * </pre></p>
   * <p>Another example:<pre>
   *    var promise = new ML.Promise(function(resolve, reject) {
   *      resolve(42);
   *    });
   *    promise.then(function(value){
   *      console.log(value);
   *    }).catch(function(error){
   *      console.error(error);
   *    });
   * </pre></p>
   * @param {Function} fn An optional function with two arguments resolve
   *                   and reject.The first argument fulfills the promise,
   *                   the second argument rejects it. We can call these
    *                  functions, once our operation is completed.
   * @see ML.Promise.prototype.then
   * @class
   */
    this._resolved = false;
    this._rejected = false;
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];

    this.doResolve(fn);
};

var _isNullOrUndefined = function _isNullOrUndefined(x) {
  return _.isNull(x) || _.isUndefined(x);
};

var _isNode = false;

if (typeof(process) !== "undefined" &&
    process.versions &&
    process.versions.node) {
      _isNode = true;
}

_.extend(Promise, /** @lends ML.Promise */ {

  _isPromisesAPlusCompliant: !_isNode,
  _debugError: false,

  setPromisesAPlusCompliant: function(isCompliant) {
    Promise._isPromisesAPlusCompliant = isCompliant;
  },

  setDebugError: function(enable) {
    Promise._debugError = enable;
  },

  /**
   * Returns true iff the given object fulfils the Promise interface.
   * @return {Boolean}
   */
  is: function(promise) {
    return promise && promise.then && _.isFunction(promise.then);
  },

  /**
   * Returns a new promise that is resolved with a given value.
   * @return {ML.Promise} the new promise.
   */
  as: function() {
    var promise = new Promise();
    promise.resolve.apply(promise, arguments);
    return promise;
  },

  /**
   * Returns a new promise that is rejected with a given error.
   * @return {ML.Promise} the new promise.
   */
  error: function() {
    var promise = new Promise();
    promise.reject.apply(promise, arguments);
    return promise;
  },

  /**
   * Returns a new promise that is fulfilled when all of the input promises
   * are resolved. If any promise in the list fails, then the returned promise
   * will fail with the last error. If they all succeed, then the returned
   * promise will succeed, with the results being the results of all the input
   * promises. For example: <pre>
   *   var p1 = ML.Promise.as(1);
   *   var p2 = ML.Promise.as(2);
   *   var p3 = ML.Promise.as(3);
   *
   *   ML.Promise.when(p1, p2, p3).then(function(r1, r2, r3) {
   *     console.log(r1);  // prints 1
   *     console.log(r2);  // prints 2
   *     console.log(r3);  // prints 3
   *   });</pre>
   *
   * The input promises can also be specified as an array: <pre>
   *   var promises = [p1, p2, p3];
   *   ML.Promise.when(promises).then(function(r1, r2, r3) {
   *     console.log(r1);  // prints 1
   *     console.log(r2);  // prints 2
   *     console.log(r3);  // prints 3
   *   });
   * </pre>
   * @param {Array} promises a list of promises to wait for.
   * @return {ML.Promise} the new promise.
   */
  when: function(promises) {
    // Allow passing in Promises as separate arguments instead of an Array.
    var objects;
    if (promises && _isNullOrUndefined(promises.length)) {
      objects = arguments;
    } else {
      objects = promises;
    }
    var isAll = _.last(arguments);
    isAll = _.isBoolean(isAll) ? isAll : false;

    var total = objects.length;
    var hadError = false;
    var results = [];
    var errors = [];
    results.length = objects.length;
    errors.length = objects.length;

    if (total === 0) {
      if(isAll) {
        return Promise.as.call(this, results);
      } else {
        return Promise.as.apply(this, results);
      }
    }

    var promise = new Promise();

    var resolveOne = function(i) {
      total = total - 1;
      if(hadError && !promise._rejected && isAll) {
        promise.reject.call(promise, errors[i]);
        return;
      }

      if (total === 0) {
        if (hadError && !promise._rejected) {
          promise.reject.call(promise, errors);
        } else {
          if(isAll) {
            if(!promise._rejected) {
              promise.resolve.call(promise, results);
            } else {
              //It's rejected already, so we ignore it.
            }
          } else {
            promise.resolve.apply(promise, results);
          }
        }
      }
    };

    _.each(objects, function(object, i) {
      if (Promise.is(object)) {
        object.then(function(result) {
          results[i] = result;
          resolveOne(i);
        }, function(error) {
          errors[i] = error;
          hadError = true;
          resolveOne(i);
        });
      } else {
        results[i] = object;
        resolveOne(i);
      }
    });

    return promise;
  },

  /**
   * Returns a promise that resolves or rejects as soon as one
   * of the promises in the iterable resolves or rejects, with
   * the value or reason from that promise.Returns a new promise
   * that is fulfilled when one of the input promises.
   * For example: <pre>
   *   var p1 = ML.Promise.as(1);
   *   var p2 = ML.Promise.as(2);
   *   var p3 = ML.Promise.as(3);
   *
   *   ML.Promise.race(p1, p2, p3).then(function(result) {
   *     console.log(result);  // prints 1
   *   });</pre>
   *
   * The input promises can also be specified as an array: <pre>
   *   var promises = [p1, p2, p3];
   *   ML.Promise.when(promises).then(function(result) {
   *     console.log(result);  // prints 1
   *   });
   * </pre>
   * @param {Array} promises a list of promises to wait for.
   * @return {ML.Promise} the new promise.
   */
  race: function(promises) {
    // Allow passing in Promises as separate arguments instead of an Array.
    var objects;
    if (promises && _isNullOrUndefined(promises.length)) {
      objects = arguments;
    } else {
      objects = promises;
    }

    var total = objects.length;
    var hadError = false;
    var results = [];
    var errors = [];

    results.length = errors.length = objects.length;

    if (total === 0) {
      return Promise.as.call(this);
    }

    var promise = new Promise();

    var resolveOne = function(i) {
      if (!promise._resolved && !promise._rejected) {
        if (hadError) {
          promise.reject.call(promise, errors[i]);
        } else {
          promise.resolve.call(promise, results[i]);
        }
      }
    };

    _.each(objects, function(object, i) {
      if (Promise.is(object)) {
        object.then(function(result) {
          results[i] = result;
          resolveOne(i);
        }, function(error) {
          errors[i] = error;
          hadError = true;
          resolveOne(i);
        });
      } else {
        results[i] = object;
        resolveOne(i);
      }
    });

    return promise;
  },

  /**
   * Runs the given asyncFunction repeatedly, as long as the predicate
   * function returns a truthy value. Stops repeating if asyncFunction returns
   * a rejected promise.
   * @param {Function} predicate should return false when ready to stop.
   * @param {Function} asyncFunction should return a Promise.
   */
  _continueWhile: function(predicate, asyncFunction) {
    if (predicate()) {
      return asyncFunction().then(function() {
        return Promise._continueWhile(predicate, asyncFunction);
      });
    }
    return Promise.as();
  }
});

/**
 * Just like ML.Promise.when, but it calls resolveCallbck function
 * with one results array and calls rejectCallback function as soon as any one
 * of the input promises rejects.
 * @see ML.Promise.when
 */
Promise.all = function(promises) {
  return Promise.when(promises, true);
};

_.extend(Promise.prototype, /** @lends ML.Promise.prototype */ {

  /**
   * Marks this promise as fulfilled, firing any callbacks waiting on it.
   * @param {Object} result the result to pass to the callbacks.
   */
  resolve: function(result) {
    if (this._resolved || this._rejected) {
      throw "A promise was resolved even though it had already been " +
        (this._resolved ? "resolved" : "rejected") + ".";
    }
    this._resolved = true;
    this._result = arguments;
    var results = arguments;
    _.each(this._resolvedCallbacks, function(resolvedCallback) {
      resolvedCallback.apply(this, results);
    });
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];
  },

  doResolve: function(fn){
    if (!fn) return;
    var done = false;
    var self = this;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        self.resolve.call(self, value);
      }, function (reason) {
           if (done) return;
           done = true;
           self.reject.call(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      self.reject.call(self, ex);
    }
  },

  /**
   * Marks this promise as fulfilled, firing any callbacks waiting on it.
   * @param {Object} error the error to pass to the callbacks.
   */
  reject: function(error) {
    if (this._resolved || this._rejected) {
      throw "A promise was rejected even though it had already been " +
        (this._resolved ? "resolved" : "rejected") + ".";
    }
    this._rejected = true;
    this._error = error;
    _.each(this._rejectedCallbacks, function(rejectedCallback) {
      rejectedCallback(error);
    });
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];
  },

  /**
   * Adds callbacks to be called when this promise is fulfilled. Returns a new
   * Promise that will be fulfilled when the callback is complete. It allows
   * chaining. If the callback itself returns a Promise, then the one returned
   * by "then" will not be fulfilled until that one returned by the callback
   * is fulfilled.
   * @param {Function} resolvedCallback Function that is called when this
   * Promise is resolved. Once the callback is complete, then the Promise
   * returned by "then" will also be fulfilled.
   * @param {Function} rejectedCallback Function that is called when this
   * Promise is rejected with an error. Once the callback is complete, then
   * the promise returned by "then" with be resolved successfully. If
   * rejectedCallback is null, or it returns a rejected Promise, then the
   * Promise returned by "then" will be rejected with that error.
   * @return {ML.Promise} A new Promise that will be fulfilled after this
   * Promise is fulfilled and either callback has completed. If the callback
   * returned a Promise, then this Promise will not be fulfilled until that
   * one is.
   */
  then: function(resolvedCallback, rejectedCallback) {
    var promise = new Promise();

    var wrappedResolvedCallback = function() {
      var result = arguments;
      if (resolvedCallback) {
        if (Promise._isPromisesAPlusCompliant) {
          try {
            result = [resolvedCallback.apply(this, result)];
          } catch (e) {
            if(Promise._debugError && e) {
              console.error('Error occurred in promise resolve callback.', e.stack || e);
            }
            result = [Promise.error(e)];
          }
        } else {
          result = [resolvedCallback.apply(this, result)];
        }
      }
      if (result.length === 1 && Promise.is(result[0])) {
        result[0].then(function() {
          promise.resolve.apply(promise, arguments);
        }, function(error) {
          promise.reject(error);
        });
      } else {
        promise.resolve.apply(promise, result);
      }
    };

    var wrappedRejectedCallback = function(error) {
      var result = [];
      if (rejectedCallback) {
        if (Promise._isPromisesAPlusCompliant) {
          try {
            result = [rejectedCallback(error)];
          } catch (e) {
            if(Promise._debugError && e) {
              console.error('Error occurred in promise reject callback.', e.stack || e);
            }
            result = [Promise.error(e)];
          }
        } else {
          result = [rejectedCallback(error)];
        }
        if (result.length === 1 && Promise.is(result[0])) {
          result[0].then(function() {
            promise.resolve.apply(promise, arguments);
          }, function(error) {
            promise.reject(error);
          });
        } else {
          if (Promise._isPromisesAPlusCompliant) {
            promise.resolve.apply(promise, result);
          } else {
            promise.reject(result[0]);
          }
        }
      } else {
        promise.reject(error);
      }
    };

    var runLater = function(func) {
      func.call();
    };
    if (Promise._isPromisesAPlusCompliant) {
      if (typeof(window) !== 'undefined' && _.isFunction(window.setImmediate)) {
        runLater = function(func) {
          window.setImmediate(func);
        };
      } else if (typeof(process) !== 'undefined' && process.nextTick) {
        runLater = function(func) {
           process.nextTick(func);
        };
      } else if (typeof(setTimeout) !== 'undefined' && _.isFunction(setTimeout)) {
        runLater = function(func) {
          setTimeout(func, 0);
        };
      }
    }

    var self = this;
    if (this._resolved) {
      runLater(function() {
        wrappedResolvedCallback.apply(self, self._result);
      });
    } else if (this._rejected) {
      runLater(function() {
        wrappedRejectedCallback.apply(self, [self._error]);
      });
    } else {
      this._resolvedCallbacks.push(wrappedResolvedCallback);
      this._rejectedCallbacks.push(wrappedRejectedCallback);
    }

    return promise;
  },

  /**
   * Add handlers to be called when the Promise object is rejected.
   *
   * @param {Function} rejectedCallback Function that is called when this
   *                   Promise is rejected with an error.
   * @return {ML.Promise} A new Promise that will be fulfilled after this
   *                   Promise is fulfilled and either callback has completed. If the callback
   * returned a Promise, then this Promise will not be fulfilled until that
   *                   one is.
   * @function
   */
  catch: function(onRejected) {
    return this.then(undefined, onRejected);
  },

  /**
   * Add handlers to be called when the promise
   * is either resolved or rejected
   */
  always: function(callback) {
    return this.then(callback, callback);
  },

  /**
   * Add handlers to be called when the Promise object is resolved
   */
  done: function(callback) {
    return this.then(callback);
  },

  /**
   * Add handlers to be called when the Promise object is rejected
   */
  fail: function(callback) {
    return this.then(null, callback);
  },

  /**
   * Run the given callbacks after this promise is fulfilled.
   * @param optionsOrCallback {} A Backbone-style options callback, or a
   * callback function. If this is an options object and contains a "model"
   * attributes, that will be passed to error callbacks as the first argument.
   * @param model {} If truthy, this will be passed as the first result of
   * error callbacks. This is for Backbone-compatability.
   * @return {ML.Promise} A promise that will be resolved after the
   * callbacks are run, with the same result as this.
   */
  _thenRunCallbacks: function(optionsOrCallback, model) {
    var options;
    if (_.isFunction(optionsOrCallback)) {
      var callback = optionsOrCallback;
      options = {
        success: function(result) {
          callback(result, null);
        },
        error: function(error) {
          callback(null, error);
        }
      };
    } else {
      options = _.clone(optionsOrCallback);
    }
    options = options || {};

    return this.then(function(result) {
      if (options.success) {
        options.success.apply(this, arguments);
      } else if (model) {
        // When there's no callback, a sync event should be triggered.
        model.trigger('sync', model, result, options);
      }
      return Promise.as.apply(Promise, arguments);
    }, function(error) {
      if (options.error) {
        if (!_.isUndefined(model)) {
          options.error(model, error);
        } else {
          options.error(error);
        }
      } else if (model) {
        // When there's no error callback, an error event should be triggered.
        model.trigger('error', model, error, options);
      }
      // By explicitly returning a rejected Promise, this will work with
      // either jQuery or Promises/A semantics.
      return Promise.error(error);
    });
  },

  /**
   * Adds a callback function that should be called regardless of whether
   * this promise failed or succeeded. The callback will be given either the
   * array of results for its first argument, or the error as its second,
   * depending on whether this Promise was rejected or resolved. Returns a
   * new Promise, like "then" would.
   * @param {Function} continuation the callback.
   */
  _continueWith: function(continuation) {
    return this.then(function() {
      return continuation(arguments, null);
    }, function(error) {
      return continuation(null, error);
    });
  }

});

/**
 * Alias of ML.Promise.prototype.always
 * @function
 * @see ML.Promise#always
 */
Promise.prototype.finally = Promise.prototype.always;

/**
 * Alias of ML.Promise.prototype.done
 * @function
 * @see ML.Promise#done
 */
Promise.prototype.try = Promise.prototype.done;
