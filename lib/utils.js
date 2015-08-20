'use strict';

var _ = require('underscore');

/*global _: false, $: false, localStorage: false, process: true,
  XMLHttpRequest: false, XDomainRequest: false, exports: false,
  require: false */
module.exports = function(LC) {
  /**
   * Contains all LC API classes and functions.
   * @name LC
   * @namespace
   *
   * Contains all LC API classes and functions.
   */

  // If jQuery or Zepto has been included, grab a reference to it.
  if (typeof($) !== "undefined") {
    LC.$ = $;
  }

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var EmptyConstructor = function() {};


  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      /** @ignore */
      child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    LC._.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    EmptyConstructor.prototype = parent.prototype;
    child.prototype = new EmptyConstructor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
      LC._.extend(child.prototype, protoProps);
    }

    // Add static properties to the constructor function, if supplied.
    if (staticProps) {
      LC._.extend(child, staticProps);
    }

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is
    // needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set the server for LC to talk to.
  LC.serverURL = "https://api.leap.as";

  // Check whether we are running in Node.js.
  if (typeof(process) !== "undefined" &&
      process.versions &&
      process.versions.node) {
    LC._isNode = true;
  }

  /**
   * Call this method first to set up your authentication tokens for LC.
   * You can get your keys from the Data Browser on avoscloud.com.
   * @param {String} applicationId Your LC Application ID.
   * @param {String} applicationKey Your LC JavaScript Key.
   * @param {String} masterKey (optional) Your AVOSCloud Master Key. (Node.js only!).
   */
  LC.initialize = function(applicationId, applicationKey, masterKey) {
    if (masterKey) {
      throw new Error("LC.initialize() was passed a Master Key, which is only " +
        "allowed from within Node.js.");
    }
    LC._initialize(applicationId, applicationKey,masterKey);
  };

  /**
   * Call this method first to set up authentication tokens for LC.
   * This method is for LC's own private use.
   * @param {String} applicationId Your LC Application ID.
   * @param {String} applicationKey Your LC Application Key
   */
   LC._initialize = function(applicationId, applicationKey, masterKey) {
    if (LC.applicationId !== undefined &&
        applicationId !== LC.applicationId  &&
        applicationKey !== LC.applicationKey &&
        masterKey !== LC.masterKey) {
      console.warn('AVOSCloud SDK is already initialized, please don\'t reinitialize it.');
    }
    LC.applicationId = applicationId;
    LC.applicationKey = applicationKey;
    LC.masterKey = masterKey;
    LC._useMasterKey = false;
  };


  /**
   * Call this method to set production environment variable.
   * @param {Boolean} production True is production environment,and
   *  it's true by default.
   */
  LC.setProduction = function(production){
    if(!LC._isNullOrUndefined(production)) {
      //make sure it's a number
      production = production ? 1 : 0;
    }
    //default is 1
    LC.applicationProduction = LC._isNullOrUndefined(production) ? 1: production;
  };

  // If we're running in node.js, allow using the master key.
  if (LC._isNode) {
    LC.initialize = LC._initialize;

    LC.Cloud = LC.Cloud || {};
    /**
     * Switches the AVOSCloud SDK to using the Master key.  The Master key grants
     * priveleged access to the data in AVOSCloud and can be used to bypass ACLs and
     * other restrictions that are applied to the client SDKs.
     * <p><strong><em>Available in Cloud Code and Node.js only.</em></strong>
     * </p>
     */
    LC.Cloud.useMasterKey = function() {
      LC._useMasterKey = true;
    };
  }


   /**
    *Use china avoscloud API service:https://cn.avoscloud.com
    */
   LC.useAVCloudCN = function(){
    LC.serverURL = "https://leap.as";
   };

   /**
    *Use USA avoscloud API service:https://us.avoscloud.com
    */
   LC.useAVCloudUS = function(){
    LC.serverURL = "https://us-api.leap.as";
   };

  /**
   * Returns prefix for localStorage keys used by this instance of LC.
   * @param {String} path The relative suffix to append to it.
   *     null or undefined is treated as the empty string.
   * @return {String} The full key name.
   */
  LC._getAVPath = function(path) {
    if (!LC.applicationId) {
      throw "You need to call LC.initialize before using LC.";
    }
    if (!path) {
      path = "";
    }
    if (!LC._.isString(path)) {
      throw "Tried to get a localStorage path that wasn't a String.";
    }
    if (path[0] === "/") {
      path = path.substring(1);
    }
    return "LC/" + LC.applicationId + "/" + path;
  };

  /**
   * Returns the unique string for this app on this machine.
   * Gets reset when localStorage is cleared.
   */
  LC._installationId = null;
  LC._getInstallationId = function() {
    // See if it's cached in RAM.
    if (LC._installationId) {
      return LC._installationId;
    }

    // Try to get it from localStorage.
    var path = LC._getAVPath("installationId");
    LC._installationId = LC.localStorage.getItem(path);

    if (!LC._installationId || LC._installationId === "") {
      // It wasn't in localStorage, so create a new one.
      var hexOctet = function() {
        return Math.floor((1+Math.random())*0x10000).toString(16).substring(1);
      };
      LC._installationId = (
        hexOctet() + hexOctet() + "-" +
        hexOctet() + "-" +
        hexOctet() + "-" +
        hexOctet() + "-" +
        hexOctet() + hexOctet() + hexOctet());
      LC.localStorage.setItem(path, LC._installationId);
    }

    return LC._installationId;
  };

  LC._parseDate = function(iso8601) {
    var regexp = new RegExp(
      "^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})" + "T" +
      "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})" +
      "(.([0-9]+))?" + "Z$");
    var match = regexp.exec(iso8601);
    if (!match) {
      return null;
    }

    var year = match[1] || 0;
    var month = (match[2] || 1) - 1;
    var day = match[3] || 0;
    var hour = match[4] || 0;
    var minute = match[5] || 0;
    var second = match[6] || 0;
    var milli = match[8] || 0;

    return new Date(Date.UTC(year, month, day, hour, minute, second, milli));
  };

  LC._ajaxIE8 = function(method, url, data) {
    var promise = new LC.Promise();
    var xdr = new XDomainRequest();
    xdr.onload = function() {
      var response;
      try {
        response = JSON.parse(xdr.responseText);
      } catch (e) {
        promise.reject(e);
      }
      if (response) {
        promise.resolve(response);
      }
    };
    xdr.onerror = xdr.ontimeout = function() {
      // Let's fake a real error message.
      var fakeResponse = {
        responseText: JSON.stringify({
          code: LC.Error.X_DOMAIN_REQUEST,
          error: "IE's XDomainRequest does not supply error info."
        })
      };
      promise.reject(xdr);
    };
    xdr.onprogress = function() {};
    xdr.open(method, url);
    xdr.send(data);
    return promise;
  };

   LC._useXDomainRequest = function() {
       if (typeof(XDomainRequest) !== "undefined") {
           // We're in IE 8+.
           if ('withCredentials' in new XMLHttpRequest()) {
               // We're in IE 10+.
               return false;
           }
           return true;
       }
       return false;
   };

  LC._ajax = function(method, url, data, success, error) {
    var options = {
      success: success,
      error: error
    };

    if (LC._useXDomainRequest()) {
      return LC._ajaxIE8(method, url, data)._thenRunCallbacks(options);
    }

    var promise = new LC.Promise();
    var handled = false;

    var xhr = new LC.XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (handled) {
          return;
        }
        handled = true;

        if (xhr.status >= 200 && xhr.status < 300) {
          var response;
          try {
            response = JSON.parse(xhr.responseText);
          } catch (e) {
            promise.reject(e);
          }
          if (response) {
            promise.resolve(response, xhr.status, xhr);
          }
        } else {
          promise.reject(xhr);
        }
      }
    };
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "text/plain");  // avoid pre-flight.
    if (LC._isNode) {
      // Add a special user agent just for request from node.js.
      xhr.setRequestHeader("User-Agent",
                           "LC/" + LC.VERSION +
                           " (NodeJS " + process.versions.node + ")");
    }
    xhr.send(data);
    return promise._thenRunCallbacks(options);
  };

  // A self-propagating extend function.
  LC._extend = function(protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  /**
   * route is classes, users, login, etc.
   * objectId is null if there is no associated objectId.
   * method is the http method for the REST API.
   * dataObject is the payload as an object, or null if there is none.
   * @ignore
   */
  LC._request = function(route, className, objectId, method, dataObject) {
    if (!LC.applicationId) {
      throw "You must specify your applicationId using LC.initialize";
    }

    if (!LC.applicationKey && !LC.masterKey) {
      throw "You must specify a key using LC.initialize";
    }


    if (route !== "batch" &&
        route !== "classes" &&
        route !== "files" &&
        route !== "functions" &&
        route !== "login" &&
        route !== "push" &&
        route !== "search/select" &&
        route !== "requestPasswordReset" &&
        route !== "requestEmailVerify" &&
        route !== "requestPasswordResetBySmsCode" &&
        route !== "resetPasswordBySmsCode" &&
        route !== "requestMobilePhoneVerify" &&
        route !== "requestLoginSmsCode" &&
        route !== "verifyMobilePhone" &&
        route !== "requestSmsCode" &&
        route !== "verifySmsCode" &&
        route !== "users" &&
        route !== "usersByMobilePhone" &&
        route !== "cloudQuery" &&
        route !== "qiniu" &&
        route !== "statuses" &&
        route !== "bigquery" &&
        route !== 'search/select' &&
        route !== 'subscribe/statuses/count' &&
        route !== 'subscribe/statuses' &&
        !(/users\/[^\/]+\/updatePassword/.test(route)) &&
        !(/users\/[^\/]+\/friendship\/[^\/]+/.test(route))) {
      throw "Bad route: '" + route + "'.";
    }

    var url = LC.serverURL;
    if (url.charAt(url.length - 1) !== "/") {
      url += "/";
    }
    url += "1.1/" + route;
    if (className) {
      url += "/" + className;
    }
    if (objectId) {
      url += "/" + objectId;
    }
    if ((route ==='users' || route === 'classes') && dataObject && dataObject._fetchWhenSave){
      delete dataObject._fetchWhenSave;
      url += '?new=true';
    }

    dataObject = LC._.clone(dataObject || {});
    if (method !== "POST") {
      dataObject._method = method;
      method = "POST";
    }

    dataObject._ApplicationId = LC.applicationId;
    dataObject._ApplicationKey = LC.applicationKey;
    if(!LC._isNullOrUndefined(LC.applicationProduction)) {
      dataObject._ApplicationProduction = LC.applicationProduction;
    }
    if(LC._useMasterKey)
        dataObject._MasterKey = LC.masterKey;
    dataObject._ClientVersion = LC.VERSION;
    dataObject._InstallationId = LC._getInstallationId();
    // Pass the session token on every request.
    var currentUser = LC.User.current();
    if (currentUser && currentUser._sessionToken) {
      dataObject._SessionToken = currentUser._sessionToken;
    }
    var data = JSON.stringify(dataObject);

    return LC._ajax(method, url, data).then(null, function(response) {
      // Transform the error into an instance of LC.Error by trying to parse
      // the error string as JSON.
      var error;
      if (response && response.responseText) {
        try {
          var errorJSON = JSON.parse(response.responseText);
          if (errorJSON) {
            error = new LC.Error(errorJSON.code, errorJSON.error);
          }
        } catch (e) {
          // If we fail to parse the error text, that's okay.
        }
      }
      error = error || new LC.Error(-1, response.responseText);
      // By explicitly returning a rejected Promise, this will work with
      // either jQuery or Promises/A semantics.
      return LC.Promise.error(error);
    });
  };

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  LC._getValue = function(object, prop) {
    if (!(object && object[prop])) {
      return null;
    }
    return LC._.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  /**
   * Converts a value in a LC Object into the appropriate representation.
   * This is the JS equivalent of Java's LC.maybeReferenceAndEncode(Object)
   * if seenObjects is falsey. Otherwise any LC.Objects not in
   * seenObjects will be fully embedded rather than encoded
   * as a pointer.  This array will be used to prevent going into an infinite
   * loop because we have circular references.  If <seenObjects>
   * is set, then none of the LC Objects that are serialized can be dirty.
   */
  LC._encode = function(value, seenObjects, disallowObjects) {
    var _ = LC._;
    if (value instanceof LC.Object) {
      if (disallowObjects) {
        throw "LC.Objects not allowed here";
      }
      if (!seenObjects || _.include(seenObjects, value) || !value._hasData) {
        return value._toPointer();
      }
      if (!value.dirty()) {
        seenObjects = seenObjects.concat(value);
        return LC._encode(value._toFullJSON(seenObjects),
                             seenObjects,
                             disallowObjects);
      }
      throw "Tried to save an object with a pointer to a new, unsaved object.";
    }
    if (value instanceof LC.ACL) {
      return value.toJSON();
    }
    if (_.isDate(value)) {
      return { "__type": "Date", "iso": value.toJSON() };
    }
    if (value instanceof LC.GeoPoint) {
      return value.toJSON();
    }
    if (_.isArray(value)) {
      return _.map(value, function(x) {
        return LC._encode(x, seenObjects, disallowObjects);
      });
    }
    if (_.isRegExp(value)) {
      return value.source;
    }
    if (value instanceof LC.Relation) {
      return value.toJSON();
    }
    if (value instanceof LC.Op) {
      return value.toJSON();
    }
    if (value instanceof LC.File) {
      if (!value.url() && !value.id) {
        throw "Tried to save an object containing an unsaved file.";
      }
      return {
        __type: "File",
        id:  value.id,
        name: value.name(),
        url: value.url()
      };
    }
    if (_.isObject(value)) {
      var output = {};
      LC._objectEach(value, function(v, k) {
        output[k] = LC._encode(v, seenObjects, disallowObjects);
      });
      return output;
    }
    return value;
  };

  /**
   * The inverse function of LC._encode.
   * TODO: make decode not mutate value.
   */
  LC._decode = function(key, value) {
    var _ = LC._;
    if (!_.isObject(value)) {
      return value;
    }
    if (_.isArray(value)) {
      LC._arrayEach(value, function(v, k) {
        value[k] = LC._decode(k, v);
      });
      return value;
    }
    if (value instanceof LC.Object) {
      return value;
    }
    if (value instanceof LC.File) {
      return value;
    }
    if (value instanceof LC.Op) {
      return value;
    }
    if (value.__op) {
      return LC.Op._decode(value);
    }
    if (value.__type === "Pointer") {
      var className = value.className;
      var pointer = LC.Object._create(className);
      if(value.createdAt){
          delete value.__type;
          delete value.className;
          pointer._finishFetch(value, true);
      }else{
          pointer._finishFetch({ objectId: value.objectId }, false);
      }
      return pointer;
    }
    if (value.__type === "Object") {
      // It's an Object included in a query result.
      var className = value.className;
      delete value.__type;
      delete value.className;
      var object = LC.Object._create(className);
      object._finishFetch(value, true);
      return object;
    }
    if (value.__type === "Date") {
      return LC._parseDate(value.iso);
    }
    if (value.__type === "GeoPoint") {
      return new LC.GeoPoint({
        latitude: value.latitude,
        longitude: value.longitude
      });
    }
    if (key === "ACL") {
      if (value instanceof LC.ACL) {
        return value;
      }
      return new LC.ACL(value);
    }
    if (value.__type === "Relation") {
      var relation = new LC.Relation(null, key);
      relation.targetClassName = value.className;
      return relation;
    }
    if (value.__type === "File") {
      var file = new LC.File(value.name);
      file._metaData = value.metaData || {};
      file._url = value.url;
      file.id = value.objectId;
      return file;
    }
    LC._objectEach(value, function(v, k) {
      value[k] = LC._decode(k, v);
    });
    return value;
  };

  LC._arrayEach = LC._.each;

  /**
   * Does a deep traversal of every item in object, calling func on every one.
   * @param {Object} object The object or array to traverse deeply.
   * @param {Function} func The function to call for every item. It will
   *     be passed the item as an argument. If it returns a truthy value, that
   *     value will replace the item in its parent container.
   * @returns {} the result of calling func on the top-level object itself.
   */
  LC._traverse = function(object, func, seen) {
    if (object instanceof LC.Object) {
      seen = seen || [];
      if (LC._.indexOf(seen, object) >= 0) {
        // We've already visited this object in this call.
        return;
      }
      seen.push(object);
      LC._traverse(object.attributes, func, seen);
      return func(object);
    }
    if (object instanceof LC.Relation || object instanceof LC.File) {
      // Nothing needs to be done, but we don't want to recurse into the
      // object's parent infinitely, so we catch this case.
      return func(object);
    }
    if (LC._.isArray(object)) {
      LC._.each(object, function(child, index) {
        var newChild = LC._traverse(child, func, seen);
        if (newChild) {
          object[index] = newChild;
        }
      });
      return func(object);
    }
    if (LC._.isObject(object)) {
      LC._each(object, function(child, key) {
        var newChild = LC._traverse(child, func, seen);
        if (newChild) {
          object[key] = newChild;
        }
      });
      return func(object);
    }
    return func(object);
  };

  /**
   * This is like _.each, except:
   * * it doesn't work for so-called array-like objects,
   * * it does work for dictionaries with a "length" attribute.
   */
  LC._objectEach = LC._each = function(obj, callback) {
    var _ = LC._;
    if (_.isObject(obj)) {
      _.each(_.keys(obj), function(key) {
        callback(obj[key], key);
      });
    } else {
      _.each(obj, callback);
    }
  };

  // Helper function to check null or undefined.
  LC._isNullOrUndefined = function(x) {
    return LC._.isNull(x) || LC._.isUndefined(x);
  };
};
