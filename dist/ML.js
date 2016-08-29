var ML =
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
	
	var _MLConfig = __webpack_require__(2);
	
	var _MLConfig2 = _interopRequireDefault(_MLConfig);
	
	__webpack_require__(4);
	
	__webpack_require__(5);
	
	__webpack_require__(6);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _MLConfig2.default;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	__webpack_require__(3);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var SERVER_URL_CN = 'https://api.maxleap.cn/';
	var SERVER_URL_EN = 'https://api.maxleap.com/';
	
	/** ML 静态对象 */
	
	var ML = function () {
	    function ML() {
	        _classCallCheck(this, ML);
	    }
	
	    _createClass(ML, null, [{
	        key: 'initialize',
	
	        /**
	         * 初始化 ML
	         * @param {string} appId - 应用 Id
	         * @param {string} restAPIKey - 应用 REST API Key
	         * @param {string} serverURL - API 服务器地址, 默认为中国区
	         * @static
	         */
	        value: function initialize(appId, restAPIKey, serverURL) {
	            ML.appId = appId;
	            ML.restApiKey = restAPIKey;
	            ML.serverURL = serverURL || SERVER_URL_CN;
	        }
	
	        /**
	         * 使用中国区服务器
	         */
	
	    }, {
	        key: 'useCNServer',
	        value: function useCNServer() {
	            ML.serverURL = SERVER_URL_CN;
	        }
	
	        /**
	         * 使用美国区服务器
	         */
	
	    }, {
	        key: 'useENServer',
	        value: function useENServer() {
	            ML.serverURL = SERVER_URL_EN;
	        }
	    }]);
	
	    return ML;
	}();
	
	exports.default = ML;
	module.exports = exports['default'];

