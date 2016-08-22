var ML = ML || {}; ML["Timeline"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	__webpack_require__(2);
	
	var _nodeUuid = __webpack_require__(3);
	
	var _nodeUuid2 = _interopRequireDefault(_nodeUuid);
	
	var _DeviceDetector = __webpack_require__(4);
	
	var _DeviceDetector2 = _interopRequireDefault(_DeviceDetector);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var API_SERVER = 'https://api.maxleap.cn';
	var ML_INSTALLATION_FLAG = 'ML_INSTALLATION_FLAG';
	
	/** Timeline 事件数据收集 */
	
	var Timeline = function () {
	    /**
	     * 实例化 Timeline
	     * @param {object} props - 创建 Timeline 对象需要 appId, userId
	     */
	    function Timeline(props) {
	        _classCallCheck(this, Timeline);
	
	        this.UNKNOWN = '0,0';
	        this.appId = props.appId;
	        this.userId = props.userId;
	
	        //用户可以使用默认 server 地址, 也可以用自己的 server
	        this.apiServer = props.apiServer || API_SERVER;
	        this.installation = localStorage.getItem(ML_INSTALLATION_FLAG);
	
	        //如果用户第一次访问页面, 则设置标示放在 localStorage 中
	        if (!this.installation) {
	            try {
	                //safari 的隐身模式不允许设置 localStorage
	                localStorage.setItem(ML_INSTALLATION_FLAG, _nodeUuid2.default.v4());
	            } catch (e) {
	                console.warn('请关闭隐身模式');
	            }
	        }
	        this._autoTrack();
	    }
	
	    /**
	     * 页面初始化时自动收集信息
	     * @private
	     */
	
	
	    _createClass(Timeline, [{
	        key: '_autoTrack',
	        value: function _autoTrack() {
	            this._trackSession();
	            this._trackSessionStart();
	        }
	
	        /**
	         * Session 是一个用户行为的完整周期
	         * @private
	         */
	
	    }, {
	        key: '_trackSession',
	        value: function _trackSession() {
	            var params = this.mergeDefaultParams({
	                _eventType: 5,
	                event: 'Session'
	            });
	
	            this.trackEvent(params);
	        }
	
	        /**
	         * SessionStart 是用户开始的瞬时行为
	         * @private
	         */
	
	    }, {
	        key: '_trackSessionStart',
	        value: function _trackSessionStart() {
	            var params = this.mergeDefaultParams({
	                _eventType: 3,
	                event: 'SessionStart'
	            });
	
	            this.trackEvent(params);
	        }
	
	        /**
	         * SDK 会自动收集一些字段
	         * @param {object} params - 覆盖默认字段
	         */
	
	    }, {
	        key: 'mergeDefaultParams',
	        value: function mergeDefaultParams(params) {
	            return [{
	                properties: {
	                    _eventType: params._eventType,
	                    _userId: this.userId,
	                    _userAgent: window.navigator.userAgent,
	                    uuid: _nodeUuid2.default.v4(),
	                    deviceId: this.installation,
	                    appUserId: this.appUserId, //_User表中的id, 由调用者传入
	                    appId: this.appId, //appId, 由调用者传入
	                    startTime: new Date().getTime(),
	                    userCreateTime: new Date().getTime(),
	                    duration: 0,
	                    upgrade: false,
	                    carrier: this.UNKNOWN,
	                    sessionId: _nodeUuid2.default.v4(),
	                    os: 'web',
	                    osVersion: _DeviceDetector2.default.getOSName(),
	                    resolution: _DeviceDetector2.default.getResolution(),
	                    language: _DeviceDetector2.default.getLanguage(),
	                    national: this.UNKNOWN,
	                    network: this.UNKNOWN,
	                    appVersion: this.UNKNOWN,
	                    sdkVersion: '2.1.0',
	                    push: false,
	                    channel: this.UNKNOWN
	                },
	                time: new Date().getTime(),
	                event: params.event,
	                type: 'track',
	                distinct_id: _nodeUuid2.default.v4()
	            }];
	        }
	
	        /**
	         * 追踪 Timeline 事件
	         * @param {object} params - 发送事件参数
	         */
	
	    }, {
	        key: 'trackEvent',
	        value: function trackEvent(params) {
	            return fetch(this.apiServer + '/2.0/track/event', {
	                method: 'POST',
	                headers: {
	                    'X-ML-AppId': this.appId
	                },
	                body: JSON.stringify(params)
	            }).then(function (res) {
	                return res.json();
	            });
	        }
	    }]);
	
	    return Timeline;
	}();
	
	exports.default = Timeline;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

	(function(self) {
	  'use strict';
	
	  if (self.fetch) {
	    return
	  }
	
	  var support = {
	    searchParams: 'URLSearchParams' in self,
	    iterable: 'Symbol' in self && 'iterator' in Symbol,
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob()
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  }
	
	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name)
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }
	
	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value)
	    }
	    return value
	  }
	
	  // Build a destructive iterator for the value list
	  function iteratorFor(items) {
	    var iterator = {
	      next: function() {
	        var value = items.shift()
	        return {done: value === undefined, value: value}
	      }
	    }
	
	    if (support.iterable) {
	      iterator[Symbol.iterator] = function() {
	        return iterator
	      }
	    }
	
	    return iterator
	  }
	
	  function Headers(headers) {
	    this.map = {}
	
	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value)
	      }, this)
	
	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name])
	      }, this)
	    }
	  }
	
	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name)
	    value = normalizeValue(value)
	    var list = this.map[name]
	    if (!list) {
	      list = []
	      this.map[name] = list
	    }
	    list.push(value)
	  }
	
	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)]
	  }
	
	  Headers.prototype.get = function(name) {
	    var values = this.map[normalizeName(name)]
	    return values ? values[0] : null
	  }
	
	  Headers.prototype.getAll = function(name) {
	    return this.map[normalizeName(name)] || []
	  }
	
	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  }
	
	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = [normalizeValue(value)]
	  }
	
	  Headers.prototype.forEach = function(callback, thisArg) {
	    Object.getOwnPropertyNames(this.map).forEach(function(name) {
	      this.map[name].forEach(function(value) {
	        callback.call(thisArg, value, name, this)
	      }, this)
	    }, this)
	  }
	
	  Headers.prototype.keys = function() {
	    var items = []
	    this.forEach(function(value, name) { items.push(name) })
	    return iteratorFor(items)
	  }
	
	  Headers.prototype.values = function() {
	    var items = []
	    this.forEach(function(value) { items.push(value) })
	    return iteratorFor(items)
	  }
	
	  Headers.prototype.entries = function() {
	    var items = []
	    this.forEach(function(value, name) { items.push([name, value]) })
	    return iteratorFor(items)
	  }
	
	  if (support.iterable) {
	    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
	  }
	
	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true
	  }
	
	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result)
	      }
	      reader.onerror = function() {
	        reject(reader.error)
	      }
	    })
	  }
	
	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader()
	    reader.readAsArrayBuffer(blob)
	    return fileReaderReady(reader)
	  }
	
	  function readBlobAsText(blob) {
	    var reader = new FileReader()
	    reader.readAsText(blob)
	    return fileReaderReady(reader)
	  }
	
	  function Body() {
	    this.bodyUsed = false
	
	    this._initBody = function(body) {
	      this._bodyInit = body
	      if (typeof body === 'string') {
	        this._bodyText = body
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body
	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	        this._bodyText = body.toString()
	      } else if (!body) {
	        this._bodyText = ''
	      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
	        // Only support ArrayBuffers for POST method.
	        // Receiving ArrayBuffers happens via Blobs, instead.
	      } else {
	        throw new Error('unsupported BodyInit type')
	      }
	
	      if (!this.headers.get('content-type')) {
	        if (typeof body === 'string') {
	          this.headers.set('content-type', 'text/plain;charset=UTF-8')
	        } else if (this._bodyBlob && this._bodyBlob.type) {
	          this.headers.set('content-type', this._bodyBlob.type)
	        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
	        }
	      }
	    }
	
	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }
	
	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      }
	
	      this.arrayBuffer = function() {
	        return this.blob().then(readBlobAsArrayBuffer)
	      }
	
	      this.text = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }
	
	        if (this._bodyBlob) {
	          return readBlobAsText(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as text')
	        } else {
	          return Promise.resolve(this._bodyText)
	        }
	      }
	    } else {
	      this.text = function() {
	        var rejected = consumed(this)
	        return rejected ? rejected : Promise.resolve(this._bodyText)
	      }
	    }
	
	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      }
	    }
	
	    this.json = function() {
	      return this.text().then(JSON.parse)
	    }
	
	    return this
	  }
	
	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']
	
	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase()
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }
	
	  function Request(input, options) {
	    options = options || {}
	    var body = options.body
	    if (Request.prototype.isPrototypeOf(input)) {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url
	      this.credentials = input.credentials
	      if (!options.headers) {
	        this.headers = new Headers(input.headers)
	      }
	      this.method = input.method
	      this.mode = input.mode
	      if (!body) {
	        body = input._bodyInit
	        input.bodyUsed = true
	      }
	    } else {
	      this.url = input
	    }
	
	    this.credentials = options.credentials || this.credentials || 'omit'
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers)
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET')
	    this.mode = options.mode || this.mode || null
	    this.referrer = null
	
	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body)
	  }
	
	  Request.prototype.clone = function() {
	    return new Request(this)
	  }
	
	  function decode(body) {
	    var form = new FormData()
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=')
	        var name = split.shift().replace(/\+/g, ' ')
	        var value = split.join('=').replace(/\+/g, ' ')
	        form.append(decodeURIComponent(name), decodeURIComponent(value))
	      }
	    })
	    return form
	  }
	
	  function headers(xhr) {
	    var head = new Headers()
	    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n')
	    pairs.forEach(function(header) {
	      var split = header.trim().split(':')
	      var key = split.shift().trim()
	      var value = split.join(':').trim()
	      head.append(key, value)
	    })
	    return head
	  }
	
	  Body.call(Request.prototype)
	
	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {}
	    }
	
	    this.type = 'default'
	    this.status = options.status
	    this.ok = this.status >= 200 && this.status < 300
	    this.statusText = options.statusText
	    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
	    this.url = options.url || ''
	    this._initBody(bodyInit)
	  }
	
	  Body.call(Response.prototype)
	
	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  }
	
	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''})
	    response.type = 'error'
	    return response
	  }
	
	  var redirectStatuses = [301, 302, 303, 307, 308]
	
	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }
	
	    return new Response(null, {status: status, headers: {location: url}})
	  }
	
	  self.Headers = Headers
	  self.Request = Request
	  self.Response = Response
	
	  self.fetch = function(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request
	      if (Request.prototype.isPrototypeOf(input) && !init) {
	        request = input
	      } else {
	        request = new Request(input, init)
	      }
	
	      var xhr = new XMLHttpRequest()
	
	      function responseURL() {
	        if ('responseURL' in xhr) {
	          return xhr.responseURL
	        }
	
	        // Avoid security warnings on getResponseHeader when not allowed by CORS
	        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
	          return xhr.getResponseHeader('X-Request-URL')
	        }
	
	        return
	      }
	
	      xhr.onload = function() {
	        var options = {
	          status: xhr.status,
	          statusText: xhr.statusText,
	          headers: headers(xhr),
	          url: responseURL()
	        }
	        var body = 'response' in xhr ? xhr.response : xhr.responseText
	        resolve(new Response(body, options))
	      }
	
	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'))
	      }
	
	      xhr.ontimeout = function() {
	        reject(new TypeError('Network request failed'))
	      }
	
	      xhr.open(request.method, request.url, true)
	
	      if (request.credentials === 'include') {
	        xhr.withCredentials = true
	      }
	
	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob'
	      }
	
	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value)
	      })
	
	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
	    })
	  }
	  self.fetch.polyfill = true
	})(typeof self !== 'undefined' ? self : this);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;//     uuid.js
	//
	//     Copyright (c) 2010-2012 Robert Kieffer
	//     MIT License - http://opensource.org/licenses/mit-license.php
	
	(function() {
	  var _global = this;
	
	  // Unique ID creation requires a high quality random # generator.  We feature
	  // detect to determine the best RNG source, normalizing to a function that
	  // returns 128-bits of randomness, since that's what's usually required
	  var _rng;
	
	  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
	  //
	  // Moderately fast, high quality
	  if (typeof(_global.require) == 'function') {
	    try {
	      var _rb = _global.require('crypto').randomBytes;
	      _rng = _rb && function() {return _rb(16);};
	    } catch(e) {}
	  }
	
	  if (!_rng && _global.crypto && crypto.getRandomValues) {
	    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
	    //
	    // Moderately fast, high quality
	    var _rnds8 = new Uint8Array(16);
	    _rng = function whatwgRNG() {
	      crypto.getRandomValues(_rnds8);
	      return _rnds8;
	    };
	  }
	
	  if (!_rng) {
	    // Math.random()-based (RNG)
	    //
	    // If all else fails, use Math.random().  It's fast, but is of unspecified
	    // quality.
	    var  _rnds = new Array(16);
	    _rng = function() {
	      for (var i = 0, r; i < 16; i++) {
	        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
	        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
	      }
	
	      return _rnds;
	    };
	  }
	
	  // Buffer class to use
	  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;
	
	  // Maps for number <-> hex string conversion
	  var _byteToHex = [];
	  var _hexToByte = {};
	  for (var i = 0; i < 256; i++) {
	    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
	    _hexToByte[_byteToHex[i]] = i;
	  }
	
	  // **`parse()` - Parse a UUID into it's component bytes**
	  function parse(s, buf, offset) {
	    var i = (buf && offset) || 0, ii = 0;
	
	    buf = buf || [];
	    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
	      if (ii < 16) { // Don't overflow!
	        buf[i + ii++] = _hexToByte[oct];
	      }
	    });
	
	    // Zero out remaining bytes if string was short
	    while (ii < 16) {
	      buf[i + ii++] = 0;
	    }
	
	    return buf;
	  }
	
	  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
	  function unparse(buf, offset) {
	    var i = offset || 0, bth = _byteToHex;
	    return  bth[buf[i++]] + bth[buf[i++]] +
	            bth[buf[i++]] + bth[buf[i++]] + '-' +
	            bth[buf[i++]] + bth[buf[i++]] + '-' +
	            bth[buf[i++]] + bth[buf[i++]] + '-' +
	            bth[buf[i++]] + bth[buf[i++]] + '-' +
	            bth[buf[i++]] + bth[buf[i++]] +
	            bth[buf[i++]] + bth[buf[i++]] +
	            bth[buf[i++]] + bth[buf[i++]];
	  }
	
	  // **`v1()` - Generate time-based UUID**
	  //
	  // Inspired by https://github.com/LiosK/UUID.js
	  // and http://docs.python.org/library/uuid.html
	
	  // random #'s we need to init node and clockseq
	  var _seedBytes = _rng();
	
	  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	  var _nodeId = [
	    _seedBytes[0] | 0x01,
	    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
	  ];
	
	  // Per 4.2.2, randomize (14 bit) clockseq
	  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;
	
	  // Previous uuid creation time
	  var _lastMSecs = 0, _lastNSecs = 0;
	
	  // See https://github.com/broofa/node-uuid for API details
	  function v1(options, buf, offset) {
	    var i = buf && offset || 0;
	    var b = buf || [];
	
	    options = options || {};
	
	    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;
	
	    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	    var msecs = options.msecs != null ? options.msecs : new Date().getTime();
	
	    // Per 4.2.1.2, use count of uuid's generated during the current clock
	    // cycle to simulate higher resolution clock
	    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;
	
	    // Time since last uuid creation (in msecs)
	    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;
	
	    // Per 4.2.1.2, Bump clockseq on clock regression
	    if (dt < 0 && options.clockseq == null) {
	      clockseq = clockseq + 1 & 0x3fff;
	    }
	
	    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	    // time interval
	    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
	      nsecs = 0;
	    }
	
	    // Per 4.2.1.2 Throw error if too many uuids are requested
	    if (nsecs >= 10000) {
	      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	    }
	
	    _lastMSecs = msecs;
	    _lastNSecs = nsecs;
	    _clockseq = clockseq;
	
	    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	    msecs += 12219292800000;
	
	    // `time_low`
	    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	    b[i++] = tl >>> 24 & 0xff;
	    b[i++] = tl >>> 16 & 0xff;
	    b[i++] = tl >>> 8 & 0xff;
	    b[i++] = tl & 0xff;
	
	    // `time_mid`
	    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	    b[i++] = tmh >>> 8 & 0xff;
	    b[i++] = tmh & 0xff;
	
	    // `time_high_and_version`
	    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	    b[i++] = tmh >>> 16 & 0xff;
	
	    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	    b[i++] = clockseq >>> 8 | 0x80;
	
	    // `clock_seq_low`
	    b[i++] = clockseq & 0xff;
	
	    // `node`
	    var node = options.node || _nodeId;
	    for (var n = 0; n < 6; n++) {
	      b[i + n] = node[n];
	    }
	
	    return buf ? buf : unparse(b);
	  }
	
	  // **`v4()` - Generate random UUID**
	
	  // See https://github.com/broofa/node-uuid for API details
	  function v4(options, buf, offset) {
	    // Deprecated - 'format' argument, as supported in v1.2
	    var i = buf && offset || 0;
	
	    if (typeof(options) == 'string') {
	      buf = options == 'binary' ? new BufferClass(16) : null;
	      options = null;
	    }
	    options = options || {};
	
	    var rnds = options.random || (options.rng || _rng)();
	
	    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	    rnds[6] = (rnds[6] & 0x0f) | 0x40;
	    rnds[8] = (rnds[8] & 0x3f) | 0x80;
	
	    // Copy bytes to buffer, if provided
	    if (buf) {
	      for (var ii = 0; ii < 16; ii++) {
	        buf[i + ii] = rnds[ii];
	      }
	    }
	
	    return buf || unparse(rnds);
	  }
	
	  // Export public API
	  var uuid = v4;
	  uuid.v1 = v1;
	  uuid.v4 = v4;
	  uuid.parse = parse;
	  uuid.unparse = unparse;
	  uuid.BufferClass = BufferClass;
	
	  if (typeof(module) != 'undefined' && module.exports) {
	    // Publish as node.js module
	    module.exports = uuid;
	  } else  if (true) {
	    // Publish as AMD module
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {return uuid;}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	 
	
	  } else {
	    // Publish as global (in browsers)
	    var _previousRoot = _global.uuid;
	
	    // **`noConflict()` - (browser only) to reset global 'uuid' var**
	    uuid.noConflict = function() {
	      _global.uuid = _previousRoot;
	      return uuid;
	    };
	
	    _global.uuid = uuid;
	  }
	}).call(this);


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _webDetector = __webpack_require__(5);
	
	var _webDetector2 = _interopRequireDefault(_webDetector);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var DeviceDetector = function () {
	    function DeviceDetector() {
	        _classCallCheck(this, DeviceDetector);
	    }
	
	    _createClass(DeviceDetector, null, [{
	        key: 'getOSName',
	        value: function getOSName() {
	            return _webDetector2.default.os.name === 'na' ? 'unknown' : _webDetector2.default.os.name;
	        }
	    }, {
	        key: 'getOSVersion',
	        value: function getOSVersion() {
	            //如果是windows系统,web-detector返回的是NT的版本号,需要转换成windows版本
	            if (_webDetector2.default.os.name === 'windows') {
	                if (_webDetector2.default.os.version >= 10) {
	                    return '10';
	                } else if (_webDetector2.default.os.version >= 6.3) {
	                    return '8.1';
	                } else if (_webDetector2.default.os.version >= 6.2) {
	                    return '8';
	                } else if (_webDetector2.default.os.version >= 6.1) {
	                    return '7';
	                } else if (_webDetector2.default.os.version >= 6.0) {
	                    return 'vista';
	                } else if (_webDetector2.default.os.version >= 5.1) {
	                    return 'xp';
	                } else if (_webDetector2.default.os.version >= 5.0) {
	                    return '2000';
	                }
	            }
	            return _webDetector2.default.os.fullVersion === '-1' ? 'unknown' : _webDetector2.default.os.fullVersion;
	        }
	    }, {
	        key: 'getResolution',
	        value: function getResolution() {
	            return screen.width + '*' + screen.height;
	        }
	    }, {
	        key: 'getLanguage',
	        value: function getLanguage() {
	            return (navigator.language || navigator.userLanguage).match(/\w+(?=-)/)[0];
	        }
	    }]);
	
	    return DeviceDetector;
	}();
	
	exports.default = DeviceDetector;
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	__webpack_require__(6);
	
	var Detector = __webpack_require__(7);
	var WebRules = __webpack_require__(8);
	
	var userAgent = navigator.userAgent || "";
	//const platform = navigator.platform || "";
	var appVersion = navigator.appVersion || "";
	var vendor = navigator.vendor || "";
	var ua = userAgent + " " + appVersion + " " + vendor;
	
	var detector = new Detector(WebRules);
	
	// 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
	// @param {String} ua, userAgent string.
	// @return {Object}
	function IEMode(ua) {
	  if (!WebRules.re_msie.test(ua)) {
	    return null;
	  }
	
	  var m = void 0;
	  var engineMode = void 0;
	  var engineVersion = void 0;
	  var browserMode = void 0;
	  var browserVersion = void 0;
	
	  // IE8 及其以上提供有 Trident 信息，
	  // 默认的兼容模式，UA 中 Trident 版本不发生变化。
	  if (ua.indexOf("trident/") !== -1) {
	    m = /\btrident\/([0-9.]+)/.exec(ua);
	    if (m && m.length >= 2) {
	      // 真实引擎版本。
	      engineVersion = m[1];
	      var v_version = m[1].split(".");
	      v_version[0] = parseInt(v_version[0], 10) + 4;
	      browserVersion = v_version.join(".");
	    }
	  }
	
	  m = WebRules.re_msie.exec(ua);
	  browserMode = m[1];
	  var v_mode = m[1].split(".");
	  if (typeof browserVersion === "undefined") {
	    browserVersion = browserMode;
	  }
	  v_mode[0] = parseInt(v_mode[0], 10) - 4;
	  engineMode = v_mode.join(".");
	  if (typeof engineVersion === "undefined") {
	    engineVersion = engineMode;
	  }
	
	  return {
	    browserVersion: browserVersion,
	    browserMode: browserMode,
	    engineVersion: engineVersion,
	    engineMode: engineMode,
	    compatible: engineVersion !== engineMode
	  };
	}
	
	function WebParse(ua) {
	  var d = detector.parse(ua);
	
	  var ieCore = IEMode(ua);
	
	  // IE 内核的浏览器，修复版本号及兼容模式。
	  if (ieCore) {
	    var engineName = d.engine.name;
	    var engineVersion = ieCore.engineVersion || ieCore.engineMode;
	    var ve = parseFloat(engineVersion);
	    var engineMode = ieCore.engineMode;
	
	    d.engine = {
	      name: engineName,
	      version: ve,
	      fullVersion: engineVersion,
	      mode: parseFloat(engineMode),
	      fullMode: engineMode,
	      compatible: ieCore ? ieCore.compatible : false
	    };
	    d.engine[d.engine.name] = ve;
	
	    var browserName = d.browser.name;
	    // IE 内核的浏览器，修复浏览器版本及兼容模式。
	    // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
	    var browserVersion = d.browser.fullVersion;
	    if (browserName === "ie") {
	      browserVersion = ieCore.browserVersion;
	    }
	    var browserMode = ieCore.browserMode;
	    var vb = parseFloat(browserVersion);
	    d.browser = {
	      name: browserName,
	      version: vb,
	      fullVersion: browserVersion,
	      mode: parseFloat(browserMode),
	      fullMode: browserMode,
	      compatible: ieCore ? ieCore.compatible : false
	    };
	    d.browser[browserName] = vb;
	  }
	  return d;
	}
	
	var Tan = WebParse(ua);
	Tan.parse = WebParse;
	module.exports = Tan;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * https://github.com/es-shims/es5-shim
	 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
	 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
	 */
	
	// vim: ts=4 sts=4 sw=4 expandtab
	
	// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
	;
	
	// UMD (Universal Module Definition)
	// see https://github.com/umdjs/umd/blob/master/templates/returnExports.js
	(function (root, factory) {
	    'use strict';
	
	    /* global define, exports, module */
	    if (true) {
	        // AMD. Register as an anonymous module.
	        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports === 'object') {
	        // Node. Does not work with strict CommonJS, but
	        // only CommonJS-like enviroments that support module.exports,
	        // like Node.
	        module.exports = factory();
	    } else {
	        // Browser globals (root is window)
	        root.returnExports = factory();
	    }
	}(this, function () {
	
	/**
	 * Brings an environment as close to ECMAScript 5 compliance
	 * as is possible with the facilities of erstwhile engines.
	 *
	 * Annotated ES5: http://es5.github.com/ (specific links below)
	 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
	 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
	 */
	
	// Shortcut to an often accessed properties, in order to avoid multiple
	// dereference that costs universally. This also holds a reference to known-good
	// functions.
	var $Array = Array;
	var ArrayPrototype = $Array.prototype;
	var $Object = Object;
	var ObjectPrototype = $Object.prototype;
	var $Function = Function;
	var FunctionPrototype = $Function.prototype;
	var $String = String;
	var StringPrototype = $String.prototype;
	var $Number = Number;
	var NumberPrototype = $Number.prototype;
	var array_slice = ArrayPrototype.slice;
	var array_splice = ArrayPrototype.splice;
	var array_push = ArrayPrototype.push;
	var array_unshift = ArrayPrototype.unshift;
	var array_concat = ArrayPrototype.concat;
	var array_join = ArrayPrototype.join;
	var call = FunctionPrototype.call;
	var apply = FunctionPrototype.apply;
	var max = Math.max;
	var min = Math.min;
	
	// Having a toString local variable name breaks in Opera so use to_string.
	var to_string = ObjectPrototype.toString;
	
	/* global Symbol */
	/* eslint-disable one-var-declaration-per-line, no-redeclare, max-statements-per-line */
	var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
	var isCallable; /* inlined from https://npmjs.com/is-callable */ var fnToStr = Function.prototype.toString, constructorRegex = /^\s*class /, isES6ClassFn = function isES6ClassFn(value) { try { var fnStr = fnToStr.call(value); var singleStripped = fnStr.replace(/\/\/.*\n/g, ''); var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, ''); var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' '); return constructorRegex.test(spaceStripped); } catch (e) { return false; /* not a function */ } }, tryFunctionObject = function tryFunctionObject(value) { try { if (isES6ClassFn(value)) { return false; } fnToStr.call(value); return true; } catch (e) { return false; } }, fnClass = '[object Function]', genClass = '[object GeneratorFunction]', isCallable = function isCallable(value) { if (!value) { return false; } if (typeof value !== 'function' && typeof value !== 'object') { return false; } if (hasToStringTag) { return tryFunctionObject(value); } if (isES6ClassFn(value)) { return false; } var strClass = to_string.call(value); return strClass === fnClass || strClass === genClass; };
	
	var isRegex; /* inlined from https://npmjs.com/is-regex */ var regexExec = RegExp.prototype.exec, tryRegexExec = function tryRegexExec(value) { try { regexExec.call(value); return true; } catch (e) { return false; } }, regexClass = '[object RegExp]'; isRegex = function isRegex(value) { if (typeof value !== 'object') { return false; } return hasToStringTag ? tryRegexExec(value) : to_string.call(value) === regexClass; };
	var isString; /* inlined from https://npmjs.com/is-string */ var strValue = String.prototype.valueOf, tryStringObject = function tryStringObject(value) { try { strValue.call(value); return true; } catch (e) { return false; } }, stringClass = '[object String]'; isString = function isString(value) { if (typeof value === 'string') { return true; } if (typeof value !== 'object') { return false; } return hasToStringTag ? tryStringObject(value) : to_string.call(value) === stringClass; };
	/* eslint-enable one-var-declaration-per-line, no-redeclare, max-statements-per-line */
	
	/* inlined from http://npmjs.com/define-properties */
	var supportsDescriptors = $Object.defineProperty && (function () {
	    try {
	        var obj = {};
	        $Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
	        for (var _ in obj) { return false; }
	        return obj.x === obj;
	    } catch (e) { /* this is ES3 */
	        return false;
	    }
	}());
	var defineProperties = (function (has) {
	  // Define configurable, writable, and non-enumerable props
	  // if they don't exist.
	  var defineProperty;
	  if (supportsDescriptors) {
	      defineProperty = function (object, name, method, forceAssign) {
	          if (!forceAssign && (name in object)) { return; }
	          $Object.defineProperty(object, name, {
	              configurable: true,
	              enumerable: false,
	              writable: true,
	              value: method
	          });
	      };
	  } else {
	      defineProperty = function (object, name, method, forceAssign) {
	          if (!forceAssign && (name in object)) { return; }
	          object[name] = method;
	      };
	  }
	  return function defineProperties(object, map, forceAssign) {
	      for (var name in map) {
	          if (has.call(map, name)) {
	            defineProperty(object, name, map[name], forceAssign);
	          }
	      }
	  };
	}(ObjectPrototype.hasOwnProperty));
	
	//
	// Util
	// ======
	//
	
	/* replaceable with https://npmjs.com/package/es-abstract /helpers/isPrimitive */
	var isPrimitive = function isPrimitive(input) {
	    var type = typeof input;
	    return input === null || (type !== 'object' && type !== 'function');
	};
	
	var isActualNaN = $Number.isNaN || function (x) { return x !== x; };
	
	var ES = {
	    // ES5 9.4
	    // http://es5.github.com/#x9.4
	    // http://jsperf.com/to-integer
	    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */
	    ToInteger: function ToInteger(num) {
	        var n = +num;
	        if (isActualNaN(n)) {
	            n = 0;
	        } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
	            n = (n > 0 || -1) * Math.floor(Math.abs(n));
	        }
	        return n;
	    },
	
	    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToPrimitive */
	    ToPrimitive: function ToPrimitive(input) {
	        var val, valueOf, toStr;
	        if (isPrimitive(input)) {
	            return input;
	        }
	        valueOf = input.valueOf;
	        if (isCallable(valueOf)) {
	            val = valueOf.call(input);
	            if (isPrimitive(val)) {
	                return val;
	            }
	        }
	        toStr = input.toString;
	        if (isCallable(toStr)) {
	            val = toStr.call(input);
	            if (isPrimitive(val)) {
	                return val;
	            }
	        }
	        throw new TypeError();
	    },
	
	    // ES5 9.9
	    // http://es5.github.com/#x9.9
	    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToObject */
	    ToObject: function (o) {
	        if (o == null) { // this matches both null and undefined
	            throw new TypeError("can't convert " + o + ' to object');
	        }
	        return $Object(o);
	    },
	
	    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToUint32 */
	    ToUint32: function ToUint32(x) {
	        return x >>> 0;
	    }
	};
	
	//
	// Function
	// ========
	//
	
	// ES-5 15.3.4.5
	// http://es5.github.com/#x15.3.4.5
	
	var Empty = function Empty() {};
	
	defineProperties(FunctionPrototype, {
	    bind: function bind(that) { // .length is 1
	        // 1. Let Target be the this value.
	        var target = this;
	        // 2. If IsCallable(Target) is false, throw a TypeError exception.
	        if (!isCallable(target)) {
	            throw new TypeError('Function.prototype.bind called on incompatible ' + target);
	        }
	        // 3. Let A be a new (possibly empty) internal list of all of the
	        //   argument values provided after thisArg (arg1, arg2 etc), in order.
	        // XXX slicedArgs will stand in for "A" if used
	        var args = array_slice.call(arguments, 1); // for normal call
	        // 4. Let F be a new native ECMAScript object.
	        // 11. Set the [[Prototype]] internal property of F to the standard
	        //   built-in Function prototype object as specified in 15.3.3.1.
	        // 12. Set the [[Call]] internal property of F as described in
	        //   15.3.4.5.1.
	        // 13. Set the [[Construct]] internal property of F as described in
	        //   15.3.4.5.2.
	        // 14. Set the [[HasInstance]] internal property of F as described in
	        //   15.3.4.5.3.
	        var bound;
	        var binder = function () {
	
	            if (this instanceof bound) {
	                // 15.3.4.5.2 [[Construct]]
	                // When the [[Construct]] internal method of a function object,
	                // F that was created using the bind function is called with a
	                // list of arguments ExtraArgs, the following steps are taken:
	                // 1. Let target be the value of F's [[TargetFunction]]
	                //   internal property.
	                // 2. If target has no [[Construct]] internal method, a
	                //   TypeError exception is thrown.
	                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
	                //   property.
	                // 4. Let args be a new list containing the same values as the
	                //   list boundArgs in the same order followed by the same
	                //   values as the list ExtraArgs in the same order.
	                // 5. Return the result of calling the [[Construct]] internal
	                //   method of target providing args as the arguments.
	
	                var result = apply.call(
	                    target,
	                    this,
	                    array_concat.call(args, array_slice.call(arguments))
	                );
	                if ($Object(result) === result) {
	                    return result;
	                }
	                return this;
	
	            } else {
	                // 15.3.4.5.1 [[Call]]
	                // When the [[Call]] internal method of a function object, F,
	                // which was created using the bind function is called with a
	                // this value and a list of arguments ExtraArgs, the following
	                // steps are taken:
	                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
	                //   property.
	                // 2. Let boundThis be the value of F's [[BoundThis]] internal
	                //   property.
	                // 3. Let target be the value of F's [[TargetFunction]] internal
	                //   property.
	                // 4. Let args be a new list containing the same values as the
	                //   list boundArgs in the same order followed by the same
	                //   values as the list ExtraArgs in the same order.
	                // 5. Return the result of calling the [[Call]] internal method
	                //   of target providing boundThis as the this value and
	                //   providing args as the arguments.
	
	                // equiv: target.call(this, ...boundArgs, ...args)
	                return apply.call(
	                    target,
	                    that,
	                    array_concat.call(args, array_slice.call(arguments))
	                );
	
	            }
	
	        };
	
	        // 15. If the [[Class]] internal property of Target is "Function", then
	        //     a. Let L be the length property of Target minus the length of A.
	        //     b. Set the length own property of F to either 0 or L, whichever is
	        //       larger.
	        // 16. Else set the length own property of F to 0.
	
	        var boundLength = max(0, target.length - args.length);
	
	        // 17. Set the attributes of the length own property of F to the values
	        //   specified in 15.3.5.1.
	        var boundArgs = [];
	        for (var i = 0; i < boundLength; i++) {
	            array_push.call(boundArgs, '$' + i);
	        }
	
	        // XXX Build a dynamic function with desired amount of arguments is the only
	        // way to set the length property of a function.
	        // In environments where Content Security Policies enabled (Chrome extensions,
	        // for ex.) all use of eval or Function costructor throws an exception.
	        // However in all of these environments Function.prototype.bind exists
	        // and so this code will never be executed.
	        bound = $Function('binder', 'return function (' + array_join.call(boundArgs, ',') + '){ return binder.apply(this, arguments); }')(binder);
	
	        if (target.prototype) {
	            Empty.prototype = target.prototype;
	            bound.prototype = new Empty();
	            // Clean up dangling references.
	            Empty.prototype = null;
	        }
	
	        // TODO
	        // 18. Set the [[Extensible]] internal property of F to true.
	
	        // TODO
	        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
	        // 20. Call the [[DefineOwnProperty]] internal method of F with
	        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
	        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
	        //   false.
	        // 21. Call the [[DefineOwnProperty]] internal method of F with
	        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
	        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
	        //   and false.
	
	        // TODO
	        // NOTE Function objects created using Function.prototype.bind do not
	        // have a prototype property or the [[Code]], [[FormalParameters]], and
	        // [[Scope]] internal properties.
	        // XXX can't delete prototype in pure-js.
	
	        // 22. Return F.
	        return bound;
	    }
	});
	
	// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
	// use it in defining shortcuts.
	var owns = call.bind(ObjectPrototype.hasOwnProperty);
	var toStr = call.bind(ObjectPrototype.toString);
	var arraySlice = call.bind(array_slice);
	var arraySliceApply = apply.bind(array_slice);
	var strSlice = call.bind(StringPrototype.slice);
	var strSplit = call.bind(StringPrototype.split);
	var strIndexOf = call.bind(StringPrototype.indexOf);
	var pushCall = call.bind(array_push);
	var isEnum = call.bind(ObjectPrototype.propertyIsEnumerable);
	var arraySort = call.bind(ArrayPrototype.sort);
	
	//
	// Array
	// =====
	//
	
	var isArray = $Array.isArray || function isArray(obj) {
	    return toStr(obj) === '[object Array]';
	};
	
	// ES5 15.4.4.12
	// http://es5.github.com/#x15.4.4.13
	// Return len+argCount.
	// [bugfix, ielt8]
	// IE < 8 bug: [].unshift(0) === undefined but should be "1"
	var hasUnshiftReturnValueBug = [].unshift(0) !== 1;
	defineProperties(ArrayPrototype, {
	    unshift: function () {
	        array_unshift.apply(this, arguments);
	        return this.length;
	    }
	}, hasUnshiftReturnValueBug);
	
	// ES5 15.4.3.2
	// http://es5.github.com/#x15.4.3.2
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
	defineProperties($Array, { isArray: isArray });
	
	// The IsCallable() check in the Array functions
	// has been replaced with a strict check on the
	// internal class of the object to trap cases where
	// the provided function was actually a regular
	// expression literal, which in V8 and
	// JavaScriptCore is a typeof "function".  Only in
	// V8 are regular expression literals permitted as
	// reduce parameters, so it is desirable in the
	// general case for the shim to match the more
	// strict and common behavior of rejecting regular
	// expressions.
	
	// ES5 15.4.4.18
	// http://es5.github.com/#x15.4.4.18
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach
	
	// Check failure of by-index access of string characters (IE < 9)
	// and failure of `0 in boxedString` (Rhino)
	var boxedString = $Object('a');
	var splitString = boxedString[0] !== 'a' || !(0 in boxedString);
	
	var properlyBoxesContext = function properlyBoxed(method) {
	    // Check node 0.6.21 bug where third parameter is not boxed
	    var properlyBoxesNonStrict = true;
	    var properlyBoxesStrict = true;
	    var threwException = false;
	    if (method) {
	        try {
	            method.call('foo', function (_, __, context) {
	                if (typeof context !== 'object') {
	                    properlyBoxesNonStrict = false;
	                }
	            });
	
	            method.call([1], function () {
	                'use strict';
	
	                properlyBoxesStrict = typeof this === 'string';
	            }, 'x');
	        } catch (e) {
	            threwException = true;
	        }
	    }
	    return !!method && !threwException && properlyBoxesNonStrict && properlyBoxesStrict;
	};
	
	defineProperties(ArrayPrototype, {
	    forEach: function forEach(callbackfn/*, thisArg*/) {
	        var object = ES.ToObject(this);
	        var self = splitString && isString(this) ? strSplit(this, '') : object;
	        var i = -1;
	        var length = ES.ToUint32(self.length);
	        var T;
	        if (arguments.length > 1) {
	          T = arguments[1];
	        }
	
	        // If no callback function or if callback is not a callable function
	        if (!isCallable(callbackfn)) {
	            throw new TypeError('Array.prototype.forEach callback must be a function');
	        }
	
	        while (++i < length) {
	            if (i in self) {
	                // Invoke the callback function with call, passing arguments:
	                // context, property value, property key, thisArg object
	                if (typeof T === 'undefined') {
	                    callbackfn(self[i], i, object);
	                } else {
	                    callbackfn.call(T, self[i], i, object);
	                }
	            }
	        }
	    }
	}, !properlyBoxesContext(ArrayPrototype.forEach));
	
	// ES5 15.4.4.19
	// http://es5.github.com/#x15.4.4.19
	// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
	defineProperties(ArrayPrototype, {
	    map: function map(callbackfn/*, thisArg*/) {
	        var object = ES.ToObject(this);
	        var self = splitString && isString(this) ? strSplit(this, '') : object;
	        var length = ES.ToUint32(self.length);
	        var result = $Array(length);
	        var T;
	        if (arguments.length > 1) {
	            T = arguments[1];
	        }
	
	        // If no callback function or if callback is not a callable function
	        if (!isCallable(callbackfn)) {
	            throw new TypeError('Array.prototype.map callback must be a function');
	        }
	
	        for (var i = 0; i < length; i++) {
	            if (i in self) {
	                if (typeof T === 'undefined') {
	                    result[i] = callbackfn(self[i], i, object);
	                } else {
	                    result[i] = callbackfn.call(T, self[i], i, object);
	                }
	            }
	        }
	        return result;
	    }
	}, !properlyBoxesContext(ArrayPrototype.map));
	
	// ES5 15.4.4.20
	// http://es5.github.com/#x15.4.4.20
	// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
	defineProperties(ArrayPrototype, {
	    filter: function filter(callbackfn/*, thisArg*/) {
	        var object = ES.ToObject(this);
	        var self = splitString && isString(this) ? strSplit(this, '') : object;
	        var length = ES.ToUint32(self.length);
	        var result = [];
	        var value;
	        var T;
	        if (arguments.length > 1) {
	            T = arguments[1];
	        }
	
	        // If no callback function or if callback is not a callable function
	        if (!isCallable(callbackfn)) {
	            throw new TypeError('Array.prototype.filter callback must be a function');
	        }
	
	        for (var i = 0; i < length; i++) {
	            if (i in self) {
	                value = self[i];
	                if (typeof T === 'undefined' ? callbackfn(value, i, object) : callbackfn.call(T, value, i, object)) {
	                    pushCall(result, value);
	                }
	            }
	        }
	        return result;
	    }
	}, !properlyBoxesContext(ArrayPrototype.filter));
	
	// ES5 15.4.4.16
	// http://es5.github.com/#x15.4.4.16
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
	defineProperties(ArrayPrototype, {
	    every: function every(callbackfn/*, thisArg*/) {
	        var object = ES.ToObject(this);
	        var self = splitString && isString(this) ? strSplit(this, '') : object;
	        var length = ES.ToUint32(self.length);
	        var T;
	        if (arguments.length > 1) {
	            T = arguments[1];
	        }
	
	        // If no callback function or if callback is not a callable function
	        if (!isCallable(callbackfn)) {
	            throw new TypeError('Array.prototype.every callback must be a function');
	        }
	
	        for (var i = 0; i < length; i++) {
	            if (i in self && !(typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
	                return false;
	            }
	        }
	        return true;
	    }
	}, !properlyBoxesContext(ArrayPrototype.every));
	
	// ES5 15.4.4.17
	// http://es5.github.com/#x15.4.4.17
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
	defineProperties(ArrayPrototype, {
	    some: function some(callbackfn/*, thisArg */) {
	        var object = ES.ToObject(this);
	        var self = splitString && isString(this) ? strSplit(this, '') : object;
	        var length = ES.ToUint32(self.length);
	        var T;
	        if (arguments.length > 1) {
	            T = arguments[1];
	        }
	
	        // If no callback function or if callback is not a callable function
	        if (!isCallable(callbackfn)) {
	            throw new TypeError('Array.prototype.some callback must be a function');
	        }
	
	        for (var i = 0; i < length; i++) {
	            if (i in self && (typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
	                return true;
	            }
	        }
	        return false;
	    }
	}, !properlyBoxesContext(ArrayPrototype.some));
	
	// ES5 15.4.4.21
	// http://es5.github.com/#x15.4.4.21
	// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
	var reduceCoercesToObject = false;
	if (ArrayPrototype.reduce) {
	    reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) {
	        return list;
	    }) === 'object';
	}
	defineProperties(ArrayPrototype, {
	    reduce: function reduce(callbackfn/*, initialValue*/) {
	        var object = ES.ToObject(this);
	        var self = splitString && isString(this) ? strSplit(this, '') : object;
	        var length = ES.ToUint32(self.length);
	
	        // If no callback function or if callback is not a callable function
	        if (!isCallable(callbackfn)) {
	            throw new TypeError('Array.prototype.reduce callback must be a function');
	        }
	
	        // no value to return if no initial value and an empty array
	        if (length === 0 && arguments.length === 1) {
	            throw new TypeError('reduce of empty array with no initial value');
	        }
	
	        var i = 0;
	        var result;
	        if (arguments.length >= 2) {
	            result = arguments[1];
	        } else {
	            do {
	                if (i in self) {
	                    result = self[i++];
	                    break;
	                }
	
	                // if array contains no values, no initial value to return
	                if (++i >= length) {
	                    throw new TypeError('reduce of empty array with no initial value');
	                }
	            } while (true);
	        }
	
	        for (; i < length; i++) {
	            if (i in self) {
	                result = callbackfn(result, self[i], i, object);
	            }
	        }
	
	        return result;
	    }
	}, !reduceCoercesToObject);
	
	// ES5 15.4.4.22
	// http://es5.github.com/#x15.4.4.22
	// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
	var reduceRightCoercesToObject = false;
	if (ArrayPrototype.reduceRight) {
	    reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) {
	        return list;
	    }) === 'object';
	}
	defineProperties(ArrayPrototype, {
	    reduceRight: function reduceRight(callbackfn/*, initial*/) {
	        var object = ES.ToObject(this);
	        var self = splitString && isString(this) ? strSplit(this, '') : object;
	        var length = ES.ToUint32(self.length);
	
	        // If no callback function or if callback is not a callable function
	        if (!isCallable(callbackfn)) {
	            throw new TypeError('Array.prototype.reduceRight callback must be a function');
	        }
	
	        // no value to return if no initial value, empty array
	        if (length === 0 && arguments.length === 1) {
	            throw new TypeError('reduceRight of empty array with no initial value');
	        }
	
	        var result;
	        var i = length - 1;
	        if (arguments.length >= 2) {
	            result = arguments[1];
	        } else {
	            do {
	                if (i in self) {
	                    result = self[i--];
	                    break;
	                }
	
	                // if array contains no values, no initial value to return
	                if (--i < 0) {
	                    throw new TypeError('reduceRight of empty array with no initial value');
	                }
	            } while (true);
	        }
	
	        if (i < 0) {
	            return result;
	        }
	
	        do {
	            if (i in self) {
	                result = callbackfn(result, self[i], i, object);
	            }
	        } while (i--);
	
	        return result;
	    }
	}, !reduceRightCoercesToObject);
	
	// ES5 15.4.4.14
	// http://es5.github.com/#x15.4.4.14
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
	var hasFirefox2IndexOfBug = ArrayPrototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
	defineProperties(ArrayPrototype, {
	    indexOf: function indexOf(searchElement/*, fromIndex */) {
	        var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);
	        var length = ES.ToUint32(self.length);
	
	        if (length === 0) {
	            return -1;
	        }
	
	        var i = 0;
	        if (arguments.length > 1) {
	            i = ES.ToInteger(arguments[1]);
	        }
	
	        // handle negative indices
	        i = i >= 0 ? i : max(0, length + i);
	        for (; i < length; i++) {
	            if (i in self && self[i] === searchElement) {
	                return i;
	            }
	        }
	        return -1;
	    }
	}, hasFirefox2IndexOfBug);
	
	// ES5 15.4.4.15
	// http://es5.github.com/#x15.4.4.15
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
	var hasFirefox2LastIndexOfBug = ArrayPrototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;
	defineProperties(ArrayPrototype, {
	    lastIndexOf: function lastIndexOf(searchElement/*, fromIndex */) {
	        var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);
	        var length = ES.ToUint32(self.length);
	
	        if (length === 0) {
	            return -1;
	        }
	        var i = length - 1;
	        if (arguments.length > 1) {
	            i = min(i, ES.ToInteger(arguments[1]));
	        }
	        // handle negative indices
	        i = i >= 0 ? i : length - Math.abs(i);
	        for (; i >= 0; i--) {
	            if (i in self && searchElement === self[i]) {
	                return i;
	            }
	        }
	        return -1;
	    }
	}, hasFirefox2LastIndexOfBug);
	
	// ES5 15.4.4.12
	// http://es5.github.com/#x15.4.4.12
	var spliceNoopReturnsEmptyArray = (function () {
	    var a = [1, 2];
	    var result = a.splice();
	    return a.length === 2 && isArray(result) && result.length === 0;
	}());
	defineProperties(ArrayPrototype, {
	    // Safari 5.0 bug where .splice() returns undefined
	    splice: function splice(start, deleteCount) {
	        if (arguments.length === 0) {
	            return [];
	        } else {
	            return array_splice.apply(this, arguments);
	        }
	    }
	}, !spliceNoopReturnsEmptyArray);
	
	var spliceWorksWithEmptyObject = (function () {
	    var obj = {};
	    ArrayPrototype.splice.call(obj, 0, 0, 1);
	    return obj.length === 1;
	}());
	defineProperties(ArrayPrototype, {
	    splice: function splice(start, deleteCount) {
	        if (arguments.length === 0) { return []; }
	        var args = arguments;
	        this.length = max(ES.ToInteger(this.length), 0);
	        if (arguments.length > 0 && typeof deleteCount !== 'number') {
	            args = arraySlice(arguments);
	            if (args.length < 2) {
	                pushCall(args, this.length - start);
	            } else {
	                args[1] = ES.ToInteger(deleteCount);
	            }
	        }
	        return array_splice.apply(this, args);
	    }
	}, !spliceWorksWithEmptyObject);
	var spliceWorksWithLargeSparseArrays = (function () {
	    // Per https://github.com/es-shims/es5-shim/issues/295
	    // Safari 7/8 breaks with sparse arrays of size 1e5 or greater
	    var arr = new $Array(1e5);
	    // note: the index MUST be 8 or larger or the test will false pass
	    arr[8] = 'x';
	    arr.splice(1, 1);
	    // note: this test must be defined *after* the indexOf shim
	    // per https://github.com/es-shims/es5-shim/issues/313
	    return arr.indexOf('x') === 7;
	}());
	var spliceWorksWithSmallSparseArrays = (function () {
	    // Per https://github.com/es-shims/es5-shim/issues/295
	    // Opera 12.15 breaks on this, no idea why.
	    var n = 256;
	    var arr = [];
	    arr[n] = 'a';
	    arr.splice(n + 1, 0, 'b');
	    return arr[n] === 'a';
	}());
	defineProperties(ArrayPrototype, {
	    splice: function splice(start, deleteCount) {
	        var O = ES.ToObject(this);
	        var A = [];
	        var len = ES.ToUint32(O.length);
	        var relativeStart = ES.ToInteger(start);
	        var actualStart = relativeStart < 0 ? max((len + relativeStart), 0) : min(relativeStart, len);
	        var actualDeleteCount = min(max(ES.ToInteger(deleteCount), 0), len - actualStart);
	
	        var k = 0;
	        var from;
	        while (k < actualDeleteCount) {
	            from = $String(actualStart + k);
	            if (owns(O, from)) {
	                A[k] = O[from];
	            }
	            k += 1;
	        }
	
	        var items = arraySlice(arguments, 2);
	        var itemCount = items.length;
	        var to;
	        if (itemCount < actualDeleteCount) {
	            k = actualStart;
	            var maxK = len - actualDeleteCount;
	            while (k < maxK) {
	                from = $String(k + actualDeleteCount);
	                to = $String(k + itemCount);
	                if (owns(O, from)) {
	                    O[to] = O[from];
	                } else {
	                    delete O[to];
	                }
	                k += 1;
	            }
	            k = len;
	            var minK = len - actualDeleteCount + itemCount;
	            while (k > minK) {
	                delete O[k - 1];
	                k -= 1;
	            }
	        } else if (itemCount > actualDeleteCount) {
	            k = len - actualDeleteCount;
	            while (k > actualStart) {
	                from = $String(k + actualDeleteCount - 1);
	                to = $String(k + itemCount - 1);
	                if (owns(O, from)) {
	                    O[to] = O[from];
	                } else {
	                    delete O[to];
	                }
	                k -= 1;
	            }
	        }
	        k = actualStart;
	        for (var i = 0; i < items.length; ++i) {
	            O[k] = items[i];
	            k += 1;
	        }
	        O.length = len - actualDeleteCount + itemCount;
	
	        return A;
	    }
	}, !spliceWorksWithLargeSparseArrays || !spliceWorksWithSmallSparseArrays);
	
	var originalJoin = ArrayPrototype.join;
	var hasStringJoinBug;
	try {
	    hasStringJoinBug = Array.prototype.join.call('123', ',') !== '1,2,3';
	} catch (e) {
	    hasStringJoinBug = true;
	}
	if (hasStringJoinBug) {
	    defineProperties(ArrayPrototype, {
	        join: function join(separator) {
	            var sep = typeof separator === 'undefined' ? ',' : separator;
	            return originalJoin.call(isString(this) ? strSplit(this, '') : this, sep);
	        }
	    }, hasStringJoinBug);
	}
	
	var hasJoinUndefinedBug = [1, 2].join(undefined) !== '1,2';
	if (hasJoinUndefinedBug) {
	    defineProperties(ArrayPrototype, {
	        join: function join(separator) {
	            var sep = typeof separator === 'undefined' ? ',' : separator;
	            return originalJoin.call(this, sep);
	        }
	    }, hasJoinUndefinedBug);
	}
	
	var pushShim = function push(item) {
	    var O = ES.ToObject(this);
	    var n = ES.ToUint32(O.length);
	    var i = 0;
	    while (i < arguments.length) {
	        O[n + i] = arguments[i];
	        i += 1;
	    }
	    O.length = n + i;
	    return n + i;
	};
	
	var pushIsNotGeneric = (function () {
	    var obj = {};
	    var result = Array.prototype.push.call(obj, undefined);
	    return result !== 1 || obj.length !== 1 || typeof obj[0] !== 'undefined' || !owns(obj, 0);
	}());
	defineProperties(ArrayPrototype, {
	    push: function push(item) {
	        if (isArray(this)) {
	            return array_push.apply(this, arguments);
	        }
	        return pushShim.apply(this, arguments);
	    }
	}, pushIsNotGeneric);
	
	// This fixes a very weird bug in Opera 10.6 when pushing `undefined
	var pushUndefinedIsWeird = (function () {
	    var arr = [];
	    var result = arr.push(undefined);
	    return result !== 1 || arr.length !== 1 || typeof arr[0] !== 'undefined' || !owns(arr, 0);
	}());
	defineProperties(ArrayPrototype, { push: pushShim }, pushUndefinedIsWeird);
	
	// ES5 15.2.3.14
	// http://es5.github.io/#x15.4.4.10
	// Fix boxed string bug
	defineProperties(ArrayPrototype, {
	    slice: function (start, end) {
	        var arr = isString(this) ? strSplit(this, '') : this;
	        return arraySliceApply(arr, arguments);
	    }
	}, splitString);
	
	var sortIgnoresNonFunctions = (function () {
	    try {
	        [1, 2].sort(null);
	        [1, 2].sort({});
	        return true;
	    } catch (e) { /**/ }
	    return false;
	}());
	var sortThrowsOnRegex = (function () {
	    // this is a problem in Firefox 4, in which `typeof /a/ === 'function'`
	    try {
	        [1, 2].sort(/a/);
	        return false;
	    } catch (e) { /**/ }
	    return true;
	}());
	var sortIgnoresUndefined = (function () {
	    // applies in IE 8, for one.
	    try {
	        [1, 2].sort(undefined);
	        return true;
	    } catch (e) { /**/ }
	    return false;
	}());
	defineProperties(ArrayPrototype, {
	    sort: function sort(compareFn) {
	        if (typeof compareFn === 'undefined') {
	            return arraySort(this);
	        }
	        if (!isCallable(compareFn)) {
	            throw new TypeError('Array.prototype.sort callback must be a function');
	        }
	        return arraySort(this, compareFn);
	    }
	}, sortIgnoresNonFunctions || !sortIgnoresUndefined || !sortThrowsOnRegex);
	
	//
	// Object
	// ======
	//
	
	// ES5 15.2.3.14
	// http://es5.github.com/#x15.2.3.14
	
	// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
	var hasDontEnumBug = !({ 'toString': null }).propertyIsEnumerable('toString');
	var hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype');
	var hasStringEnumBug = !owns('x', '0');
	var equalsConstructorPrototype = function (o) {
	    var ctor = o.constructor;
	    return ctor && ctor.prototype === o;
	};
	var blacklistedKeys = {
	    $window: true,
	    $console: true,
	    $parent: true,
	    $self: true,
	    $frame: true,
	    $frames: true,
	    $frameElement: true,
	    $webkitIndexedDB: true,
	    $webkitStorageInfo: true,
	    $external: true
	};
	var hasAutomationEqualityBug = (function () {
	    /* globals window */
	    if (typeof window === 'undefined') { return false; }
	    for (var k in window) {
	        try {
	            if (!blacklistedKeys['$' + k] && owns(window, k) && window[k] !== null && typeof window[k] === 'object') {
	                equalsConstructorPrototype(window[k]);
	            }
	        } catch (e) {
	            return true;
	        }
	    }
	    return false;
	}());
	var equalsConstructorPrototypeIfNotBuggy = function (object) {
	    if (typeof window === 'undefined' || !hasAutomationEqualityBug) { return equalsConstructorPrototype(object); }
	    try {
	        return equalsConstructorPrototype(object);
	    } catch (e) {
	        return false;
	    }
	};
	var dontEnums = [
	    'toString',
	    'toLocaleString',
	    'valueOf',
	    'hasOwnProperty',
	    'isPrototypeOf',
	    'propertyIsEnumerable',
	    'constructor'
	];
	var dontEnumsLength = dontEnums.length;
	
	// taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js
	// can be replaced with require('is-arguments') if we ever use a build process instead
	var isStandardArguments = function isArguments(value) {
	    return toStr(value) === '[object Arguments]';
	};
	var isLegacyArguments = function isArguments(value) {
	    return value !== null &&
	        typeof value === 'object' &&
	        typeof value.length === 'number' &&
	        value.length >= 0 &&
	        !isArray(value) &&
	        isCallable(value.callee);
	};
	var isArguments = isStandardArguments(arguments) ? isStandardArguments : isLegacyArguments;
	
	defineProperties($Object, {
	    keys: function keys(object) {
	        var isFn = isCallable(object);
	        var isArgs = isArguments(object);
	        var isObject = object !== null && typeof object === 'object';
	        var isStr = isObject && isString(object);
	
	        if (!isObject && !isFn && !isArgs) {
	            throw new TypeError('Object.keys called on a non-object');
	        }
	
	        var theKeys = [];
	        var skipProto = hasProtoEnumBug && isFn;
	        if ((isStr && hasStringEnumBug) || isArgs) {
	            for (var i = 0; i < object.length; ++i) {
	                pushCall(theKeys, $String(i));
	            }
	        }
	
	        if (!isArgs) {
	            for (var name in object) {
	                if (!(skipProto && name === 'prototype') && owns(object, name)) {
	                    pushCall(theKeys, $String(name));
	                }
	            }
	        }
	
	        if (hasDontEnumBug) {
	            var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
	            for (var j = 0; j < dontEnumsLength; j++) {
	                var dontEnum = dontEnums[j];
	                if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
	                    pushCall(theKeys, dontEnum);
	                }
	            }
	        }
	        return theKeys;
	    }
	});
	
	var keysWorksWithArguments = $Object.keys && (function () {
	    // Safari 5.0 bug
	    return $Object.keys(arguments).length === 2;
	}(1, 2));
	var keysHasArgumentsLengthBug = $Object.keys && (function () {
	    var argKeys = $Object.keys(arguments);
	    return arguments.length !== 1 || argKeys.length !== 1 || argKeys[0] !== 1;
	}(1));
	var originalKeys = $Object.keys;
	defineProperties($Object, {
	    keys: function keys(object) {
	        if (isArguments(object)) {
	            return originalKeys(arraySlice(object));
	        } else {
	            return originalKeys(object);
	        }
	    }
	}, !keysWorksWithArguments || keysHasArgumentsLengthBug);
	
	//
	// Date
	// ====
	//
	
	var hasNegativeMonthYearBug = new Date(-3509827329600292).getUTCMonth() !== 0;
	var aNegativeTestDate = new Date(-1509842289600292);
	var aPositiveTestDate = new Date(1449662400000);
	var hasToUTCStringFormatBug = aNegativeTestDate.toUTCString() !== 'Mon, 01 Jan -45875 11:59:59 GMT';
	var hasToDateStringFormatBug;
	var hasToStringFormatBug;
	var timeZoneOffset = aNegativeTestDate.getTimezoneOffset();
	if (timeZoneOffset < -720) {
	    hasToDateStringFormatBug = aNegativeTestDate.toDateString() !== 'Tue Jan 02 -45875';
	    hasToStringFormatBug = !(/^Thu Dec 10 2015 \d\d:\d\d:\d\d GMT[-\+]\d\d\d\d(?: |$)/).test(aPositiveTestDate.toString());
	} else {
	    hasToDateStringFormatBug = aNegativeTestDate.toDateString() !== 'Mon Jan 01 -45875';
	    hasToStringFormatBug = !(/^Wed Dec 09 2015 \d\d:\d\d:\d\d GMT[-\+]\d\d\d\d(?: |$)/).test(aPositiveTestDate.toString());
	}
	
	var originalGetFullYear = call.bind(Date.prototype.getFullYear);
	var originalGetMonth = call.bind(Date.prototype.getMonth);
	var originalGetDate = call.bind(Date.prototype.getDate);
	var originalGetUTCFullYear = call.bind(Date.prototype.getUTCFullYear);
	var originalGetUTCMonth = call.bind(Date.prototype.getUTCMonth);
	var originalGetUTCDate = call.bind(Date.prototype.getUTCDate);
	var originalGetUTCDay = call.bind(Date.prototype.getUTCDay);
	var originalGetUTCHours = call.bind(Date.prototype.getUTCHours);
	var originalGetUTCMinutes = call.bind(Date.prototype.getUTCMinutes);
	var originalGetUTCSeconds = call.bind(Date.prototype.getUTCSeconds);
	var originalGetUTCMilliseconds = call.bind(Date.prototype.getUTCMilliseconds);
	var dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	var monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var daysInMonth = function daysInMonth(month, year) {
	    return originalGetDate(new Date(year, month, 0));
	};
	
	defineProperties(Date.prototype, {
	    getFullYear: function getFullYear() {
	        if (!this || !(this instanceof Date)) {
	            throw new TypeError('this is not a Date object.');
	        }
	        var year = originalGetFullYear(this);
	        if (year < 0 && originalGetMonth(this) > 11) {
	            return year + 1;
	        }
	        return year;
	    },
	    getMonth: function getMonth() {
	        if (!this || !(this instanceof Date)) {
	            throw new TypeError('this is not a Date object.');
	        }
	        var year = originalGetFullYear(this);
	        var month = originalGetMonth(this);
	        if (year < 0 && month > 11) {
	            return 0;
	        }
	        return month;
	    },
	    getDate: function getDate() {
	        if (!this || !(this instanceof Date)) {
	            throw new TypeError('this is not a Date object.');
	        }
	        var year = originalGetFullYear(this);
	        var month = originalGetMonth(this);
	        var date = originalGetDate(this);
	        if (year < 0 && month > 11) {
	            if (month === 12) {
	                return date;
	            }
	            var days = daysInMonth(0, year + 1);
	            return (days - date) + 1;
	        }
	        return date;
	    },
	    getUTCFullYear: function getUTCFullYear() {
	        if (!this || !(this instanceof Date)) {
	            throw new TypeError('this is not a Date object.');
	        }
	        var year = originalGetUTCFullYear(this);
	        if (year < 0 && originalGetUTCMonth(this) > 11) {
	            return year + 1;
	        }
	        return year;
	    },
	    getUTCMonth: function getUTCMonth() {
	        if (!this || !(this instanceof Date)) {
	            throw new TypeError('this is not a Date object.');
	        }
	        var year = originalGetUTCFullYear(this);
	        var month = originalGetUTCMonth(this);
	        if (year < 0 && month > 11) {
	            return 0;
	        }
	        return month;
	    },
	    getUTCDate: function getUTCDate() {
	        if (!this || !(this instanceof Date)) {
	            throw new TypeError('this is not a Date object.');
	        }
	        var year = originalGetUTCFullYear(this);
	        var month = originalGetUTCMonth(this);
	        var date = originalGetUTCDate(this);
	        if (year < 0 && month > 11) {
	            if (month === 12) {
	                return date;
	            }
	            var days = daysInMonth(0, year + 1);
	            return (days - date) + 1;
	        }
	        return date;
	    }
	}, hasNegativeMonthYearBug);
	
	defineProperties(Date.prototype, {
	    toUTCString: function toUTCString() {
	        if (!this || !(this instanceof Date)) {
	            throw new TypeError('this is not a Date object.');
	        }
	        var day = originalGetUTCDay(this);
	        var date = originalGetUTCDate(this);
	        var month = originalGetUTCMonth(this);
	        var year = originalGetUTCFullYear(this);
	        var hour = originalGetUTCHours(this);
	        var minute = originalGetUTCMinutes(this);
	        var second = originalGetUTCSeconds(this);
	        return dayName[day] + ', ' +
	            (date < 10 ? '0' + date : date) + ' ' +
	            monthName[month] + ' ' +
	            year + ' ' +
	            (hour < 10 ? '0' + hour : hour) + ':' +
	            (minute < 10 ? '0' + minute : minute) + ':' +
	            (second < 10 ? '0' + second : second) + ' GMT';
	    }
	}, hasNegativeMonthYearBug || hasToUTCStringFormatBug);
	
	// Opera 12 has `,`
	defineProperties(Date.prototype, {
	    toDateString: function toDateString() {
	        if (!this || !(this instanceof Date)) {
	            throw new TypeError('this is not a Date object.');
	        }
	        var day = this.getDay();
	        var date = this.getDate();
	        var month = this.getMonth();
	        var year = this.getFullYear();
	        return dayName[day] + ' ' +
	            monthName[month] + ' ' +
	            (date < 10 ? '0' + date : date) + ' ' +
	            year;
	    }
	}, hasNegativeMonthYearBug || hasToDateStringFormatBug);
	
	// can't use defineProperties here because of toString enumeration issue in IE <= 8
	if (hasNegativeMonthYearBug || hasToStringFormatBug) {
	    Date.prototype.toString = function toString() {
	        if (!this || !(this instanceof Date)) {
	            throw new TypeError('this is not a Date object.');
	        }
	        var day = this.getDay();
	        var date = this.getDate();
	        var month = this.getMonth();
	        var year = this.getFullYear();
	        var hour = this.getHours();
	        var minute = this.getMinutes();
	        var second = this.getSeconds();
	        var timezoneOffset = this.getTimezoneOffset();
	        var hoursOffset = Math.floor(Math.abs(timezoneOffset) / 60);
	        var minutesOffset = Math.floor(Math.abs(timezoneOffset) % 60);
	        return dayName[day] + ' ' +
	            monthName[month] + ' ' +
	            (date < 10 ? '0' + date : date) + ' ' +
	            year + ' ' +
	            (hour < 10 ? '0' + hour : hour) + ':' +
	            (minute < 10 ? '0' + minute : minute) + ':' +
	            (second < 10 ? '0' + second : second) + ' GMT' +
	            (timezoneOffset > 0 ? '-' : '+') +
	            (hoursOffset < 10 ? '0' + hoursOffset : hoursOffset) +
	            (minutesOffset < 10 ? '0' + minutesOffset : minutesOffset);
	    };
	    if (supportsDescriptors) {
	        $Object.defineProperty(Date.prototype, 'toString', {
	            configurable: true,
	            enumerable: false,
	            writable: true
	        });
	    }
	}
	
	// ES5 15.9.5.43
	// http://es5.github.com/#x15.9.5.43
	// This function returns a String value represent the instance in time
	// represented by this Date object. The format of the String is the Date Time
	// string format defined in 15.9.1.15. All fields are present in the String.
	// The time zone is always UTC, denoted by the suffix Z. If the time value of
	// this object is not a finite Number a RangeError exception is thrown.
	var negativeDate = -62198755200000;
	var negativeYearString = '-000001';
	var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1;
	var hasSafari51DateBug = Date.prototype.toISOString && new Date(-1).toISOString() !== '1969-12-31T23:59:59.999Z';
	
	var getTime = call.bind(Date.prototype.getTime);
	
	defineProperties(Date.prototype, {
	    toISOString: function toISOString() {
	        if (!isFinite(this) || !isFinite(getTime(this))) {
	            // Adope Photoshop requires the second check.
	            throw new RangeError('Date.prototype.toISOString called on non-finite value.');
	        }
	
	        var year = originalGetUTCFullYear(this);
	
	        var month = originalGetUTCMonth(this);
	        // see https://github.com/es-shims/es5-shim/issues/111
	        year += Math.floor(month / 12);
	        month = (month % 12 + 12) % 12;
	
	        // the date time string format is specified in 15.9.1.15.
	        var result = [month + 1, originalGetUTCDate(this), originalGetUTCHours(this), originalGetUTCMinutes(this), originalGetUTCSeconds(this)];
	        year = (
	            (year < 0 ? '-' : (year > 9999 ? '+' : '')) +
	            strSlice('00000' + Math.abs(year), (0 <= year && year <= 9999) ? -4 : -6)
	        );
	
	        for (var i = 0; i < result.length; ++i) {
	          // pad months, days, hours, minutes, and seconds to have two digits.
	          result[i] = strSlice('00' + result[i], -2);
	        }
	        // pad milliseconds to have three digits.
	        return (
	            year + '-' + arraySlice(result, 0, 2).join('-') +
	            'T' + arraySlice(result, 2).join(':') + '.' +
	            strSlice('000' + originalGetUTCMilliseconds(this), -3) + 'Z'
	        );
	    }
	}, hasNegativeDateBug || hasSafari51DateBug);
	
	// ES5 15.9.5.44
	// http://es5.github.com/#x15.9.5.44
	// This function provides a String representation of a Date object for use by
	// JSON.stringify (15.12.3).
	var dateToJSONIsSupported = (function () {
	    try {
	        return Date.prototype.toJSON &&
	            new Date(NaN).toJSON() === null &&
	            new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
	            Date.prototype.toJSON.call({ // generic
	                toISOString: function () { return true; }
	            });
	    } catch (e) {
	        return false;
	    }
	}());
	if (!dateToJSONIsSupported) {
	    Date.prototype.toJSON = function toJSON(key) {
	        // When the toJSON method is called with argument key, the following
	        // steps are taken:
	
	        // 1.  Let O be the result of calling ToObject, giving it the this
	        // value as its argument.
	        // 2. Let tv be ES.ToPrimitive(O, hint Number).
	        var O = $Object(this);
	        var tv = ES.ToPrimitive(O);
	        // 3. If tv is a Number and is not finite, return null.
	        if (typeof tv === 'number' && !isFinite(tv)) {
	            return null;
	        }
	        // 4. Let toISO be the result of calling the [[Get]] internal method of
	        // O with argument "toISOString".
	        var toISO = O.toISOString;
	        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
	        if (!isCallable(toISO)) {
	            throw new TypeError('toISOString property is not callable');
	        }
	        // 6. Return the result of calling the [[Call]] internal method of
	        //  toISO with O as the this value and an empty argument list.
	        return toISO.call(O);
	
	        // NOTE 1 The argument is ignored.
	
	        // NOTE 2 The toJSON function is intentionally generic; it does not
	        // require that its this value be a Date object. Therefore, it can be
	        // transferred to other kinds of objects for use as a method. However,
	        // it does require that any such object have a toISOString method. An
	        // object is free to use the argument key to filter its
	        // stringification.
	    };
	}
	
	// ES5 15.9.4.2
	// http://es5.github.com/#x15.9.4.2
	// based on work shared by Daniel Friesen (dantman)
	// http://gist.github.com/303249
	var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;
	var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z')) || !isNaN(Date.parse('2012-12-31T23:59:60.000Z'));
	var doesNotParseY2KNewYear = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));
	if (doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {
	    // XXX global assignment won't work in embeddings that use
	    // an alternate object for the context.
	    /* global Date: true */
	    /* eslint-disable no-undef */
	    var maxSafeUnsigned32Bit = Math.pow(2, 31) - 1;
	    var hasSafariSignedIntBug = isActualNaN(new Date(1970, 0, 1, 0, 0, 0, maxSafeUnsigned32Bit + 1).getTime());
	    /* eslint-disable no-implicit-globals */
	    Date = (function (NativeDate) {
	    /* eslint-enable no-implicit-globals */
	    /* eslint-enable no-undef */
	        // Date.length === 7
	        var DateShim = function Date(Y, M, D, h, m, s, ms) {
	            var length = arguments.length;
	            var date;
	            if (this instanceof NativeDate) {
	                var seconds = s;
	                var millis = ms;
	                if (hasSafariSignedIntBug && length >= 7 && ms > maxSafeUnsigned32Bit) {
	                    // work around a Safari 8/9 bug where it treats the seconds as signed
	                    var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;
	                    var sToShift = Math.floor(msToShift / 1e3);
	                    seconds += sToShift;
	                    millis -= sToShift * 1e3;
	                }
	                date = length === 1 && $String(Y) === Y ? // isString(Y)
	                    // We explicitly pass it through parse:
	                    new NativeDate(DateShim.parse(Y)) :
	                    // We have to manually make calls depending on argument
	                    // length here
	                    length >= 7 ? new NativeDate(Y, M, D, h, m, seconds, millis) :
	                    length >= 6 ? new NativeDate(Y, M, D, h, m, seconds) :
	                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
	                    length >= 4 ? new NativeDate(Y, M, D, h) :
	                    length >= 3 ? new NativeDate(Y, M, D) :
	                    length >= 2 ? new NativeDate(Y, M) :
	                    length >= 1 ? new NativeDate(Y instanceof NativeDate ? +Y : Y) :
	                                  new NativeDate();
	            } else {
	                date = NativeDate.apply(this, arguments);
	            }
	            if (!isPrimitive(date)) {
	              // Prevent mixups with unfixed Date object
	              defineProperties(date, { constructor: DateShim }, true);
	            }
	            return date;
	        };
	
	        // 15.9.1.15 Date Time String Format.
	        var isoDateExpression = new RegExp('^' +
	            '(\\d{4}|[+-]\\d{6})' + // four-digit year capture or sign +
	                                      // 6-digit extended year
	            '(?:-(\\d{2})' + // optional month capture
	            '(?:-(\\d{2})' + // optional day capture
	            '(?:' + // capture hours:minutes:seconds.milliseconds
	                'T(\\d{2})' + // hours capture
	                ':(\\d{2})' + // minutes capture
	                '(?:' + // optional :seconds.milliseconds
	                    ':(\\d{2})' + // seconds capture
	                    '(?:(\\.\\d{1,}))?' + // milliseconds capture
	                ')?' +
	            '(' + // capture UTC offset component
	                'Z|' + // UTC capture
	                '(?:' + // offset specifier +/-hours:minutes
	                    '([-+])' + // sign capture
	                    '(\\d{2})' + // hours offset capture
	                    ':(\\d{2})' + // minutes offset capture
	                ')' +
	            ')?)?)?)?' +
	        '$');
	
	        var months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
	
	        var dayFromMonth = function dayFromMonth(year, month) {
	            var t = month > 1 ? 1 : 0;
	            return (
	                months[month] +
	                Math.floor((year - 1969 + t) / 4) -
	                Math.floor((year - 1901 + t) / 100) +
	                Math.floor((year - 1601 + t) / 400) +
	                365 * (year - 1970)
	            );
	        };
	
	        var toUTC = function toUTC(t) {
	            var s = 0;
	            var ms = t;
	            if (hasSafariSignedIntBug && ms > maxSafeUnsigned32Bit) {
	                // work around a Safari 8/9 bug where it treats the seconds as signed
	                var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;
	                var sToShift = Math.floor(msToShift / 1e3);
	                s += sToShift;
	                ms -= sToShift * 1e3;
	            }
	            return $Number(new NativeDate(1970, 0, 1, 0, 0, s, ms));
	        };
	
	        // Copy any custom methods a 3rd party library may have added
	        for (var key in NativeDate) {
	            if (owns(NativeDate, key)) {
	                DateShim[key] = NativeDate[key];
	            }
	        }
	
	        // Copy "native" methods explicitly; they may be non-enumerable
	        defineProperties(DateShim, {
	            now: NativeDate.now,
	            UTC: NativeDate.UTC
	        }, true);
	        DateShim.prototype = NativeDate.prototype;
	        defineProperties(DateShim.prototype, {
	            constructor: DateShim
	        }, true);
	
	        // Upgrade Date.parse to handle simplified ISO 8601 strings
	        var parseShim = function parse(string) {
	            var match = isoDateExpression.exec(string);
	            if (match) {
	                // parse months, days, hours, minutes, seconds, and milliseconds
	                // provide default values if necessary
	                // parse the UTC offset component
	                var year = $Number(match[1]),
	                    month = $Number(match[2] || 1) - 1,
	                    day = $Number(match[3] || 1) - 1,
	                    hour = $Number(match[4] || 0),
	                    minute = $Number(match[5] || 0),
	                    second = $Number(match[6] || 0),
	                    millisecond = Math.floor($Number(match[7] || 0) * 1000),
	                    // When time zone is missed, local offset should be used
	                    // (ES 5.1 bug)
	                    // see https://bugs.ecmascript.org/show_bug.cgi?id=112
	                    isLocalTime = Boolean(match[4] && !match[8]),
	                    signOffset = match[9] === '-' ? 1 : -1,
	                    hourOffset = $Number(match[10] || 0),
	                    minuteOffset = $Number(match[11] || 0),
	                    result;
	                var hasMinutesOrSecondsOrMilliseconds = minute > 0 || second > 0 || millisecond > 0;
	                if (
	                    hour < (hasMinutesOrSecondsOrMilliseconds ? 24 : 25) &&
	                    minute < 60 && second < 60 && millisecond < 1000 &&
	                    month > -1 && month < 12 && hourOffset < 24 &&
	                    minuteOffset < 60 && // detect invalid offsets
	                    day > -1 &&
	                    day < (dayFromMonth(year, month + 1) - dayFromMonth(year, month))
	                ) {
	                    result = (
	                        (dayFromMonth(year, month) + day) * 24 +
	                        hour +
	                        hourOffset * signOffset
	                    ) * 60;
	                    result = (
	                        (result + minute + minuteOffset * signOffset) * 60 +
	                        second
	                    ) * 1000 + millisecond;
	                    if (isLocalTime) {
	                        result = toUTC(result);
	                    }
	                    if (-8.64e15 <= result && result <= 8.64e15) {
	                        return result;
	                    }
	                }
	                return NaN;
	            }
	            return NativeDate.parse.apply(this, arguments);
	        };
	        defineProperties(DateShim, { parse: parseShim });
	
	        return DateShim;
	    }(Date));
	    /* global Date: false */
	}
	
	// ES5 15.9.4.4
	// http://es5.github.com/#x15.9.4.4
	if (!Date.now) {
	    Date.now = function now() {
	        return new Date().getTime();
	    };
	}
	
	//
	// Number
	// ======
	//
	
	// ES5.1 15.7.4.5
	// http://es5.github.com/#x15.7.4.5
	var hasToFixedBugs = NumberPrototype.toFixed && (
	  (0.00008).toFixed(3) !== '0.000' ||
	  (0.9).toFixed(0) !== '1' ||
	  (1.255).toFixed(2) !== '1.25' ||
	  (1000000000000000128).toFixed(0) !== '1000000000000000128'
	);
	
	var toFixedHelpers = {
	  base: 1e7,
	  size: 6,
	  data: [0, 0, 0, 0, 0, 0],
	  multiply: function multiply(n, c) {
	      var i = -1;
	      var c2 = c;
	      while (++i < toFixedHelpers.size) {
	          c2 += n * toFixedHelpers.data[i];
	          toFixedHelpers.data[i] = c2 % toFixedHelpers.base;
	          c2 = Math.floor(c2 / toFixedHelpers.base);
	      }
	  },
	  divide: function divide(n) {
	      var i = toFixedHelpers.size;
	      var c = 0;
	      while (--i >= 0) {
	          c += toFixedHelpers.data[i];
	          toFixedHelpers.data[i] = Math.floor(c / n);
	          c = (c % n) * toFixedHelpers.base;
	      }
	  },
	  numToString: function numToString() {
	      var i = toFixedHelpers.size;
	      var s = '';
	      while (--i >= 0) {
	          if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {
	              var t = $String(toFixedHelpers.data[i]);
	              if (s === '') {
	                  s = t;
	              } else {
	                  s += strSlice('0000000', 0, 7 - t.length) + t;
	              }
	          }
	      }
	      return s;
	  },
	  pow: function pow(x, n, acc) {
	      return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
	  },
	  log: function log(x) {
	      var n = 0;
	      var x2 = x;
	      while (x2 >= 4096) {
	          n += 12;
	          x2 /= 4096;
	      }
	      while (x2 >= 2) {
	          n += 1;
	          x2 /= 2;
	      }
	      return n;
	  }
	};
	
	var toFixedShim = function toFixed(fractionDigits) {
	    var f, x, s, m, e, z, j, k;
	
	    // Test for NaN and round fractionDigits down
	    f = $Number(fractionDigits);
	    f = isActualNaN(f) ? 0 : Math.floor(f);
	
	    if (f < 0 || f > 20) {
	        throw new RangeError('Number.toFixed called with invalid number of decimals');
	    }
	
	    x = $Number(this);
	
	    if (isActualNaN(x)) {
	        return 'NaN';
	    }
	
	    // If it is too big or small, return the string value of the number
	    if (x <= -1e21 || x >= 1e21) {
	        return $String(x);
	    }
	
	    s = '';
	
	    if (x < 0) {
	        s = '-';
	        x = -x;
	    }
	
	    m = '0';
	
	    if (x > 1e-21) {
	        // 1e-21 < x < 1e21
	        // -70 < log2(x) < 70
	        e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;
	        z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));
	        z *= 0x10000000000000; // Math.pow(2, 52);
	        e = 52 - e;
	
	        // -18 < e < 122
	        // x = z / 2 ^ e
	        if (e > 0) {
	            toFixedHelpers.multiply(0, z);
	            j = f;
	
	            while (j >= 7) {
	                toFixedHelpers.multiply(1e7, 0);
	                j -= 7;
	            }
	
	            toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);
	            j = e - 1;
	
	            while (j >= 23) {
	                toFixedHelpers.divide(1 << 23);
	                j -= 23;
	            }
	
	            toFixedHelpers.divide(1 << j);
	            toFixedHelpers.multiply(1, 1);
	            toFixedHelpers.divide(2);
	            m = toFixedHelpers.numToString();
	        } else {
	            toFixedHelpers.multiply(0, z);
	            toFixedHelpers.multiply(1 << (-e), 0);
	            m = toFixedHelpers.numToString() + strSlice('0.00000000000000000000', 2, 2 + f);
	        }
	    }
	
	    if (f > 0) {
	        k = m.length;
	
	        if (k <= f) {
	            m = s + strSlice('0.0000000000000000000', 0, f - k + 2) + m;
	        } else {
	            m = s + strSlice(m, 0, k - f) + '.' + strSlice(m, k - f);
	        }
	    } else {
	        m = s + m;
	    }
	
	    return m;
	};
	defineProperties(NumberPrototype, { toFixed: toFixedShim }, hasToFixedBugs);
	
	var hasToPrecisionUndefinedBug = (function () {
	    try {
	        return 1.0.toPrecision(undefined) === '1';
	    } catch (e) {
	        return true;
	    }
	}());
	var originalToPrecision = NumberPrototype.toPrecision;
	defineProperties(NumberPrototype, {
	    toPrecision: function toPrecision(precision) {
	        return typeof precision === 'undefined' ? originalToPrecision.call(this) : originalToPrecision.call(this, precision);
	    }
	}, hasToPrecisionUndefinedBug);
	
	//
	// String
	// ======
	//
	
	// ES5 15.5.4.14
	// http://es5.github.com/#x15.5.4.14
	
	// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
	// Many browsers do not split properly with regular expressions or they
	// do not perform the split correctly under obscure conditions.
	// See http://blog.stevenlevithan.com/archives/cross-browser-split
	// I've tested in many browsers and this seems to cover the deviant ones:
	//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
	//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
	//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
	//       [undefined, "t", undefined, "e", ...]
	//    ''.split(/.?/) should be [], not [""]
	//    '.'.split(/()()/) should be ["."], not ["", "", "."]
	
	if (
	    'ab'.split(/(?:ab)*/).length !== 2 ||
	    '.'.split(/(.?)(.?)/).length !== 4 ||
	    'tesst'.split(/(s)*/)[1] === 't' ||
	    'test'.split(/(?:)/, -1).length !== 4 ||
	    ''.split(/.?/).length ||
	    '.'.split(/()()/).length > 1
	) {
	    (function () {
	        var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined'; // NPCG: nonparticipating capturing group
	        var maxSafe32BitInt = Math.pow(2, 32) - 1;
	
	        StringPrototype.split = function (separator, limit) {
	            var string = String(this);
	            if (typeof separator === 'undefined' && limit === 0) {
	                return [];
	            }
	
	            // If `separator` is not a regex, use native split
	            if (!isRegex(separator)) {
	                return strSplit(this, separator, limit);
	            }
	
	            var output = [];
	            var flags = (separator.ignoreCase ? 'i' : '') +
	                        (separator.multiline ? 'm' : '') +
	                        (separator.unicode ? 'u' : '') + // in ES6
	                        (separator.sticky ? 'y' : ''), // Firefox 3+ and ES6
	                lastLastIndex = 0,
	                // Make `global` and avoid `lastIndex` issues by working with a copy
	                separator2, match, lastIndex, lastLength;
	            var separatorCopy = new RegExp(separator.source, flags + 'g');
	            if (!compliantExecNpcg) {
	                // Doesn't need flags gy, but they don't hurt
	                separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
	            }
	            /* Values for `limit`, per the spec:
	             * If undefined: 4294967295 // maxSafe32BitInt
	             * If 0, Infinity, or NaN: 0
	             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
	             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
	             * If other: Type-convert, then use the above rules
	             */
	            var splitLimit = typeof limit === 'undefined' ? maxSafe32BitInt : ES.ToUint32(limit);
	            match = separatorCopy.exec(string);
	            while (match) {
	                // `separatorCopy.lastIndex` is not reliable cross-browser
	                lastIndex = match.index + match[0].length;
	                if (lastIndex > lastLastIndex) {
	                    pushCall(output, strSlice(string, lastLastIndex, match.index));
	                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
	                    // nonparticipating capturing groups
	                    if (!compliantExecNpcg && match.length > 1) {
	                        /* eslint-disable no-loop-func */
	                        match[0].replace(separator2, function () {
	                            for (var i = 1; i < arguments.length - 2; i++) {
	                                if (typeof arguments[i] === 'undefined') {
	                                    match[i] = void 0;
	                                }
	                            }
	                        });
	                        /* eslint-enable no-loop-func */
	                    }
	                    if (match.length > 1 && match.index < string.length) {
	                        array_push.apply(output, arraySlice(match, 1));
	                    }
	                    lastLength = match[0].length;
	                    lastLastIndex = lastIndex;
	                    if (output.length >= splitLimit) {
	                        break;
	                    }
	                }
	                if (separatorCopy.lastIndex === match.index) {
	                    separatorCopy.lastIndex++; // Avoid an infinite loop
	                }
	                match = separatorCopy.exec(string);
	            }
	            if (lastLastIndex === string.length) {
	                if (lastLength || !separatorCopy.test('')) {
	                    pushCall(output, '');
	                }
	            } else {
	                pushCall(output, strSlice(string, lastLastIndex));
	            }
	            return output.length > splitLimit ? arraySlice(output, 0, splitLimit) : output;
	        };
	    }());
	
	// [bugfix, chrome]
	// If separator is undefined, then the result array contains just one String,
	// which is the this value (converted to a String). If limit is not undefined,
	// then the output array is truncated so that it contains no more than limit
	// elements.
	// "0".split(undefined, 0) -> []
	} else if ('0'.split(void 0, 0).length) {
	    StringPrototype.split = function split(separator, limit) {
	        if (typeof separator === 'undefined' && limit === 0) { return []; }
	        return strSplit(this, separator, limit);
	    };
	}
	
	var str_replace = StringPrototype.replace;
	var replaceReportsGroupsCorrectly = (function () {
	    var groups = [];
	    'x'.replace(/x(.)?/g, function (match, group) {
	        pushCall(groups, group);
	    });
	    return groups.length === 1 && typeof groups[0] === 'undefined';
	}());
	
	if (!replaceReportsGroupsCorrectly) {
	    StringPrototype.replace = function replace(searchValue, replaceValue) {
	        var isFn = isCallable(replaceValue);
	        var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);
	        if (!isFn || !hasCapturingGroups) {
	            return str_replace.call(this, searchValue, replaceValue);
	        } else {
	            var wrappedReplaceValue = function (match) {
	                var length = arguments.length;
	                var originalLastIndex = searchValue.lastIndex;
	                searchValue.lastIndex = 0;
	                var args = searchValue.exec(match) || [];
	                searchValue.lastIndex = originalLastIndex;
	                pushCall(args, arguments[length - 2], arguments[length - 1]);
	                return replaceValue.apply(this, args);
	            };
	            return str_replace.call(this, searchValue, wrappedReplaceValue);
	        }
	    };
	}
	
	// ECMA-262, 3rd B.2.3
	// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
	// non-normative section suggesting uniform semantics and it should be
	// normalized across all browsers
	// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
	var string_substr = StringPrototype.substr;
	var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
	defineProperties(StringPrototype, {
	    substr: function substr(start, length) {
	        var normalizedStart = start;
	        if (start < 0) {
	            normalizedStart = max(this.length + start, 0);
	        }
	        return string_substr.call(this, normalizedStart, length);
	    }
	}, hasNegativeSubstrBug);
	
	// ES5 15.5.4.20
	// whitespace from: http://es5.github.io/#x15.5.4.20
	var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
	    '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
	    '\u2029\uFEFF';
	var zeroWidth = '\u200b';
	var wsRegexChars = '[' + ws + ']';
	var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');
	var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');
	var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
	defineProperties(StringPrototype, {
	    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
	    // http://perfectionkills.com/whitespace-deviations/
	    trim: function trim() {
	        if (typeof this === 'undefined' || this === null) {
	            throw new TypeError("can't convert " + this + ' to object');
	        }
	        return $String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
	    }
	}, hasTrimWhitespaceBug);
	var trim = call.bind(String.prototype.trim);
	
	var hasLastIndexBug = StringPrototype.lastIndexOf && 'abcあい'.lastIndexOf('あい', 2) !== -1;
	defineProperties(StringPrototype, {
	    lastIndexOf: function lastIndexOf(searchString) {
	        if (typeof this === 'undefined' || this === null) {
	            throw new TypeError("can't convert " + this + ' to object');
	        }
	        var S = $String(this);
	        var searchStr = $String(searchString);
	        var numPos = arguments.length > 1 ? $Number(arguments[1]) : NaN;
	        var pos = isActualNaN(numPos) ? Infinity : ES.ToInteger(numPos);
	        var start = min(max(pos, 0), S.length);
	        var searchLen = searchStr.length;
	        var k = start + searchLen;
	        while (k > 0) {
	            k = max(0, k - searchLen);
	            var index = strIndexOf(strSlice(S, k, start + searchLen), searchStr);
	            if (index !== -1) {
	                return k + index;
	            }
	        }
	        return -1;
	    }
	}, hasLastIndexBug);
	
	var originalLastIndexOf = StringPrototype.lastIndexOf;
	defineProperties(StringPrototype, {
	    lastIndexOf: function lastIndexOf(searchString) {
	        return originalLastIndexOf.apply(this, arguments);
	    }
	}, StringPrototype.lastIndexOf.length !== 1);
	
	// ES-5 15.1.2.2
	/* eslint-disable radix */
	if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {
	/* eslint-enable radix */
	    /* global parseInt: true */
	    parseInt = (function (origParseInt) {
	        var hexRegex = /^[\-+]?0[xX]/;
	        return function parseInt(str, radix) {
	            var string = trim(str);
	            var defaultedRadix = $Number(radix) || (hexRegex.test(string) ? 16 : 10);
	            return origParseInt(string, defaultedRadix);
	        };
	    }(parseInt));
	}
	
	// https://es5.github.io/#x15.1.2.3
	if (1 / parseFloat('-0') !== -Infinity) {
	    /* global parseFloat: true */
	    parseFloat = (function (origParseFloat) {
	        return function parseFloat(string) {
	            var inputString = trim(string);
	            var result = origParseFloat(inputString);
	            return result === 0 && strSlice(inputString, 0, 1) === '-' ? -0 : result;
	        };
	    }(parseFloat));
	}
	
	if (String(new RangeError('test')) !== 'RangeError: test') {
	    var errorToStringShim = function toString() {
	        if (typeof this === 'undefined' || this === null) {
	            throw new TypeError("can't convert " + this + ' to object');
	        }
	        var name = this.name;
	        if (typeof name === 'undefined') {
	            name = 'Error';
	        } else if (typeof name !== 'string') {
	            name = $String(name);
	        }
	        var msg = this.message;
	        if (typeof msg === 'undefined') {
	            msg = '';
	        } else if (typeof msg !== 'string') {
	            msg = $String(msg);
	        }
	        if (!name) {
	            return msg;
	        }
	        if (!msg) {
	            return name;
	        }
	        return name + ': ' + msg;
	    };
	    // can't use defineProperties here because of toString enumeration issue in IE <= 8
	    Error.prototype.toString = errorToStringShim;
	}
	
	if (supportsDescriptors) {
	    var ensureNonEnumerable = function (obj, prop) {
	        if (isEnum(obj, prop)) {
	            var desc = Object.getOwnPropertyDescriptor(obj, prop);
	            if (desc.configurable) {
	              desc.enumerable = false;
	              Object.defineProperty(obj, prop, desc);
	            }
	        }
	    };
	    ensureNonEnumerable(Error.prototype, 'message');
	    if (Error.prototype.message !== '') {
	      Error.prototype.message = '';
	    }
	    ensureNonEnumerable(Error.prototype, 'name');
	}
	
	if (String(/a/mig) !== '/a/gim') {
	    var regexToString = function toString() {
	        var str = '/' + this.source + '/';
	        if (this.global) {
	            str += 'g';
	        }
	        if (this.ignoreCase) {
	            str += 'i';
	        }
	        if (this.multiline) {
	            str += 'm';
	        }
	        return str;
	    };
	    // can't use defineProperties here because of toString enumeration issue in IE <= 8
	    RegExp.prototype.toString = regexToString;
	}
	
	}));


