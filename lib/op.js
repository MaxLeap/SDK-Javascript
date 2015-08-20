'use strict';
var _ = require('underscore');

module.exports = function(LC) {

  /**
   * @class
   * A LC.Op is an atomic operation that can be applied to a field in a
   * LC.Object. For example, calling <code>object.set("foo", "bar")</code>
   * is an example of a LC.Op.Set. Calling <code>object.unset("foo")</code>
   * is a LC.Op.Unset. These operations are stored in a LC.Object and
   * sent to the server as part of <code>object.save()</code> operations.
   * Instances of LC.Op should be immutable.
   *
   * You should not create subclasses of LC.Op or instantiate LC.Op
   * directly.
   */
  LC.Op = function() {
    this._initialize.apply(this, arguments);
  };

  LC.Op.prototype = {
    _initialize: function() {}
  };

  _.extend(LC.Op, {
    /**
     * To create a new Op, call LC.Op._extend();
     */
    _extend: LC._extend,

    // A map of __op string to decoder function.
    _opDecoderMap: {},

    /**
     * Registers a function to convert a json object with an __op field into an
     * instance of a subclass of LC.Op.
     */
    _registerDecoder: function(opName, decoder) {
      LC.Op._opDecoderMap[opName] = decoder;
    },

    /**
     * Converts a json object into an instance of a subclass of LC.Op.
     */
    _decode: function(json) {
      var decoder = LC.Op._opDecoderMap[json.__op];
      if (decoder) {
        return decoder(json);
      } else {
        return undefined;
      }
    }
  });

  /*
   * Add a handler for Batch ops.
   */
  LC.Op._registerDecoder("Batch", function(json) {
    var op = null;
    LC._arrayEach(json.ops, function(nextOp) {
      nextOp = LC.Op._decode(nextOp);
      op = nextOp._mergeWithPrevious(op);
    });
    return op;
  });

  /**
   * @class
   * A Set operation indicates that either the field was changed using
   * LC.Object.set, or it is a mutable container that was detected as being
   * changed.
   */
  LC.Op.Set = LC.Op._extend(/** @lends LC.Op.Set.prototype */ {
    _initialize: function(value) {
      this._value = value;
    },

    /**
     * Returns the new value of this field after the set.
     */
    value: function() {
      return this._value;
    },

    /**
     * Returns a JSON version of the operation suitable for sending to LC.
     * @return {Object}
     */
    toJSON: function() {
      return LC._encode(this.value());
    },

    _mergeWithPrevious: function(previous) {
      return this;
    },

    _estimate: function(oldValue) {
      return this.value();
    }
  });

  /**
   * A sentinel value that is returned by LC.Op.Unset._estimate to
   * indicate the field should be deleted. Basically, if you find _UNSET as a
   * value in your object, you should remove that key.
   */
  LC.Op._UNSET = {};

  /**
   * @class
   * An Unset operation indicates that this field has been deleted from the
   * object.
   */
  LC.Op.Unset = LC.Op._extend(/** @lends LC.Op.Unset.prototype */ {
    /**
     * Returns a JSON version of the operation suitable for sending to LC.
     * @return {Object}
     */
    toJSON: function() {
      return { __op: "Delete" };
    },

    _mergeWithPrevious: function(previous) {
      return this;
    },

    _estimate: function(oldValue) {
      return LC.Op._UNSET;
    }
  });

  LC.Op._registerDecoder("Delete", function(json) {
    return new LC.Op.Unset();
  });

  /**
   * @class
   * An Increment is an atomic operation where the numeric value for the field
   * will be increased by a given amount.
   */
  LC.Op.Increment = LC.Op._extend(
      /** @lends LC.Op.Increment.prototype */ {

    _initialize: function(amount) {
      this._amount = amount;
    },

    /**
     * Returns the amount to increment by.
     * @return {Number} the amount to increment by.
     */
    amount: function() {
      return this._amount;
    },

    /**
     * Returns a JSON version of the operation suitable for sending to LC.
     * @return {Object}
     */
    toJSON: function() {
      return { __op: "Increment", amount: this._amount };
    },

    _mergeWithPrevious: function(previous) {
      if (!previous) {
        return this;
      } else if (previous instanceof LC.Op.Unset) {
        return new LC.Op.Set(this.amount());
      } else if (previous instanceof LC.Op.Set) {
        return new LC.Op.Set(previous.value() + this.amount());
      } else if (previous instanceof LC.Op.Increment) {
        return new LC.Op.Increment(this.amount() + previous.amount());
      } else {
        throw "Op is invalid after previous op.";
      }
    },

    _estimate: function(oldValue) {
      if (!oldValue) {
        return this.amount();
      }
      return oldValue + this.amount();
    }
  });

  LC.Op._registerDecoder("Increment", function(json) {
    return new LC.Op.Increment(json.amount);
  });

  /**
   * @class
   * Add is an atomic operation where the given objects will be appended to the
   * array that is stored in this field.
   */
  LC.Op.Add = LC.Op._extend(/** @lends LC.Op.Add.prototype */ {
    _initialize: function(objects) {
      this._objects = objects;
    },

    /**
     * Returns the objects to be added to the array.
     * @return {Array} The objects to be added to the array.
     */
    objects: function() {
      return this._objects;
    },

    /**
     * Returns a JSON version of the operation suitable for sending to LC.
     * @return {Object}
     */
    toJSON: function() {
      return { __op: "Add", objects: LC._encode(this.objects()) };
    },

    _mergeWithPrevious: function(previous) {
      if (!previous) {
        return this;
      } else if (previous instanceof LC.Op.Unset) {
        return new LC.Op.Set(this.objects());
      } else if (previous instanceof LC.Op.Set) {
        return new LC.Op.Set(this._estimate(previous.value()));
      } else if (previous instanceof LC.Op.Add) {
        return new LC.Op.Add(previous.objects().concat(this.objects()));
      } else {
        throw "Op is invalid after previous op.";
      }
    },

    _estimate: function(oldValue) {
      if (!oldValue) {
        return _.clone(this.objects());
      } else {
        return oldValue.concat(this.objects());
      }
    }
  });

  LC.Op._registerDecoder("Add", function(json) {
    return new LC.Op.Add(LC._decode(undefined, json.objects));
  });

  /**
   * @class
   * AddUnique is an atomic operation where the given items will be appended to
   * the array that is stored in this field only if they were not already
   * present in the array.
   */
  LC.Op.AddUnique = LC.Op._extend(
      /** @lends LC.Op.AddUnique.prototype */ {

    _initialize: function(objects) {
      this._objects = _.uniq(objects);
    },

    /**
     * Returns the objects to be added to the array.
     * @return {Array} The objects to be added to the array.
     */
    objects: function() {
      return this._objects;
    },

    /**
     * Returns a JSON version of the operation suitable for sending to LC.
     * @return {Object}
     */
    toJSON: function() {
      return { __op: "AddUnique", objects: LC._encode(this.objects()) };
    },

    _mergeWithPrevious: function(previous) {
      if (!previous) {
        return this;
      } else if (previous instanceof LC.Op.Unset) {
        return new LC.Op.Set(this.objects());
      } else if (previous instanceof LC.Op.Set) {
        return new LC.Op.Set(this._estimate(previous.value()));
      } else if (previous instanceof LC.Op.AddUnique) {
        return new LC.Op.AddUnique(this._estimate(previous.objects()));
      } else {
        throw "Op is invalid after previous op.";
      }
    },

    _estimate: function(oldValue) {
      if (!oldValue) {
        return _.clone(this.objects());
      } else {
        // We can't just take the _.uniq(_.union(...)) of oldValue and
        // this.objects, because the uniqueness may not apply to oldValue
        // (especially if the oldValue was set via .set())
        var newValue = _.clone(oldValue);
        LC._arrayEach(this.objects(), function(obj) {
          if (obj instanceof LC.Object && obj.id) {
            var matchingObj = _.find(newValue, function(anObj) {
              return (anObj instanceof LC.Object) && (anObj.id === obj.id);
            });
            if (!matchingObj) {
              newValue.push(obj);
            } else {
              var index = _.indexOf(newValue, matchingObj);
              newValue[index] = obj;
            }
          } else if (!_.contains(newValue, obj)) {
            newValue.push(obj);
          }
        });
        return newValue;
      }
    }
  });

  LC.Op._registerDecoder("AddUnique", function(json) {
    return new LC.Op.AddUnique(LC._decode(undefined, json.objects));
  });

  /**
   * @class
   * Remove is an atomic operation where the given objects will be removed from
   * the array that is stored in this field.
   */
  LC.Op.Remove = LC.Op._extend(/** @lends LC.Op.Remove.prototype */ {
    _initialize: function(objects) {
      this._objects = _.uniq(objects);
    },

    /**
     * Returns the objects to be removed from the array.
     * @return {Array} The objects to be removed from the array.
     */
    objects: function() {
      return this._objects;
    },

    /**
     * Returns a JSON version of the operation suitable for sending to LC.
     * @return {Object}
     */
    toJSON: function() {
      return { __op: "Remove", objects: LC._encode(this.objects()) };
    },

    _mergeWithPrevious: function(previous) {
      if (!previous) {
        return this;
      } else if (previous instanceof LC.Op.Unset) {
        return previous;
      } else if (previous instanceof LC.Op.Set) {
        return new LC.Op.Set(this._estimate(previous.value()));
      } else if (previous instanceof LC.Op.Remove) {
        return new LC.Op.Remove(_.union(previous.objects(), this.objects()));
      } else {
        throw "Op is invalid after previous op.";
      }
    },

    _estimate: function(oldValue) {
      if (!oldValue) {
        return [];
      } else {
        var newValue = _.difference(oldValue, this.objects());
        // If there are saved LC Objects being removed, also remove them.
        LC._arrayEach(this.objects(), function(obj) {
          if (obj instanceof LC.Object && obj.id) {
            newValue = _.reject(newValue, function(other) {
              return (other instanceof LC.Object) && (other.id === obj.id);
            });
          }
        });
        return newValue;
      }
    }
  });

  LC.Op._registerDecoder("Remove", function(json) {
    return new LC.Op.Remove(LC._decode(undefined, json.objects));
  });

  /**
   * @class
   * A Relation operation indicates that the field is an instance of
   * LC.Relation, and objects are being added to, or removed from, that
   * relation.
   */
  LC.Op.Relation = LC.Op._extend(
      /** @lends LC.Op.Relation.prototype */ {

    _initialize: function(adds, removes) {
      this._targetClassName = null;

      var self = this;

      var pointerToId = function(object) {
        if (object instanceof LC.Object) {
          if (!object.id) {
            throw "You can't add an unsaved LC.Object to a relation.";
          }
          if (!self._targetClassName) {
            self._targetClassName = object.className;
          }
          if (self._targetClassName !== object.className) {
            throw "Tried to create a LC.Relation with 2 different types: " +
                  self._targetClassName + " and " + object.className + ".";
          }
          return object.id;
        }
        return object;
      };

      this.relationsToAdd = _.uniq(_.map(adds, pointerToId));
      this.relationsToRemove = _.uniq(_.map(removes, pointerToId));
    },

    /**
     * Returns an array of unfetched LC.Object that are being added to the
     * relation.
     * @return {Array}
     */
    added: function() {
      var self = this;
      return _.map(this.relationsToAdd, function(objectId) {
        var object = LC.Object._create(self._targetClassName);
        object.id = objectId;
        return object;
      });
    },

    /**
     * Returns an array of unfetched LC.Object that are being removed from
     * the relation.
     * @return {Array}
     */
    removed: function() {
      var self = this;
      return _.map(this.relationsToRemove, function(objectId) {
        var object = LC.Object._create(self._targetClassName);
        object.id = objectId;
        return object;
      });
    },

    /**
     * Returns a JSON version of the operation suitable for sending to LC.
     * @return {Object}
     */
    toJSON: function() {
      var adds = null;
      var removes = null;
      var self = this;
      var idToPointer = function(id) {
        return { __type: 'Pointer',
                 className: self._targetClassName,
                 objectId: id };
      };
      var pointers = null;
      if (this.relationsToAdd.length > 0) {
        pointers = _.map(this.relationsToAdd, idToPointer);
        adds = { "__op": "AddRelation", "objects": pointers };
      }

      if (this.relationsToRemove.length > 0) {
        pointers = _.map(this.relationsToRemove, idToPointer);
        removes = { "__op": "RemoveRelation", "objects": pointers };
      }

      if (adds && removes) {
        return { "__op": "Batch", "ops": [adds, removes]};
      }

      return adds || removes || {};
    },

    _mergeWithPrevious: function(previous) {
      if (!previous) {
        return this;
      } else if (previous instanceof LC.Op.Unset) {
        throw "You can't modify a relation after deleting it.";
      } else if (previous instanceof LC.Op.Relation) {
        if (previous._targetClassName &&
            previous._targetClassName !== this._targetClassName) {
          throw "Related object must be of class " + previous._targetClassName +
              ", but " + this._targetClassName + " was passed in.";
        }
        var newAdd = _.union(_.difference(previous.relationsToAdd,
                                          this.relationsToRemove),
                             this.relationsToAdd);
        var newRemove = _.union(_.difference(previous.relationsToRemove,
                                             this.relationsToAdd),
                                this.relationsToRemove);

        var newRelation = new LC.Op.Relation(newAdd, newRemove);
        newRelation._targetClassName = this._targetClassName;
        return newRelation;
      } else {
        throw "Op is invalid after previous op.";
      }
    },

    _estimate: function(oldValue, object, key) {
      if (!oldValue) {
        var relation = new LC.Relation(object, key);
        relation.targetClassName = this._targetClassName;
      } else if (oldValue instanceof LC.Relation) {
        if (this._targetClassName) {
          if (oldValue.targetClassName) {
            if (oldValue.targetClassName !== this._targetClassName) {
              throw "Related object must be a " + oldValue.targetClassName +
                  ", but a " + this._targetClassName + " was passed in.";
            }
          } else {
            oldValue.targetClassName = this._targetClassName;
          }
        }
        return oldValue;
      } else {
        throw "Op is invalid after previous op.";
      }
    }
  });

  LC.Op._registerDecoder("AddRelation", function(json) {
    return new LC.Op.Relation(LC._decode(undefined, json.objects), []);
  });
  LC.Op._registerDecoder("RemoveRelation", function(json) {
    return new LC.Op.Relation([], LC._decode(undefined, json.objects));
  });

};