/***/ },
/* 3 */
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	__webpack_require__(3);
	
	var _MLConfig = __webpack_require__(2);
	
	var _MLConfig2 = _interopRequireDefault(_MLConfig);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/** MLObject */
	var MLObject = function () {
	    /**
	     * 根据 props 初始化 MLObject
	     * @param {object} props
	     */
	    function MLObject(props) {
	        var _this = this;
	
	        _classCallCheck(this, MLObject);
	
	        this._buildResult = function (res) {
	            //仅当 this.id 不存在时,才会从 res.objectId 赋值, 因为在 update 时, 后台不返回 objectId
	            if (!_this.id) {
	                _this.id = res.objectId;
	            }
	            return _this;
	        };
	
	        this._cleanAttrs = function (object) {
	            var attrs = ['objectId', 'createdAt', 'updatedAt'];
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;
	
	            try {
	                for (var _iterator = object[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var attr = _step.value;
	
	                    delete object[attr];
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }
	        };
	
	        this.attributes = props || {};
	        this._opAddQueue = [];
	    }
	
	    /**
	     * 创建 MLObject 子类
	     * @param {string} className - 子类名
	     * @param {object} protoProps - 实例属性
	     * @param {object} staticProps - 静态属性
	     * @returns {MLObject} {Child} - MLObject 子类
	     */
	
	
	    _createClass(MLObject, [{
	        key: 'set',
	        value: function set(key, value) {
	            if (value.toJSON) {
	                this.attributes[key] = value.toJSON();
	            }
	            this.attributes[key] = value;
	        }
	    }, {
	        key: 'get',
	        value: function get(key) {
	            return this.attributes[key];
	        }
	
	        /**
	         * 存储对象
	         * @param attrs
	         */
	
	    }, {
	        key: 'save',
	        value: function save(attrs) {
	            for (var key in attrs) {
	                this.set(key, attrs[key]);
	            }
	            if (this.id) {
	                return this._update();
	            } else {
	                return this._create();
	            }
	        }
	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            return fetch(_MLConfig2.default.serverURL + '2.0/classes/' + this._className + '/' + this.id, {
	                method: 'DELETE',
	                headers: {
	                    'Content-Type': 'application/json',
	                    'X-ML-AppId': _MLConfig2.default.appId,
	                    'X-ML-APIKey': _MLConfig2.default.restApiKey
	                },
	                body: JSON.stringify(this.attributes)
	            }).then(function (res) {
	                return res.json();
	            });
	        }
	    }, {
	        key: 'add',
	        value: function add(key, value) {
	            this._opAddQueue.push({
	                operation: {
	                    body: value.attributes,
	                    method: 'POST',
	                    path: '/2.0/classes/' + value._className
	                },
	                object: value,
	                key: key
	            });
	        }
	    }, {
	        key: 'fetch',
	        value: function (_fetch) {
	            function fetch() {
	                return _fetch.apply(this, arguments);
	            }
	
	            fetch.toString = function () {
	                return _fetch.toString();
	            };
	
	            return fetch;
	        }(function () {
	            return fetch(_MLConfig2.default.serverURL + '2.0/classes/' + this._className + '/' + this.id, {
	                method: 'GET',
	                headers: {
	                    'Content-Type': 'application/json',
	                    'X-ML-AppId': _MLConfig2.default.appId,
	                    'X-ML-APIKey': _MLConfig2.default.restApiKey
	                }
	            }).then(function (res) {
	                return res.json();
	            }).then(this._buildResult);
	        })
	    }, {
	        key: '_create',
	        value: function _create() {
	            var _this2 = this;
	
	            var saveAttrs = function saveAttrs() {
	                return fetch(_MLConfig2.default.serverURL + '2.0/classes/' + _this2._className, {
	                    method: 'POST',
	                    headers: {
	                        'Content-Type': 'application/json',
	                        'X-ML-AppId': _MLConfig2.default.appId,
	                        'X-ML-APIKey': _MLConfig2.default.restApiKey
	                    },
	                    body: JSON.stringify(_this2.attributes)
	                }).then(function (res) {
	                    return res.json();
	                }).then(function (res) {
	                    _this2._opAddQueue.forEach(function (item) {
	                        _this2.attributes[item.key] = [];
	                    });
	
	                    _this2._opAddQueue.forEach(function (item) {
	                        _this2.attributes[item.key].push(item.object);
	                    });
	                    return res;
	                }).then(_this2._buildResult);
	            };
	
	            if (this._opAddQueue.length) {
	                return this._deepSave().then(saveAttrs);
	            } else {
	                return saveAttrs();
	            }
	        }
	    }, {
	        key: '_update',
	        value: function _update() {
	            var _this3 = this;
	
	            var saveAttrs = function saveAttrs() {
	                return fetch(_MLConfig2.default.serverURL + '2.0/classes/' + _this3._className + '/' + _this3.id, {
	                    method: 'PUT',
	                    headers: {
	                        'Content-Type': 'application/json',
	                        'X-ML-AppId': _MLConfig2.default.appId,
	                        'X-ML-APIKey': _MLConfig2.default.restApiKey
	                    },
	                    body: JSON.stringify(_this3.attributes)
	                }).then(function (res) {
	                    return res.json();
	                }).then(function (res) {
	                    _this3._opAddQueue.forEach(function (item) {
	                        _this3.attributes[item.key] = item.object;
	                    });
	                    return res;
	                }).then(_this3._buildResult);
	            };
	
	            if (this._opAddQueue.length) {
	                return this._deepSave().then(saveAttrs);
	            } else {
	                return saveAttrs();
	            }
	        }
	    }, {
	        key: '_deepSave',
	        value: function _deepSave() {
	            var _this4 = this;
	
	            var requestParams = {
	                requests: this._opAddQueue.map(function (item) {
	                    return item.operation;
	                })
	            };
	
	            return fetch(_MLConfig2.default.serverURL + '2.0/batch', {
	                method: 'POST',
	                headers: {
	                    'Content-Type': 'application/json',
	                    'X-ML-AppId': _MLConfig2.default.appId,
	                    'X-ML-APIKey': _MLConfig2.default.restApiKey
	                },
	                body: JSON.stringify(requestParams)
	            }).then(function (res) {
	                return res.json();
	            }).then(function (res) {
	                res.forEach(function (item, i) {
	                    _this4._opAddQueue[i].object.id = item.objectId;
	                    if (!_this4.attributes[_this4._opAddQueue[i].key]) {
	                        _this4.attributes[_this4._opAddQueue[i].key] = [];
	                    }
	                    _this4.attributes[_this4._opAddQueue[i].key].push({
	                        __type: 'Pointer',
	                        className: _this4._opAddQueue[i].object._className,
	                        objectId: _this4._opAddQueue[i].object.id
	                    });
	                });
	            });
	        }
	    }], [{
	        key: 'extend',
	        value: function extend(className, protoProps, staticProps) {
	            //User 是 ML 保留字段
	            if (className === 'User') {
	                className = '_User';
	            }
	
	            var Child = function (_MLObject) {
	                _inherits(Child, _MLObject);
	
	                function Child(props) {
	                    _classCallCheck(this, Child);
	
	                    return _possibleConstructorReturn(this, Object.getPrototypeOf(Child).call(this, props));
	                }
	
	                return Child;
	            }(MLObject);
	
	            Child.prototype._className = className;
	
	            return Child;
	        }
	    }, {
	        key: 'destroyAll',
	        value: function destroyAll(values) {
	            var batchDeleteParams = values.map(function (item) {
	                return {
	                    method: 'delete',
	                    path: 'classes/' + item._className + '/' + item.id
	                };
	            });
	            return fetch(_MLConfig2.default.serverURL + '2.0/batch', {
	                method: 'POST',
	                headers: {
	                    'Content-Type': 'application/json',
	                    'X-ML-AppId': _MLConfig2.default.appId,
	                    'X-ML-APIKey': _MLConfig2.default.restApiKey
	                },
	                body: JSON.stringify({ requests: batchDeleteParams })
	            }).then(function (res) {
	                return res.json();
	            });
	        }
	    }]);
	
	    return MLObject;
	}();
	
	_MLConfig2.default.Object = MLObject;
	
	exports.default = _MLConfig2.default;
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	__webpack_require__(3);
	
	var _MLConfig = __webpack_require__(2);
	
	var _MLConfig2 = _interopRequireDefault(_MLConfig);
	
	var _MLObject = __webpack_require__(4);
	
	var _MLObject2 = _interopRequireDefault(_MLObject);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/** ML 查询 */
	var MLQuery = function () {
	    /**
	     * 初始化 ML.Query
	     * @param {ML.Object} objectClass - ML.Object 子类
	     */
	    function MLQuery(objectClass) {
	        var _this = this;
	
	        _classCallCheck(this, MLQuery);
	
	        this._request = function (params) {
	            return fetch(_MLConfig2.default.serverURL + '2.0/classes/' + _this._className + '/query', {
	                method: 'POST',
	                headers: {
	                    'Content-Type': 'application/json',
	                    'X-ML-AppId': _MLConfig2.default.appId,
	                    'X-ML-APIKey': _MLConfig2.default.restApiKey
	                },
	                body: JSON.stringify(params)
	            }).then(function (res) {
	                return res.json();
	            });
	        };
	
	        this._buildResult = function (res) {
	            return res.results.map(function (item) {
	                var obj = new _this._objectClass(item);
	                obj.id = obj.attributes.objectId;
	                _this._cleanAttrs(obj);
	                return obj;
	            });
	        };
	
	        this._cleanAttrs = function (object) {
	            var attrs = ['createdAt', 'updatedAt'];
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;
	
	            try {
	                for (var _iterator = attrs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var attr = _step.value;
	
	                    delete object.attributes[attr];
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }
	        };
	
	        this._objectClass = objectClass;
	        this._className = objectClass.prototype._className;
	        this._params = {
	            where: {}
	        };
	    }
	
	    /**
	     * 根据 id 查询记录
	     * @param {string} id - objectId
	     * @returns {Promise}
	     */
	
	
	    _createClass(MLQuery, [{
	        key: 'get',
	        value: function get(id) {
	            this._params.where['objectId'] = id;
	            return this.first();
	        }
	
	        /**
	         * 返回符合条件的第一条记录
	         * @returns {Promise}
	         */
	
	    }, {
	        key: 'first',
	        value: function first() {
	            this._params.limit = 1;
	            var params = this._createParams();
	
	            return this._request(params).then(this._buildResult).then(function (res) {
	                return res[0];
	            });
	        }
	
	        /**
	         * 返回符合条件的所有记录
	         * @returns {Promise}
	         */
	
	    }, {
	        key: 'find',
	        value: function find() {
	            var params = this._createParams();
	            return this._request(params).then(this._buildResult);
	        }
	
	        /**
	         * 返回符合条件的记录数
	         * @returns {Promise}
	         */
	
	    }, {
	        key: 'count',
	        value: function count() {
	            var params = this._createParams();
	
	            //仅当 limit 为 0 时, 服务器才不会返回实体数据
	            params.limit = 0;
	            //设置 count 为 1, 让服务器返回 count
	            params.count = 1;
	
	            return this._request(params).then(function (res) {
	                return res.count;
	            });
	        }
	
	        /**
	         * 设置最大返回记录数
	         * @param {number} n - 最大返回记录数
	         * @returns {ML.Query}
	         */
	
	    }, {
	        key: 'limit',
	        value: function limit(n) {
	            this._params.limit = n;
	            return this;
	        }
	
	        /**
	         * 设置跳过的记录数
	         * @param {number} n - 跳过记录的条数
	         * @returns {ML.Query}
	         */
	
	    }, {
	        key: 'skip',
	        value: function skip(n) {
	            this._params.skip = n;
	            return this;
	        }
	
	        /**
	         * 设置排序为正序
	         * @param {string} key - 正序
	         * @returns {ML.Query}
	         */
	
	    }, {
	        key: 'ascending',
	        value: function ascending(key) {
	            this._params.order = key;
	            return this;
	        }
	
	        /**
	         * 设置排序为逆序
	         * @param {string} key - 逆序
	         * @returns {ML.Query}
	         */
	
	    }, {
	        key: 'descending',
	        value: function descending(key) {
	            this._params.order = '-' + key;
	            return this;
	        }
	
	        /**
	         * 存在 key 的记录
	         * @param {string} key
	         * @returns {ML.Query}
	         */
	
	    }, {
	        key: 'exists',
	        value: function exists(key) {
	            if (key === 'objectId') {
	                console.warn('objectId 一定会存在, 不能作为 exists 条件');
	            }
	            this._params.where[key] = { $exists: true };
	            return this;
	        }
	
	        /**
	         * 不存在 key 的记录
	         * @param {string} key
	         * @returns {ML.Query}
	         */
	
	    }, {
	        key: 'doesNotExist',
	        value: function doesNotExist(key) {
	            if (key === 'objectId') {
	                console.warn('objectId 一定会存在, 不能作为 exists 条件');
	            }
	            this._params.where[key] = { $exists: false };
	            return this;
	        }
	
	        /**
	         * key 等于 value 的记录
	         * @param {string} key
	         * @param {string} value
	         * @returns {ML.Query}
	         */
	
	    }, {
	        key: 'equalTo',
	        value: function equalTo(key, value) {
	            if (value instanceof _MLConfig2.default.Object) {
	                value = {
	                    __type: 'Pointer',
	                    className: value._className,
	                    objectId: value.id
	                };
	            }
	
	            this._params.where[key] = value;
	            return this;
	        }
	
	        /**
	         * key 不等于 value 的记录
	         * @param {string} key
	         * @param {string} value
	         * @returns {ML.Query}
	         */
	
	    }, {
	        key: 'notEqualTo',
	        value: function notEqualTo(key, value) {
	            this._params.where[key] = { $ne: value };
	            return this;
	        }
	    }, {
	        key: 'greaterThan',
	        value: function greaterThan(key, value) {
	            this._params.where[key] = { $gt: value };
	            return this;
	        }
	    }, {
	        key: 'lessThan',
	        value: function lessThan(key, value) {
	            this._params.where[key] = { $lt: value };
	            return this;
	        }
	    }, {
	        key: 'greaterThanOrEqualTo',
	        value: function greaterThanOrEqualTo(key, value) {
	            this._params.where[key] = { $gte: value };
	            return this;
	        }
	    }, {
	        key: 'lessThanOrEqualTo',
	        value: function lessThanOrEqualTo(key, value) {
	            this._params.where[key] = { $lte: value };
	            return this;
	        }
	    }, {
	        key: 'containedIn',
	        value: function containedIn(key, values) {
	            this._params.where[key] = { $in: values };
	            return this;
	        }
	    }, {
	        key: 'notContainedIn',
	        value: function notContainedIn(key, values) {
	            this._params.where[key] = { $nin: values };
	            return this;
	        }
	    }, {
	        key: 'containsAll',
	        value: function containsAll(key, values) {
	            this._params.where[key] = { $all: values };
	            return this;
	        }
	    }, {
	        key: 'startsWith',
	        value: function startsWith(key, value) {
	            this._params.where[key] = { $regex: '^' + this._quote(value) };
	            return this;
	        }
	    }, {
	        key: 'endsWith',
	        value: function endsWith(key, value) {
	            this._params.where[key] = { $regex: this._quote(value) + '$' };
	            return this;
	        }
	    }, {
	        key: 'select',
	        value: function select() {
	            for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
	                keys[_key] = arguments[_key];
	            }
	
	            this._params.keys = keys.join(',');
	            return this;
	        }
	    }, {
	        key: 'matchesQuery',
	        value: function matchesQuery(key, query) {
	            var innerQueryParams = query._params;
	            innerQueryParams.className = query._className;
	            this._params.where[key] = { $inQuery: innerQueryParams };
	            return this;
	        }
	    }, {
	        key: 'doesNotMatchQuery',
	        value: function doesNotMatchQuery(key, query) {
	            var innerQueryParams = query._params;
	            innerQueryParams.className = query._className;
	            this._params.where[key] = { $notInQuery: innerQueryParams };
	            return this;
	        }
	    }, {
	        key: 'near',
	        value: function near(key, point) {
	            this._params.where[key] = { $nearSphere: point };
	            return this;
	        }
	    }, {
	        key: 'withinRadians',
	        value: function withinRadians(key, point, distance) {
	            this.near(key, point);
	            this._params.where[key] = { $maxDistance: distance };
	            return this;
	        }
	    }, {
	        key: 'withinMiles',
	        value: function withinMiles(key, point, distance) {
	            return this.withinRadians(key, point, distance / 3958.8);
	        }
	    }, {
	        key: 'withinKilometers',
	        value: function withinKilometers(key, point, distance) {
	            return this.withinRadians(key, point, distance / 6371.0);
	        }
	    }, {
	        key: 'withinGeoBox',
	        value: function withinGeoBox(key, southwest, northeast) {
	            this._params.where[key] = { $within: { '$box': [southwest, northeast] } };
	            return this;
	        }
	    }, {
	        key: '_quote',
	        value: function _quote(s) {
	            return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
	        }
	    }, {
	        key: '_createParams',
	        value: function _createParams() {
	            return this._params;
	        }
	    }]);
	
	    return MLQuery;
	}();
	
	_MLConfig2.default.Query = MLQuery;
	
	exports.default = _MLConfig2.default;
	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	__webpack_require__(3);
	
	var _MLConfig = __webpack_require__(2);
	
	var _MLConfig2 = _interopRequireDefault(_MLConfig);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/** ML 地理位置 */
	var MLGeoPoint = function () {
	    function MLGeoPoint(arg1, arg2) {
	        _classCallCheck(this, MLGeoPoint);
	
	        this.latitude = arg1;
	        this.longitude = arg2;
	    }
	
	    _createClass(MLGeoPoint, [{
	        key: 'radiansTo',
	        value: function radiansTo(point) {
	            var d2r = Math.PI / 180.0;
	            var lat1rad = this.latitude * d2r;
	            var long1rad = this.longitude * d2r;
	            var lat2rad = point.latitude * d2r;
	            var long2rad = point.longitude * d2r;
	            var deltaLat = lat1rad - lat2rad;
	            var deltaLong = long1rad - long2rad;
	            var sinDeltaLatDiv2 = Math.sin(deltaLat / 2);
	            var sinDeltaLongDiv2 = Math.sin(deltaLong / 2);
	            var a = sinDeltaLatDiv2 * sinDeltaLatDiv2 + Math.cos(lat1rad) * Math.cos(lat2rad) * sinDeltaLongDiv2 * sinDeltaLongDiv2;
	            a = Math.min(1.0, a);
	            return 2 * Math.asin(Math.sqrt(a));
	        }
	    }, {
	        key: 'kilometersTo',
	        value: function kilometersTo(point) {
	            return this.radiansTo(point) * 6371.0;
	        }
	    }, {
	        key: 'milesTo',
	        value: function milesTo(point) {
	            return this.radiansTo(point) * 3958.8;
	        }
	    }, {
	        key: 'toJSON',
	        value: function toJSON() {
	            return {
	                "__type": "GeoPoint",
	                latitude: this.latitude,
	                longitude: this.longitude
	            };
	        }
	    }], [{
	        key: 'current',
	        value: function current(options) {
	            return new Promise(function (resolve, reject) {
	                window.navigator.geolocation.getCurrentPosition(function (location) {
	                    resolve(new _MLConfig2.default.GeoPoint(location.coords.latitude, location.coords.longitude), function (error) {
	                        reject(error);
	                    });
	                });
	            });
	        }
	    }]);
	
	    return MLGeoPoint;
	}();
	
	_MLConfig2.default.GeoPoint = MLGeoPoint;
	
	exports.default = _MLConfig2.default;
	module.exports = exports['default'];

/***/ }
/******/ ]);
//# sourceMappingURL=ML.js.map