/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var NA_VERSION = "-1";
	var NA = {
	  name: "na",
	  version: NA_VERSION
	};
	
	function typeOf(type) {
	  return function (object) {
	    return Object.prototype.toString.call(object) === "[object " + type + "]";
	  };
	}
	var isString = typeOf("String");
	var isRegExp = typeOf("RegExp");
	var isObject = typeOf("Object");
	var isFunction = typeOf("Function");
	
	function each(object, factory) {
	  for (var i = 0, l = object.length; i < l; i++) {
	    if (factory.call(object, object[i], i) === false) {
	      break;
	    }
	  }
	}
	
	// UserAgent Detector.
	// @param {String} ua, userAgent.
	// @param {Object} expression
	// @return {Object}
	//    返回 null 表示当前表达式未匹配成功。
	function detect(name, expression, ua) {
	  var expr = isFunction(expression) ? expression.call(null, ua) : expression;
	  if (!expr) {
	    return null;
	  }
	  var info = {
	    name: name,
	    version: NA_VERSION,
	    codename: ""
	  };
	  if (expr === true) {
	    return info;
	  } else if (isString(expr)) {
	    if (ua.indexOf(expr) !== -1) {
	      return info;
	    }
	  } else if (isObject(expr)) {
	    if (expr.hasOwnProperty("version")) {
	      info.version = expr.version;
	    }
	    return info;
	  } else if (isRegExp(expr)) {
	    var m = expr.exec(ua);
	    if (m) {
	      if (m.length >= 2 && m[1]) {
	        info.version = m[1].replace(/_/g, ".");
	      } else {
	        info.version = NA_VERSION;
	      }
	      return info;
	    }
	  }
	}
	
	// 初始化识别。
	function init(ua, patterns, factory, detector) {
	  var detected = NA;
	  each(patterns, function (pattern) {
	    var d = detect(pattern[0], pattern[1], ua);
	    if (d) {
	      detected = d;
	      return false;
	    }
	  });
	  factory.call(detector, detected.name, detected.version);
	}
	
	var Detector = function () {
	  function Detector(rules) {
	    _classCallCheck(this, Detector);
	
	    this._rules = rules;
	  }
	
	  // 解析 UserAgent 字符串
	  // @param {String} ua, userAgent string.
	  // @return {Object}
	
	
	  _createClass(Detector, [{
	    key: "parse",
	    value: function parse(ua) {
	      ua = (ua || "").toLowerCase();
	      var d = {};
	
	      init(ua, this._rules.device, function (name, version) {
	        var v = parseFloat(version);
	        d.device = {
	          name: name,
	          version: v,
	          fullVersion: version
	        };
	        d.device[name] = v;
	      }, d);
	
	      init(ua, this._rules.os, function (name, version) {
	        var v = parseFloat(version);
	        d.os = {
	          name: name,
	          version: v,
	          fullVersion: version
	        };
	        d.os[name] = v;
	      }, d);
	
	      var ieCore = this.IEMode(ua);
	
	      init(ua, this._rules.engine, function (name, version) {
	        var mode = version;
	        // IE 内核的浏览器，修复版本号及兼容模式。
	        if (ieCore) {
	          version = ieCore.engineVersion || ieCore.engineMode;
	          mode = ieCore.engineMode;
	        }
	        var v = parseFloat(version);
	        d.engine = {
	          name: name,
	          version: v,
	          fullVersion: version,
	          mode: parseFloat(mode),
	          fullMode: mode,
	          compatible: ieCore ? ieCore.compatible : false
	        };
	        d.engine[name] = v;
	      }, d);
	
	      init(ua, this._rules.browser, function (name, version) {
	        var mode = version;
	        // IE 内核的浏览器，修复浏览器版本及兼容模式。
	        if (ieCore) {
	          // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
	          if (name === "ie") {
	            version = ieCore.browserVersion;
	          }
	          mode = ieCore.browserMode;
	        }
	        var v = parseFloat(version);
	        d.browser = {
	          name: name,
	          version: v,
	          fullVersion: version,
	          mode: parseFloat(mode),
	          fullMode: mode,
	          compatible: ieCore ? ieCore.compatible : false
	        };
	        d.browser[name] = v;
	      }, d);
	      return d;
	    }
	
	    // 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
	    // @param {String} ua, userAgent string.
	    // @return {Object}
	
	  }, {
	    key: "IEMode",
	    value: function IEMode(ua) {
	      if (!this._rules.re_msie.test(ua)) {
	        return null;
	      }
	
	      var m = void 0;
	      var engineMode = void 0;
	      var engineVersion = void 0;
	      var browserMode = void 0;
	      var browserVersion = void 0;
	
	      // IE8 及其以上提供有 Trident 信息，
	      // 默认的兼容模式，UA 中 Trident 版本不发生变化。
	      if (ua.indexOf("trident/") !== -1) {
	        m = /\btrident\/([0-9.]+)/.exec(ua);
	        if (m && m.length >= 2) {
	          // 真实引擎版本。
	          engineVersion = m[1];
	          var v_version = m[1].split(".");
	          v_version[0] = parseInt(v_version[0], 10) + 4;
	          browserVersion = v_version.join(".");
	        }
	      }
	
	      m = this._rules.re_msie.exec(ua);
	      browserMode = m[1];
	      var v_mode = m[1].split(".");
	      if (typeof browserVersion === "undefined") {
	        browserVersion = browserMode;
	      }
	      v_mode[0] = parseInt(v_mode[0], 10) - 4;
	      engineMode = v_mode.join(".");
	      if (typeof engineVersion === "undefined") {
	        engineVersion = engineMode;
	      }
	
	      return {
	        browserVersion: browserVersion,
	        browserMode: browserMode,
	        engineVersion: engineVersion,
	        engineMode: engineMode,
	        compatible: engineVersion !== engineMode
	      };
	    }
	  }]);
	
	  return Detector;
	}();
	
	module.exports = Detector;

