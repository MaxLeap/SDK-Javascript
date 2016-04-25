'use strict';

var _ = require('underscore');

module.exports = function (ML) {
  ML.Analytics = function(options){
    var installation = uuid.v1();
    var UNKNOWN = '0,0';
    var REFERRER_START = '8cf1f64d97224f6eba3867b57822f528';

    this.options = _.extend({
      sdkVersion: ML.VERSION,
      uuid: installation,
      sessionId: installation,
      deviceId: installation,
      appUserId: installation,
      channel: UNKNOWN,
      network: UNKNOWN,
      carrier: UNKNOWN,
      userCreateTime: new Date().getTime(),
      startTime: new Date().getTime(),
      duration: 0,
      push: false,
      upgrade: false,
      url: window.location.href,
      referer: document.referrer || REFERRER_START,
      userAgent: window.navigator.userAgent,

      os: 'ios',
      osVersion: '1.0',
      resolution: '1024*768',
      language: 'en'
    }, options)
  };

  _.extend(ML.Analytics.prototype, {
    trackPageBegin: function(){
      var data = {
        PageView: [this.options]
      };
      ML._request('analytics/at', null, null, 'POST', data);

    }
  })
};