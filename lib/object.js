'use strict';

var _ = require('underscore');

// ML.Object is analogous to the Java MLObject.
// It also implements the same interface as a Backbone model.

module.exports = function (ML) {
  /**
   * Creates a new model with defined attributes. A client id (cid) is
   * automatically generated and assigned for you.
   *
   * <p>You won't normally call this method directly.  It is recommended that
   * you use a subclass of <code>ML.Object</code> instead, created by calling
   * <code>extend</code>.</p>
   *
   * <p>However, if you don't want to use a subclass, or aren't sure which
   * subclass is appropriate, you can use this form:<pre>
   *     var object = new ML.Object("ClassName");
   * </pre>
   * That is basically equivalent to:<pre>
   *     var MyClass = ML.Object.extend("ClassName");
   *     var object = new MyClass();
   * </pre></p>
   *
   * @param {Object} attributes The initial set of data to store in the object.
   * @param {Object} options A set of Backbone-like options for creating the
   *     object.  The only option currently supported is "collection".
   * @see ML.Object.extend
   *
   * @class
   *
   * <p>The fundamental unit of ML data, which implements the Backbone Model
   * interface.</p>
   */
  ML.Object = function (attributes, options) {
    // Allow new ML.Object("ClassName") as a shortcut to _create.
    if (_.isString(attributes)) {
      return ML.Object._create.apply(this, arguments);
    }

    attributes = attributes || {};
    if (options && options.parse) {
      attributes = this.parse(attributes);
    }
    var defaults = ML._getValue(this, 'defaults');
    if (defaults) {
      attributes = _.extend({}, defaults, attributes);
    }
    if (options && options.collection) {
      this.collection = options.collection;
    }

    this._serverData = {};  // The last known data for this object from cloud.
    this._opSetQueue = [{}];  // List of sets of changes to the data.
    this.attributes = {};  // The best estimate of this's current data.

    this._hashedJSON = {};  // Hash of values of containers at last save.
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.changed = {};
    this._silent = {};
    this._pending = {};
    if (!this.set(attributes, {silent: true})) {
      throw new Error("Can't create an invalid ML.Object");
    }
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this._hasData = true;
    this._previousAttributes = _.clone(this.attributes);
    this.initialize.apply(this, arguments);
  };

  /**
   * @lends ML.Object.prototype
   * @property {String} id The objectId of the ML Object.
   */

  /**
   * Saves the given list of ML.Object.
   * If any error is encountered, stops and calls the error handler.
   * There are two ways you can call this function.
   *
   * The Backbone way:<pre>
   *   ML.Object.saveAll([object1, object2, ...], {
   *     success: function(list) {
   *       // All the objects were saved.
   *     },
   *     error: function(error) {
   *       // An error occurred while saving one of the objects.
   *     },
   *   });
   * </pre>
   * A simplified syntax:<pre>
   *   ML.Object.saveAll([object1, object2, ...], function(list, error) {
   *     if (list) {
   *       // All the objects were saved.
   *     } else {
   *       // An error occurred.
   *     }
   *   });
   * </pre>
   *
   * @param {Array} list A list of <code>ML.Object</code>.
   * @param {Object} options A Backbone-style callback object.
   */
  ML.Object.saveAll = function (list, options) {
    return ML.Object._deepSaveAsync(list)._thenRunCallbacks(options);
  };

  // Attach all inheritable methods to the ML.Object prototype.
  _.extend(ML.Object.prototype, ML.Events,
    /** @lends ML.Object.prototype */ {
      _existed: false,
      _fetchWhenSave: false,

      /**
       * Initialize is an empty function by default. Override it with your own
       * initialization logic.
       */
      initialize: function () {
      },

      /**
       * Set whether to enable fetchWhenSave option when updating object.
       * When set true, SDK would fetch the latest object after saving.
       * Default is false.
       * @param {boolean} enable  true to enable fetchWhenSave option.
       */
      fetchWhenSave: function (enable) {
        if (!_.isBoolean(enable)) {
          throw "Expect boolean value for fetchWhenSave";
        }
        this._fetchWhenSave = enable;
      },

      /**
       * Returns the object's objectId.
       * @return {String} the objectId.
       */
      getObjectId: function () {
        return this.id;
      },

      /**
       * Returns the object's createdAt attribute.
       * @return {Date}
       */
      getCreatedAt: function () {
        return this.createdAt || this.get('createdAt');
      },

      /**
       * Returns the object's updatedAt attribute.
       * @return {Date}
       */
      getUpdatedAt: function () {
        return this.updatedAt || this.get('updatedAt');
      },

      /**
       * Returns a JSON version of the object suitable for saving to ML.
       * @return {Object}
       */
      toJSON: function () {
        var json = this._toFullJSON();
        ML._arrayEach(["__type", "className"],
          function (key) {
            delete json[key];
          });
        return json;
      },

      _toFullJSON: function (seenObjects) {
        var json = _.clone(this.attributes);
        ML._objectEach(json, function (val, key) {
          json[key] = ML._encode(val, seenObjects);
        });
        ML._objectEach(this._operations, function (val, key) {
          json[key] = val;
        });

        if (_.has(this, "id")) {
          json.objectId = this.id;
        }
        if (_.has(this, "createdAt")) {
          if (_.isDate(this.createdAt)) {
            json.createdAt = this.createdAt.toJSON();
          } else {
            json.createdAt = this.createdAt;
          }
        }

        if (_.has(this, "updatedAt")) {
          if (_.isDate(this.updatedAt)) {
            json.updatedAt = this.updatedAt.toJSON();
          } else {
            json.updatedAt = this.updatedAt;
          }
        }
        json.__type = "Object";
        json.className = this.className;
        return json;
      },

      /**
       * Updates _hashedJSON to reflect the current state of this object.
       * Adds any changed hash values to the set of pending changes.
       */
      _refreshCache: function () {
        var self = this;
        if (self._refreshingCache) {
          return;
        }
        self._refreshingCache = true;
        ML._objectEach(this.attributes, function (value, key) {
          if (value instanceof ML.Object) {
            value._refreshCache();
          } else if (_.isObject(value)) {
            if (self._resetCacheForKey(key)) {
              self.set(key, new ML.Op.Set(value), {silent: true});
            }
          }
        });
        delete self._refreshingCache;
      },

      /**
       * Returns true if this object has been modified since its last
       * save/refresh.  If an attribute is specified, it returns true only if that
       * particular attribute has been modified since the last save/refresh.
       * @param {String} attr An attribute name (optional).
       * @return {Boolean}
       */
      dirty: function (attr) {
        this._refreshCache();

        var currentChanges = _.last(this._opSetQueue);

        if (attr) {
          return (currentChanges[attr] ? true : false);
        }
        if (!this.id) {
          return true;
        }
        if (_.keys(currentChanges).length > 0) {
          return true;
        }
        return false;
      },

      /**
       * Gets a Pointer referencing this Object.
       */
      _toPointer: function () {
        // if (!this.id) {
        //   throw new Error("Can't serialize an unsaved ML.Object");
        // }
        return {
          __type: "Pointer",
          className: this.className,
          objectId: this.id
        };
      },

      /**
       * Gets the value of an attribute.
       * @param {String} attr The string name of an attribute.
       */
      get: function (attr) {
        return this.attributes[attr];
      },

      /**
       * Gets a relation on the given class for the attribute.
       * @param String attr The attribute to get the relation for.
       */
      relation: function (attr) {
        var value = this.get(attr);
        if (value) {
          if (!(value instanceof ML.Relation)) {
            throw "Called relation() on non-relation field " + attr;
          }
          value._ensureParentAndKey(this, attr);
          return value;
        } else {
          return new ML.Relation(this, attr);
        }
      },

      /**
       * Gets the HTML-escaped value of an attribute.
       */
      escape: function (attr) {
        var html = this._escapedAttributes[attr];
        if (html) {
          return html;
        }
        var val = this.attributes[attr];
        var escaped;
        if (ML._isNullOrUndefined(val)) {
          escaped = '';
        } else {
          escaped = _.escape(val.toString());
        }
        this._escapedAttributes[attr] = escaped;
        return escaped;
      },

      /**
       * Returns <code>true</code> if the attribute contains a value that is not
       * null or undefined.
       * @param {String} attr The string name of the attribute.
       * @return {Boolean}
       */
      has: function (attr) {
        return !ML._isNullOrUndefined(this.attributes[attr]);
      },

      /**
       * Pulls "special" fields like objectId, createdAt, etc. out of attrs
       * and puts them on "this" directly.  Removes them from attrs.
       * @param attrs - A dictionary with the data for this ML.Object.
       */
      _mergeMagicFields: function (attrs) {
        // Check for changes of magic fields.
        var model = this;
        var specialFields = ["id", "objectId", "createdAt", "updatedAt"];
        ML._arrayEach(specialFields, function (attr) {
          if (attrs[attr]) {
            if (attr === "objectId") {
              model.id = attrs[attr];
            } else if ((attr === "createdAt" || attr === "updatedAt") && !_.isDate(attrs[attr])) {
              model[attr] = ML._parseDate(attrs[attr]);
            } else {
              model[attr] = attrs[attr];
            }
            delete attrs[attr];
          }
        });
      },

      /**
       * Returns the json to be sent to the server.
       */
      _startSave: function () {
        this._opSetQueue.push({});
      },

      /**
       * Called when a save fails because of an error. Any changes that were part
       * of the save need to be merged with changes made after the save. This
       * might throw an exception is you do conflicting operations. For example,
       * if you do:
       *   object.set("foo", "bar");
       *   object.set("invalid field name", "baz");
       *   object.save();
       *   object.increment("foo");
       * then this will throw when the save fails and the client tries to merge
       * "bar" with the +1.
       */
      _cancelSave: function () {
        var self = this;
        var failedChanges = _.first(this._opSetQueue);
        this._opSetQueue = _.rest(this._opSetQueue);
        var nextChanges = _.first(this._opSetQueue);
        ML._objectEach(failedChanges, function (op, key) {
          var op1 = failedChanges[key];
          var op2 = nextChanges[key];
          if (op1 && op2) {
            nextChanges[key] = op2._mergeWithPrevious(op1);
          } else if (op1) {
            nextChanges[key] = op1;
          }
        });
        this._saving = this._saving - 1;
      },

      /**
       * Called when a save completes successfully. This merges the changes that
       * were saved into the known server data, and overrides it with any data
       * sent directly from the server.
       */
      _finishSave: function (serverData) {
        // Grab a copy of any object referenced by this object. These instances
        // may have already been fetched, and we don't want to lose their data.
        // Note that doing it like this means we will unify separate copies of the
        // same object, but that's a risk we have to take.
        var fetchedObjects = {};
        ML._traverse(this.attributes, function (object) {
          if (object instanceof ML.Object && object.id && object._hasData) {
            fetchedObjects[object.id] = object;
          }
        });

        var savedChanges = _.first(this._opSetQueue);
        this._opSetQueue = _.rest(this._opSetQueue);
        this._applyOpSet(savedChanges, this._serverData);
        this._mergeMagicFields(serverData);
        var self = this;
        ML._objectEach(serverData, function (value, key) {
          self._serverData[key] = ML._decode(key, value);

          // Look for any objects that might have become unfetched and fix them
          // by replacing their values with the previously observed values.
          var fetched = ML._traverse(self._serverData[key], function (object) {
            if (object instanceof ML.Object && fetchedObjects[object.id]) {
              return fetchedObjects[object.id];
            }
          });
          if (fetched) {
            self._serverData[key] = fetched;
          }
        });
        this._rebuildAllEstimatedData();
        this._saving = this._saving - 1;
      },

      /**
       * Called when a fetch or login is complete to set the known server data to
       * the given object.
       */
      _finishFetch: function (serverData, hasData) {
        // Clear out any changes the user might have made previously.
        this._opSetQueue = [{}];

        // Bring in all the new server data.
        this._mergeMagicFields(serverData);
        var self = this;
        ML._objectEach(serverData, function (value, key) {
          self._serverData[key] = ML._decode(key, value);
        });

        // Refresh the attributes.
        this._rebuildAllEstimatedData();

        // Clear out the cache of mutable containers.
        this._refreshCache();
        this._opSetQueue = [{}];

        this._hasData = hasData;
      },

      /**
       * Applies the set of ML.Op in opSet to the object target.
       */
      _applyOpSet: function (opSet, target) {
        var self = this;
        ML._objectEach(opSet, function (change, key) {
          target[key] = change._estimate(target[key], self, key);
          if (target[key] === ML.Op._UNSET) {
            delete target[key];
          }
        });
      },

      /**
       * Replaces the cached value for key with the current value.
       * Returns true if the new value is different than the old value.
       */
      _resetCacheForKey: function (key) {
        var value = this.attributes[key];
        if (_.isObject(value) && !(value instanceof ML.Object) && !(value instanceof ML.File)) {

          value = value.toJSON ? value.toJSON() : value;
          var json = JSON.stringify(value);
          if (this._hashedJSON[key] !== json) {
            var wasSet = !!this._hashedJSON[key];
            this._hashedJSON[key] = json;
            return wasSet;
          }
        }
        return false;
      },

      /**
       * Populates attributes[key] by starting with the last known data from the
       * server, and applying all of the local changes that have been made to that
       * key since then.
       */
      _rebuildEstimatedDataForKey: function (key) {
        var self = this;
        delete this.attributes[key];
        if (this._serverData[key]) {
          this.attributes[key] = this._serverData[key];
        }
        ML._arrayEach(this._opSetQueue, function (opSet) {
          var op = opSet[key];
          if (op) {
            self.attributes[key] = op._estimate(self.attributes[key], self, key);
            if (self.attributes[key] === ML.Op._UNSET) {
              delete self.attributes[key];
            } else {
              self._resetCacheForKey(key);
            }
          }
        });
      },

      /**
       * Populates attributes by starting with the last known data from the
       * server, and applying all of the local changes that have been made since
       * then.
       */
      _rebuildAllEstimatedData: function () {
        var self = this;

        var previousAttributes = _.clone(this.attributes);

        this.attributes = _.clone(this._serverData);
        ML._arrayEach(this._opSetQueue, function (opSet) {
          self._applyOpSet(opSet, self.attributes);
          ML._objectEach(opSet, function (op, key) {
            self._resetCacheForKey(key);
          });
        });

        // Trigger change events for anything that changed because of the fetch.
        ML._objectEach(previousAttributes, function (oldValue, key) {
          if (self.attributes[key] !== oldValue) {
            self.trigger('change:' + key, self, self.attributes[key], {});
          }
        });
        ML._objectEach(this.attributes, function (newValue, key) {
          if (!_.has(previousAttributes, key)) {
            self.trigger('change:' + key, self, newValue, {});
          }
        });
      },

      /**
       * Sets a hash of model attributes on the object, firing
       * <code>"change"</code> unless you choose to silence it.
       *
       * <p>You can call it with an object containing keys and values, or with one
       * key and value.  For example:<pre>
       *   gameTurn.set({
     *     player: player1,
     *     diceRoll: 2
     *   }, {
     *     error: function(gameTurnAgain, error) {
     *       // The set failed validation.
     *     }
     *   });
       *
       *   game.set("currentPlayer", player2, {
     *     error: function(gameTurnAgain, error) {
     *       // The set failed validation.
     *     }
     *   });
       *
       *   game.set("finished", true);</pre></p>
       *
       * @param {String} key The key to set.
       * @param {} value The value to give it.
       * @param {Object} options A set of Backbone-like options for the set.
       *     The only supported options are <code>silent</code>,
       *     <code>error</code>, and <code>promise</code>.
       * @return {Boolean} true if the set succeeded.
       * @see ML.Object#validate
       * @see ML.Error
       */
      set: function (key, value, options) {
        var attrs, attr;
        if (_.isObject(key) || ML._isNullOrUndefined(key)) {
          attrs = key;
          ML._objectEach(attrs, function (v, k) {
            attrs[k] = ML._decode(k, v);
          });
          options = value;
        } else {
          attrs = {};
          attrs[key] = ML._decode(key, value);
        }

        // Extract attributes and options.
        options = options || {};
        if (!attrs) {
          return this;
        }
        if (attrs instanceof ML.Object) {
          attrs = attrs.attributes;
        }

        // If the unset option is used, every attribute should be a Unset.
        if (options.unset) {
          ML._objectEach(attrs, function (unused_value, key) {
            attrs[key] = new ML.Op.Unset();
          });
        }

        // Apply all the attributes to get the estimated values.
        var dataToValidate = _.clone(attrs);
        var self = this;
        ML._objectEach(dataToValidate, function (value, key) {
          if (value instanceof ML.Op) {
            dataToValidate[key] = value._estimate(self.attributes[key],
              self, key);
            if (dataToValidate[key] === ML.Op._UNSET) {
              delete dataToValidate[key];
            }
          }
        });

        // Run validation.
        if (!this._validate(attrs, options)) {
          return false;
        }

        this._mergeMagicFields(attrs);

        options.changes = {};
        var escaped = this._escapedAttributes;
        var prev = this._previousAttributes || {};

        // Update attributes.
        ML._arrayEach(_.keys(attrs), function (attr) {
          var val = attrs[attr];

          // If this is a relation object we need to set the parent correctly,
          // since the location where it was parsed does not have access to
          // this object.
          if (val instanceof ML.Relation) {
            val.parent = self;
          }

          if (!(val instanceof ML.Op)) {
            val = new ML.Op.Set(val);
          }

          // See if this change will actually have any effect.
          var isRealChange = true;
          if (val instanceof ML.Op.Set &&
            _.isEqual(self.attributes[attr], val.value)) {
            isRealChange = false;
          }

          if (isRealChange) {
            delete escaped[attr];
            if (options.silent) {
              self._silent[attr] = true;
            } else {
              options.changes[attr] = true;
            }
          }

          var currentChanges = _.last(self._opSetQueue);
          currentChanges[attr] = val._mergeWithPrevious(currentChanges[attr]);
          self._rebuildEstimatedDataForKey(attr);

          if (isRealChange) {
            self.changed[attr] = self.attributes[attr];
            if (!options.silent) {
              self._pending[attr] = true;
            }
          } else {
            delete self.changed[attr];
            delete self._pending[attr];
          }
        });

        if (!options.silent) {
          this.change(options);
        }
        return this;
      },

      /**
       * Remove an attribute from the model, firing <code>"change"</code> unless
       * you choose to silence it. This is a noop if the attribute doesn't
       * exist.
       */
      unset: function (attr, options) {
        options = options || {};
        options.unset = true;
        return this.set(attr, null, options);
      },

      /**
       * Atomically increments the value of the given attribute the next time the
       * object is saved. If no amount is specified, 1 is used by default.
       *
       * @param attr {String} The key.
       * @param amount {Number} The amount to increment by.
       */
      increment: function (attr, amount) {
        if (_.isUndefined(amount) || _.isNull(amount)) {
          amount = 1;
        }
        return this.set(attr, new ML.Op.Increment(amount));
      },

      /**
       * Atomically add an object to the end of the array associated with a given
       * key.
       * @param attr {String} The key.
       * @param item {} The item to add.
       */
      add: function (attr, item) {
        return this.set(attr, new ML.Op.Add([item]));
      },

      /**
       * Atomically add an object to the array associated with a given key, only
       * if it is not already present in the array. The position of the insert is
       * not guaranteed.
       *
       * @param attr {String} The key.
       * @param item {} The object to add.
       */
      addUnique: function (attr, item) {
        return this.set(attr, new ML.Op.AddUnique([item]));
      },

      /**
       * Atomically remove all instances of an object from the array associated
       * with a given key.
       *
       * @param attr {String} The key.
       * @param item {} The object to remove.
       */
      remove: function (attr, item) {
        return this.set(attr, new ML.Op.Remove([item]));
      },

      /**
       * Returns an instance of a subclass of ML.Op describing what kind of
       * modification has been performed on this field since the last time it was
       * saved. For example, after calling object.increment("x"), calling
       * object.op("x") would return an instance of ML.Op.Increment.
       *
       * @param attr {String} The key.
       * @returns {ML.Op} The operation, or undefined if none.
       */
      op: function (attr) {
        return _.last(this._opSetQueue)[attr];
      },

      /**
       * Clear all attributes on the model, firing <code>"change"</code> unless
       * you choose to silence it.
       */
      clear: function (options) {
        options = options || {};
        options.unset = true;
        var keysToClear = _.extend(this.attributes, this._operations);
        return this.set(keysToClear, options);
      },

      /**
       * Returns a JSON-encoded set of operations to be sent with the next save
       * request.
       */
      _getSaveJSON: function () {
        var json = _.clone(_.first(this._opSetQueue));
        ML._objectEach(json, function (op, key) {
          json[key] = op.toJSON();
        });
        return json;
      },

      /**
       * Returns true if this object can be serialized for saving.
       */
      _canBeSerialized: function () {
        return ML.Object._canBeSerializedAsValue(this.attributes);
      },

      /**
       * Fetch the model from the server. If the server's representation of the
       * model differs from its current attributes, they will be overriden,
       * triggering a <code>"change"</code> event.
       * @param {Object} fetchOptions Optional options to set 'keys' and
       *      'include' option.
       * @param {Object} options Optional Backbone-like options object to be
       *     passed in to set.
       * @return {ML.Promise} A promise that is fulfilled when the fetch
       *     completes.
       */
      fetch: function () {
        var options = null;
        var fetchOptions = {};
        if (arguments.length === 1) {
          options = arguments[0];
        } else if (arguments.length === 2) {
          fetchOptions = arguments[0];
          options = arguments[1];
        }

        var self = this;
        var request = ML._request("classes", this.className, this.id, 'GET',
          fetchOptions);
        return request.then(function (response, status, xhr) {
          self._finishFetch(self.parse(response, status, xhr), true);
          return self;
        })._thenRunCallbacks(options, this);
      },

      /**
       * Set a hash of model attributes, and save the model to the server.
       * updatedAt will be updated when the request returns.
       * You can either call it as:<pre>
       *   object.save();</pre>
       * or<pre>
       *   object.save(null, options);</pre>
       * or<pre>
       *   object.save(attrs, options);</pre>
       * or<pre>
       *   object.save(key, value, options);</pre>
       *
       * For example, <pre>
       *   gameTurn.save({
     *     player: "Jake Cutter",
     *     diceRoll: 2
     *   }, {
     *     success: function(gameTurnAgain) {
     *       // The save was successful.
     *     },
     *     error: function(gameTurnAgain, error) {
     *       // The save failed.  Error is an instance of ML.Error.
     *     }
     *   });</pre>
       * or with promises:<pre>
       *   gameTurn.save({
     *     player: "Jake Cutter",
     *     diceRoll: 2
     *   }).then(function(gameTurnAgain) {
     *     // The save was successful.
     *   }, function(error) {
     *     // The save failed.  Error is an instance of ML.Error.
     *   });</pre>
       *
       * @return {ML.Promise} A promise that is fulfilled when the save
       *     completes.
       * @see ML.Error
       */
      save: function (arg1, arg2, arg3) {
        var i, attrs, current, options, saved;
        if (_.isObject(arg1) || ML._isNullOrUndefined(arg1)) {
          attrs = arg1;
          options = arg2;
        } else {
          attrs = {};
          attrs[arg1] = arg2;
          options = arg3;
        }

        // Make save({ success: function() {} }) work.
        if (!options && attrs) {
          var extra_keys = _.reject(attrs, function (value, key) {
            return _.include(["success", "error", "wait"], key);
          });
          if (extra_keys.length === 0) {
            var all_functions = true;
            if (_.has(attrs, "success") && !_.isFunction(attrs.success)) {
              all_functions = false;
            }
            if (_.has(attrs, "error") && !_.isFunction(attrs.error)) {
              all_functions = false;
            }
            if (all_functions) {
              // This attrs object looks like it's really an options object,
              // and there's no other options object, so let's just use it.
              return this.save(null, attrs);
            }
          }
        }

        options = _.clone(options) || {};
        if (options.wait) {
          current = _.clone(this.attributes);
        }

        var setOptions = _.clone(options) || {};
        if (setOptions.wait) {
          setOptions.silent = true;
        }
        var setError;
        setOptions.error = function (model, error) {
          setError = error;
        };
        if (attrs && !this.set(attrs, setOptions)) {
          return ML.Promise.error(setError)._thenRunCallbacks(options, this);
        }

        var model = this;

        // If there is any unsaved child, save it first.
        model._refreshCache();


        var unsavedChildren = [];
        var unsavedFiles = [];
        ML.Object._findUnsavedChildren(model.attributes,
          unsavedChildren,
          unsavedFiles);
        if (unsavedChildren.length + unsavedFiles.length > 0) {
          return ML.Object._deepSaveAsync(this.attributes, model).then(function () {
            return model.save(null, options);
          }, function (error) {
            return ML.Promise.error(error)._thenRunCallbacks(options, model);
          });
        }

        this._startSave();
        this._saving = (this._saving || 0) + 1;

        this._allPreviousSaves = this._allPreviousSaves || ML.Promise.as();
        this._allPreviousSaves = this._allPreviousSaves._continueWith(function () {
          var method = model.id ? 'PUT' : 'POST';

          var json = model._getSaveJSON();

          if (model._fetchWhenSave) {
            //Sepcial-case fetchWhenSave when updating object.
            json._fetchWhenSave = true;
          }

          var route = "classes";
          var className = model.className;
          if (model.className === "_User" && !model.id) {
            // Special-case user sign-up.
            route = "users";
            className = null;
          }
          //hook makeRequest in options.
          var makeRequest = options._makeRequest || ML._request;
          var request = makeRequest(route, className, model.id, method, json);

          request = request.then(function (resp, status, xhr) {
            var serverAttrs = model.parse(resp, status, xhr);
            if (options.wait) {
              serverAttrs = _.extend(attrs || {}, serverAttrs);
            }
            model._finishSave(serverAttrs);
            if (options.wait) {
              model.set(current, setOptions);
            }
            return model;

          }, function (error) {
            model._cancelSave();
            return ML.Promise.error(error);

          })._thenRunCallbacks(options, model);

          return request;
        });
        return this._allPreviousSaves;
      },

      /**
       * Destroy this model on the server if it was already persisted.
       * Optimistically removes the model from its collection, if it has one.
       * If `wait: true` is passed, waits for the server to respond
       * before removal.
       *
       * @return {ML.Promise} A promise that is fulfilled when the destroy
       *     completes.
       */
      destroy: function (options) {
        options = options || {};
        var model = this;

        var triggerDestroy = function () {
          model.trigger('destroy', model, model.collection, options);
        };

        if (!this.id) {
          return triggerDestroy();
        }

        if (!options.wait) {
          triggerDestroy();
        }

        var request =
          ML._request("classes", this.className, this.id, 'DELETE');
        return request.then(function () {
          if (options.wait) {
            triggerDestroy();
          }
          return model;
        })._thenRunCallbacks(options, this);
      },

      /**
       * Converts a response into the hash of attributes to be set on the model.
       * @ignore
       */
      parse: function (resp, status, xhr) {
        var output = _.clone(resp);
        _(["createdAt", "updatedAt"]).each(function (key) {
          if (output[key]) {
            output[key] = ML._parseDate(output[key]);
          }
        });
        if (!output.updatedAt) {
          output.updatedAt = output.createdAt;
        }
        if (status) {
          this._existed = (status !== 201);
        }
        return output;
      },

      /**
       * Creates a new model with identical attributes to this one.
       * @return {ML.Object}
       */
      clone: function () {
        return new this.constructor(this.attributes);
      },

      /**
       * Returns true if this object has never been saved to ML.
       * @return {Boolean}
       */
      isNew: function () {
        return !this.id;
      },

      /**
       * Call this method to manually fire a `"change"` event for this model and
       * a `"change:attribute"` event for each changed attribute.
       * Calling this will cause all objects observing the model to update.
       */
      change: function (options) {
        options = options || {};
        var changing = this._changing;
        this._changing = true;

        // Silent changes become pending changes.
        var self = this;
        ML._objectEach(this._silent, function (attr) {
          self._pending[attr] = true;
        });

        // Silent changes are triggered.
        var changes = _.extend({}, options.changes, this._silent);
        this._silent = {};
        ML._objectEach(changes, function (unused_value, attr) {
          self.trigger('change:' + attr, self, self.get(attr), options);
        });
        if (changing) {
          return this;
        }

        // This is to get around lint not letting us make a function in a loop.
        var deleteChanged = function (value, attr) {
          if (!self._pending[attr] && !self._silent[attr]) {
            delete self.changed[attr];
          }
        };

        // Continue firing `"change"` events while there are pending changes.
        while (!_.isEmpty(this._pending)) {
          this._pending = {};
          this.trigger('change', this, options);
          // Pending and silent changes still remain.
          ML._objectEach(this.changed, deleteChanged);
          self._previousAttributes = _.clone(this.attributes);
        }

        this._changing = false;
        return this;
      },

      /**
       * Returns true if this object was created by the ML server when the
       * object might have already been there (e.g. in the case of a Facebook
       * login)
       */
      existed: function () {
        return this._existed;
      },

      /**
       * Determine if the model has changed since the last <code>"change"</code>
       * event.  If you specify an attribute name, determine if that attribute
       * has changed.
       * @param {String} attr Optional attribute name
       * @return {Boolean}
       */
      hasChanged: function (attr) {
        if (!arguments.length) {
          return !_.isEmpty(this.changed);
        }
        return this.changed && _.has(this.changed, attr);
      },

      /**
       * Returns an object containing all the attributes that have changed, or
       * false if there are no changed attributes. Useful for determining what
       * parts of a view need to be updated and/or what attributes need to be
       * persisted to the server. Unset attributes will be set to undefined.
       * You can also pass an attributes object to diff against the model,
       * determining if there *would be* a change.
       */
      changedAttributes: function (diff) {
        if (!diff) {
          return this.hasChanged() ? _.clone(this.changed) : false;
        }
        var changed = {};
        var old = this._previousAttributes;
        ML._objectEach(diff, function (diffVal, attr) {
          if (!_.isEqual(old[attr], diffVal)) {
            changed[attr] = diffVal;
          }
        });
        return changed;
      },

      /**
       * Gets the previous value of an attribute, recorded at the time the last
       * <code>"change"</code> event was fired.
       * @param {String} attr Name of the attribute to get.
       */
      previous: function (attr) {
        if (!arguments.length || !this._previousAttributes) {
          return null;
        }
        return this._previousAttributes[attr];
      },

      /**
       * Gets all of the attributes of the model at the time of the previous
       * <code>"change"</code> event.
       * @return {Object}
       */
      previousAttributes: function () {
        return _.clone(this._previousAttributes);
      },

      /**
       * Checks if the model is currently in a valid state. It's only possible to
       * get into an *invalid* state if you're using silent changes.
       * @return {Boolean}
       */
      isValid: function () {
        return !this.validate(this.attributes);
      },

      /**
       * Run validation against a set of incoming attributes, returning `true`
       * if all is well. If a specific `error` callback has been passed,
       * call that instead of firing the general `"error"` event.
       */
      _validate: function (attrs, options) {
        if (options.silent || !this.validate) {
          return true;
        }
        attrs = _.extend({}, this.attributes, attrs);
        var error = this.validate(attrs, options);
        if (!error) {
          return true;
        }
        if (options && options.error) {
          options.error(this, error, options);
        } else {
          this.trigger('error', this, error, options);
        }
        return false;
      },

    });

  /**
   * Creates an instance of a subclass of ML.Object for the give classname
   * and id.
   * @param  {String} className The name of the ML class backing this model.
   * @param {String} id The object id of this model.
   * @return {ML.Object} A new subclass instance of ML.Object.
   */
  ML.Object.createWithoutData = function (className, id, hasData) {
    var result = new ML.Object(className);
    result.id = id;
    result._hasData = hasData;
    return result;
  };
  /**
   * Delete objects in batch.The objects className must be the same.
   * @param {Array} The ParseObject array to be deleted.
   * @param {Object} options Standard options object with success and error
   *     callbacks.
   * @return {ML.Promise} A promise that is fulfilled when the save
   *     completes.
   */
  ML.Object.destroyAll = function (objects, options) {
    if (objects == null || objects.length == 0) {
      return ML.Promise.as()._thenRunCallbacks(options);
    }
    var dataObject = {
      requests: []
    };

    objects.forEach(function (obj) {
      dataObject.requests.push({
        method: 'delete',
        path: 'classes/' + objects[0].className + '/' + obj.id
      });
    });
    var request =
      ML._request('batch', null, null, 'POST', dataObject);
    return request._thenRunCallbacks(options);
  };

  /**
   * Returns the appropriate subclass for making new instances of the given
   * className string.
   */
  ML.Object._getSubclass = function (className) {
    if (!_.isString(className)) {
      throw "ML.Object._getSubclass requires a string argument.";
    }
    var ObjectClass = ML.Object._classMap[className];
    if (!ObjectClass) {
      ObjectClass = ML.Object.extend(className);
      ML.Object._classMap[className] = ObjectClass;
    }
    return ObjectClass;
  };

  /**
   * Creates an instance of a subclass of ML.Object for the given classname.
   */
  ML.Object._create = function (className, attributes, options) {
    var ObjectClass = ML.Object._getSubclass(className);
    return new ObjectClass(attributes, options);
  };

  // Set up a map of className to class so that we can create new instances of
  // ML Objects from JSON automatically.
  ML.Object._classMap = {};

  ML.Object._extend = ML._extend;

  /**
   * Creates a new model with defined attributes,
   * It's the same with
   * <pre>
   *   new ML.Object(attributes, options);
   *  </pre>
   * @param {Object} attributes The initial set of data to store in the object.
   * @param {Object} options A set of Backbone-like options for creating the
   *     object.  The only option currently supported is "collection".
   * @return {ML.Object}
   * @since v0.4.4
   * @see ML.Object
   * @see ML.Object.extend
   */
  ML.Object.new = function (attributes, options) {
    return new ML.Object(attributes, options);
  };

  /**
   * Creates a new subclass of ML.Object for the given ML class name.
   *
   * <p>Every extension of a ML class will inherit from the most recent
   * previous extension of that class. When a ML.Object is automatically
   * created by parsing JSON, it will use the most recent extension of that
   * class.</p>
   *
   * <p>You should call either:<pre>
   *     var MyClass = ML.Object.extend("MyClass", {
   *         <i>Instance properties</i>
   *     }, {
   *         <i>Class properties</i>
   *     });</pre>
   * or, for Backbone compatibility:<pre>
   *     var MyClass = ML.Object.extend({
   *         className: "MyClass",
   *         <i>Other instance properties</i>
   *     }, {
   *         <i>Class properties</i>
   *     });</pre></p>
   *
   * @param {String} className The name of the ML class backing this model.
   * @param {Object} protoProps Instance properties to add to instances of the
   *     class returned from this method.
   * @param {Object} classProps Class properties to add the class returned from
   *     this method.
   * @return {Class} A new subclass of ML.Object.
   */
  ML.Object.extend = function (className, protoProps, classProps) {
    // Handle the case with only two args.
    if (!_.isString(className)) {
      if (className && _.has(className, "className")) {
        return ML.Object.extend(className.className, className, protoProps);
      } else {
        throw new Error(
          "ML.Object.extend's first argument should be the className.");
      }
    }

    // If someone tries to subclass "User", coerce it to the right type.
    if (className === "User") {
      className = "_User";
    }

    var NewClassObject = null;
    if (_.has(ML.Object._classMap, className)) {
      var OldClassObject = ML.Object._classMap[className];
      // This new subclass has been told to extend both from "this" and from
      // OldClassObject. This is multiple inheritance, which isn't supported.
      // For now, let's just pick one.
      NewClassObject = OldClassObject._extend(protoProps, classProps);
    } else {
      protoProps = protoProps || {};
      protoProps.className = className;
      NewClassObject = this._extend(protoProps, classProps);
    }
    // Extending a subclass should reuse the classname automatically.
    NewClassObject.extend = function (arg0) {
      if (_.isString(arg0) || (arg0 && _.has(arg0, "className"))) {
        return ML.Object.extend.apply(NewClassObject, arguments);
      }
      var newArguments = [className].concat(ML._.toArray(arguments));
      return ML.Object.extend.apply(NewClassObject, newArguments);
    };
    NewClassObject.new = function (attributes, options) {
      return new NewClassObject(attributes, options);
    };
    ML.Object._classMap[className] = NewClassObject;
    return NewClassObject;
  };

  ML.Object._findUnsavedChildren = function (object, children, files) {
    ML._traverse(object, function (object) {
      if (object instanceof ML.Object) {
        object._refreshCache();
        if (object.dirty()) {
          children.push(object);
        }
        return;
      }

      if (object instanceof ML.File) {
        if (!object.url() && !object.id) {
          files.push(object);
        }
        return;
      }
    });
  };

  ML.Object._canBeSerializedAsValue = function (object) {
    var canBeSerializedAsValue = true;

    if (object instanceof ML.Object) {
      canBeSerializedAsValue = !!object.id;

    } else if (_.isArray(object)) {
      ML._arrayEach(object, function (child) {
        if (!ML.Object._canBeSerializedAsValue(child)) {
          canBeSerializedAsValue = false;
        }
      });

    } else if (_.isObject(object)) {
      ML._objectEach(object, function (child) {
        if (!ML.Object._canBeSerializedAsValue(child)) {
          canBeSerializedAsValue = false;
        }
      });
    }

    return canBeSerializedAsValue;
  };

  ML.Object._deepSaveAsync = function (object, model) {
    var unsavedChildren = [];
    var unsavedFiles = [];
    ML.Object._findUnsavedChildren(object, unsavedChildren, unsavedFiles);
    if (model) {
      unsavedChildren = _.filter(unsavedChildren, function (object) {
        return object != model;
      });
    }

    var promise = ML.Promise.as();
    _.each(unsavedFiles, function (file) {
      promise = promise.then(function () {
        return file.save();
      });
    });

    var objects = _.uniq(unsavedChildren);
    var remaining = _.uniq(objects);

    return promise.then(function () {
      return ML.Promise._continueWhile(function () {
        return remaining.length > 0;
      }, function () {

        // Gather up all the objects that can be saved in this batch.
        var batch = [];
        var newRemaining = [];
        ML._arrayEach(remaining, function (object) {
          // Limit batches to 20 objects.
          if (batch.length > 20) {
            newRemaining.push(object);
            return;
          }

          if (object._canBeSerialized()) {
            batch.push(object);
          } else {
            newRemaining.push(object);
          }
        });
        remaining = newRemaining;

        // If we can't save any objects, there must be a circular reference.
        if (batch.length === 0) {
          return ML.Promise.error(
            new ML.Error(ML.Error.OTHER_CAUSE,
              "Tried to save a batch with a cycle."));
        }

        // Reserve a spot in every object's save queue.
        var readyToStart = ML.Promise.when(_.map(batch, function (object) {
          return object._allPreviousSaves || ML.Promise.as();
        }));
        var batchFinished = new ML.Promise();
        ML._arrayEach(batch, function (object) {
          object._allPreviousSaves = batchFinished;
        });
        // Save a single batch, whether previous saves succeeded or failed.
        return readyToStart._continueWith(function () {
          return ML._request("batch", null, null, "POST", {
            requests: _.map(batch, function (object) {
              var json = object._getSaveJSON();
              var method = "POST";

              var path = "/2.0/classes/" + object.className;
              if (object.id) {
                path = path + "/" + object.id;
                method = "PUT";
              }

              object._startSave();

              return {
                method: method,
                path: path,
                body: json
              };
            })

          }).then(function (response, status, xhr) {
            var error;
            ML._arrayEach(batch, function (object, i) {
              object._finishSave(
                object.parse(response[i], status, xhr));
            });
            if (error) {
              return ML.Promise.error(
                new ML.Error(error.code, error.error));
            }

          }).then(function (results) {
            batchFinished.resolve(results);
            return results;
          }, function (error) {
            batchFinished.reject(error);
            return ML.Promise.error(error);
          });
        });
      });
    }).then(function () {
      return object;
    });
  };

};