'use strict';

module.exports = function(){

  var cookie = require('tiny-cookie');

  function set(key, value, options){
    cookie.set(key, value, options);
  }

  function get(key){
    return cookie.get(key);
  }

  return {
    set: set,
    get: get
  }
};