/***/ },
/* 8 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";
	
	var win = typeof window === "undefined" ? global : window;
	var external = win.external;
	var re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/;
	var re_blackberry_10 = /\bbb10\b.+?\bversion\/([\d.]+)/;
	var re_blackberry_6_7 = /\bblackberry\b.+\bversion\/([\d.]+)/;
	var re_blackberry_4_5 = /\bblackberry\d+\/([\d.]+)/;
	
	var NA_VERSION = "-1";
	
	// 硬件设备信息识别表达式。
	// 使用数组可以按优先级排序。
	var DEVICES = [["nokia", function (ua) {
	  // 不能将两个表达式合并，因为可能出现 "nokia; nokia 960"
	  // 这种情况下会优先识别出 nokia/-1
	  if (ua.indexOf("nokia ") !== -1) {
	    return (/\bnokia ([0-9]+)?/
	    );
	  } else {
	    return (/\bnokia([a-z0-9]+)?/
	    );
	  }
	}],
	// 三星有 Android 和 WP 设备。
	["samsung", function (ua) {
	  if (ua.indexOf("samsung") !== -1) {
	    return (/\bsamsung(?:[ \-](?:sgh|gt|sm))?-([a-z0-9]+)/
	    );
	  } else {
	    return (/\b(?:sgh|sch|gt|sm)-([a-z0-9]+)/
	    );
	  }
	}], ["wp", function (ua) {
	  return ua.indexOf("windows phone ") !== -1 || ua.indexOf("xblwp") !== -1 || ua.indexOf("zunewp") !== -1 || ua.indexOf("windows ce") !== -1;
	}], ["pc", "windows"], ["ipad", "ipad"],
	// ipod 规则应置于 iphone 之前。
	["ipod", "ipod"], ["iphone", /\biphone\b|\biph(\d)/], ["mac", "macintosh"],
	// 小米
	["mi", /\bmi[ \-]?([a-z0-9 ]+(?= build|\)))/],
	// 红米
	["hongmi", /\bhm[ \-]?([a-z0-9]+)/], ["aliyun", /\baliyunos\b(?:[\-](\d+))?/], ["meizu", function (ua) {
	  return ua.indexOf("meizu") >= 0 ? /\bmeizu[\/ ]([a-z0-9]+)\b/ : /\bm([0-9cx]{1,4})\b/;
	}], ["nexus", /\bnexus ([0-9s.]+)/], ["huawei", function (ua) {
	  var re_mediapad = /\bmediapad (.+?)(?= build\/huaweimediapad\b)/;
	  if (ua.indexOf("huawei-huawei") !== -1) {
	    return (/\bhuawei\-huawei\-([a-z0-9\-]+)/
	    );
	  } else if (re_mediapad.test(ua)) {
	    return re_mediapad;
	  } else {
	    return (/\bhuawei[ _\-]?([a-z0-9]+)/
	    );
	  }
	}], ["lenovo", function (ua) {
	  if (ua.indexOf("lenovo-lenovo") !== -1) {
	    return (/\blenovo\-lenovo[ \-]([a-z0-9]+)/
	    );
	  } else {
	    return (/\blenovo[ \-]?([a-z0-9]+)/
	    );
	  }
	}],
	// 中兴
	["zte", function (ua) {
	  if (/\bzte\-[tu]/.test(ua)) {
	    return (/\bzte-[tu][ _\-]?([a-su-z0-9\+]+)/
	    );
	  } else {
	    return (/\bzte[ _\-]?([a-su-z0-9\+]+)/
	    );
	  }
	}],
	// 步步高
	["vivo", /\bvivo(?: ([a-z0-9]+))?/], ["htc", function (ua) {
	  if (/\bhtc[a-z0-9 _\-]+(?= build\b)/.test(ua)) {
	    return (/\bhtc[ _\-]?([a-z0-9 ]+(?= build))/
	    );
	  } else {
	    return (/\bhtc[ _\-]?([a-z0-9 ]+)/
	    );
	  }
	}], ["oppo", /\boppo[_]([a-z0-9]+)/], ["konka", /\bkonka[_\-]([a-z0-9]+)/], ["sonyericsson", /\bmt([a-z0-9]+)/], ["coolpad", /\bcoolpad[_ ]?([a-z0-9]+)/], ["lg", /\blg[\-]([a-z0-9]+)/], ["android", /\bandroid\b|\badr\b/], ["blackberry", function (ua) {
	  if (ua.indexOf("blackberry") >= 0) {
	    return (/\bblackberry\s?(\d+)/
	    );
	  }
	  return "bb10";
	}]];
	
	// 操作系统信息识别表达式
	var OS = [["wp", function (ua) {
	  if (ua.indexOf("windows phone ") !== -1) {
	    return (/\bwindows phone (?:os )?([0-9.]+)/
	    );
	  } else if (ua.indexOf("xblwp") !== -1) {
	    return (/\bxblwp([0-9.]+)/
	    );
	  } else if (ua.indexOf("zunewp") !== -1) {
	    return (/\bzunewp([0-9.]+)/
	    );
	  }
	  return "windows phone";
	}], ["windows", /\bwindows nt ([0-9.]+)/], ["macosx", /\bmac os x ([0-9._]+)/], ["ios", function (ua) {
	  if (/\bcpu(?: iphone)? os /.test(ua)) {
	    return (/\bcpu(?: iphone)? os ([0-9._]+)/
	    );
	  } else if (ua.indexOf("iph os ") !== -1) {
	    return (/\biph os ([0-9_]+)/
	    );
	  } else {
	    return (/\bios\b/
	    );
	  }
	}], ["yunos", /\baliyunos ([0-9.]+)/], ["android", function (ua) {
	  if (ua.indexOf("android") >= 0) {
	    return (/\bandroid[ \/-]?([0-9.x]+)?/
	    );
	  } else if (ua.indexOf("adr") >= 0) {
	    if (ua.indexOf("mqqbrowser") >= 0) {
	      return (/\badr[ ]\(linux; u; ([0-9.]+)?/
	      );
	    } else {
	      return (/\badr(?:[ ]([0-9.]+))?/
	      );
	    }
	  }
	  return "android";
	  //return /\b(?:android|\badr)(?:[\/\- ](?:\(linux; u; )?)?([0-9.x]+)?/;
	}], ["chromeos", /\bcros i686 ([0-9.]+)/], ["linux", "linux"], ["windowsce", /\bwindows ce(?: ([0-9.]+))?/], ["symbian", /\bsymbian(?:os)?\/([0-9.]+)/], ["blackberry", function (ua) {
	  var m = ua.match(re_blackberry_10) || ua.match(re_blackberry_6_7) || ua.match(re_blackberry_4_5);
	  return m ? { version: m[1] } : "blackberry";
	}]];
	
	// 针对同源的 TheWorld 和 360 的 external 对象进行检测。
	// @param {String} key, 关键字，用于检测浏览器的安装路径中出现的关键字。
	// @return {Undefined,Boolean,Object} 返回 undefined 或 false 表示检测未命中。
	function checkTW360External(key) {
	  if (!external) {
	    return;
	  } // return undefined.
	  try {
	    //        360安装路径：
	    //        C:%5CPROGRA~1%5C360%5C360se3%5C360SE.exe
	    var runpath = external.twGetRunPath.toLowerCase();
	    // 360SE 3.x ~ 5.x support.
	    // 暴露的 external.twGetVersion 和 external.twGetSecurityID 均为 undefined。
	    // 因此只能用 try/catch 而无法使用特性判断。
	    var security = external.twGetSecurityID(win);
	    var version = external.twGetVersion(security);
	
	    if (runpath && runpath.indexOf(key) === -1) {
	      return false;
	    }
	    if (version) {
	      return { version: version };
	    }
	  } catch (ex) {/* */}
	}
	
	var ENGINE = [["edgehtml", /edge\/([0-9.]+)/], ["trident", re_msie], ["blink", function () {
	  return "chrome" in win && "CSS" in win && /\bapplewebkit[\/]?([0-9.+]+)/;
	}], ["webkit", /\bapplewebkit[\/]?([0-9.+]+)/], ["gecko", function (ua) {
	  var match = ua.match(/\brv:([\d\w.]+).*\bgecko\/(\d+)/);
	  if (match) {
	    return {
	      version: match[1] + "." + match[2]
	    };
	  }
	}], ["presto", /\bpresto\/([0-9.]+)/], ["androidwebkit", /\bandroidwebkit\/([0-9.]+)/], ["coolpadwebkit", /\bcoolpadwebkit\/([0-9.]+)/], ["u2", /\bu2\/([0-9.]+)/], ["u3", /\bu3\/([0-9.]+)/]];
	var BROWSER = [
	// Microsoft Edge Browser, Default browser in Windows 10.
	["edge", /edge\/([0-9.]+)/],
	// Sogou.
	["sogou", function (ua) {
	  if (ua.indexOf("sogoumobilebrowser") >= 0) {
	    return (/sogoumobilebrowser\/([0-9.]+)/
	    );
	  } else if (ua.indexOf("sogoumse") >= 0) {
	    return true;
	  }
	  return (/ se ([0-9.x]+)/
	  );
	}],
	// TheWorld (世界之窗)
	// 由于裙带关系，TheWorld API 与 360 高度重合。
	// 只能通过 UA 和程序安装路径中的应用程序名来区分。
	// TheWorld 的 UA 比 360 更靠谱，所有将 TheWorld 的规则放置到 360 之前。
	["theworld", function () {
	  var x = checkTW360External("theworld");
	  if (typeof x !== "undefined") {
	    return x;
	  }
	  return (/theworld(?: ([\d.])+)?/
	  );
	}],
	// 360SE, 360EE.
	["360", function (ua) {
	  var x = checkTW360External("360se");
	  if (typeof x !== "undefined") {
	    return x;
	  }
	  if (ua.indexOf("360 aphone browser") !== -1) {
	    return (/\b360 aphone browser \(([^\)]+)\)/
	    );
	  }
	  return (/\b360(?:se|ee|chrome|browser)\b/
	  );
	}],
	// Maxthon
	["maxthon", function () {
	  try {
	    if (external && (external.mxVersion || external.max_version)) {
	      return {
	        version: external.mxVersion || external.max_version
	      };
	    }
	  } catch (ex) {/* */}
	  return (/\b(?:maxthon|mxbrowser)(?:[ \/]([0-9.]+))?/
	  );
	}], ["micromessenger", /\bmicromessenger\/([\d.]+)/], ["qq", /\bm?qqbrowser\/([0-9.]+)/], ["green", "greenbrowser"], ["tt", /\btencenttraveler ([0-9.]+)/], ["liebao", function (ua) {
	  if (ua.indexOf("liebaofast") >= 0) {
	    return (/\bliebaofast\/([0-9.]+)/
	    );
	  }
	  if (ua.indexOf("lbbrowser") === -1) {
	    return false;
	  }
	  var version = void 0;
	  try {
	    if (external && external.LiebaoGetVersion) {
	      version = external.LiebaoGetVersion();
	    }
	  } catch (ex) {/* */}
	  return {
	    version: version || NA_VERSION
	  };
	}], ["tao", /\btaobrowser\/([0-9.]+)/], ["coolnovo", /\bcoolnovo\/([0-9.]+)/], ["saayaa", "saayaa"],
	// 有基于 Chromniun 的急速模式和基于 IE 的兼容模式。必须在 IE 的规则之前。
	["baidu", /\b(?:ba?idubrowser|baiduhd)[ \/]([0-9.x]+)/],
	// 后面会做修复版本号，这里只要能识别是 IE 即可。
	["ie", re_msie], ["mi", /\bmiuibrowser\/([0-9.]+)/],
	// Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
	["opera", function (ua) {
	  var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
	  var re_opera_new = /\bopr\/([0-9.]+)/;
	  return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
	}], ["oupeng", /\boupeng\/([0-9.]+)/], ["yandex", /yabrowser\/([0-9.]+)/],
	// 支付宝手机客户端
	["ali-ap", function (ua) {
	  if (ua.indexOf("aliapp") > 0) {
	    return (/\baliapp\(ap\/([0-9.]+)\)/
	    );
	  } else {
	    return (/\balipayclient\/([0-9.]+)\b/
	    );
	  }
	}],
	// 支付宝平板客户端
	["ali-ap-pd", /\baliapp\(ap-pd\/([0-9.]+)\)/],
	// 支付宝商户客户端
	["ali-am", /\baliapp\(am\/([0-9.]+)\)/],
	// 淘宝手机客户端
	["ali-tb", /\baliapp\(tb\/([0-9.]+)\)/],
	// 淘宝平板客户端
	["ali-tb-pd", /\baliapp\(tb-pd\/([0-9.]+)\)/],
	// 天猫手机客户端
	["ali-tm", /\baliapp\(tm\/([0-9.]+)\)/],
	// 天猫平板客户端
	["ali-tm-pd", /\baliapp\(tm-pd\/([0-9.]+)\)/],
	// UC 浏览器，可能会被识别为 Android 浏览器，规则需要前置。
	// UC 桌面版浏览器携带 Chrome 信息，需要放在 Chrome 之前。
	["uc", function (ua) {
	  if (ua.indexOf("ucbrowser/") >= 0) {
	    return (/\bucbrowser\/([0-9.]+)/
	    );
	  } else if (ua.indexOf("ubrowser/") >= 0) {
	    return (/\bubrowser\/([0-9.]+)/
	    );
	  } else if (/\buc\/[0-9]/.test(ua)) {
	    return (/\buc\/([0-9.]+)/
	    );
	  } else if (ua.indexOf("ucweb") >= 0) {
	    // `ucweb/2.0` is compony info.
	    // `UCWEB8.7.2.214/145/800` is browser info.
	    return (/\bucweb([0-9.]+)?/
	    );
	  } else {
	    return (/\b(?:ucbrowser|uc)\b/
	    );
	  }
	}], ["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/],
	// Android 默认浏览器。该规则需要在 safari 之前。
	["android", function (ua) {
	  if (ua.indexOf("android") === -1) {
	    return;
	  }
	  return (/\bversion\/([0-9.]+(?: beta)?)/
	  );
	}], ["blackberry", function (ua) {
	  var m = ua.match(re_blackberry_10) || ua.match(re_blackberry_6_7) || ua.match(re_blackberry_4_5);
	  return m ? { version: m[1] } : "blackberry";
	}], ["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
	// 如果不能被识别为 Safari，则猜测是 WebView。
	["webview", /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/], ["firefox", /\bfirefox\/([0-9.ab]+)/], ["nokia", /\bnokiabrowser\/([0-9.]+)/]];
	
	module.exports = {
	  device: DEVICES,
	  os: OS,
	  browser: BROWSER,
	  engine: ENGINE,
	  re_msie: re_msie
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ]);
//# sourceMappingURL=Timeline.js.map