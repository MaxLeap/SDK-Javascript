'use strict';
var _ = require('underscore');
require('whatwg-fetch');

/**
 * ML.CloudCode is a management of MaxLeap Cloud Code.
 */
module.exports = function () {
  ML.CloudCode = function(){
  };

  _.extend(ML.CloudCode.prototype, /** @lends ML.CloudCode.prototype */ {
    /**
     * Run cloud function in background.
     * @param {String} Name of cloud function.
     * @param {json} Params of cloud function.
     * @returns {Promise}
     */
    callFunctionInBackground: function(name, data){
      return fetch(ML.serverURL + '2.0/functions/'+name, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ZCloud-AppId': ML.applicationId,
          'X-ZCloud-APIKey': ML.applicationKey
        },
        body: JSON.stringify(data)
      })
        .then(function(res){
          return res.json();
        })
    }
  })
};