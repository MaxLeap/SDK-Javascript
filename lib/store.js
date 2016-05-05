'use strict';

module.exports = function(){

  var cookie = require('tiny-cookie');
  function set(key, value){
    cookie.set(key, value);
  }

  function get(key){
    return cookie.get(key);
  }

  return {
    set: set,
    get: get
  }
};