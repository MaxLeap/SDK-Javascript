'use strict';

var _ = require('underscore');

module.exports = function (ML) {
  ML.Analytics = function(options){
    var installation = uuid.v1();
    var UUID = uuid.v1();
    var UNKNOWN = '0,0';
    var REFERRER_START = '8cf1f64d97224f6eba3867b57822f528';
    var detect = new ML.Detect();
    this.options = _.extend({
      sdkVersion: ML.VERSION,
      appUserId: installation,
      uuid: UUID,
      sessionId: UUID,
      deviceId: UUID,
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

      os: detect.getOSName(),
      osVersion: detect.getOSVersion(),
      resolution: detect.getResolution(),
      language: detect.getLanguage(),
      ctimestamp: new Date().getTime(),
      national: '0,0',
      deviceModel: '0,0'
    }, options);
    if(ML.analyticsEnable){
      !!ML.localStorage.getItem('installation') && ML.localStorage.setItem('installation', installation);
      this.trackPageBegin();
      this._trackNewUser();
    }


  };

  _.extend(ML.Analytics.prototype, {
    trackPageBegin: function(){
      var data = {
        PageView: [
          _.extend({}, this.options)
        ]
      };
      this._trackSessionBegin();
      return ML.Analytics._request(data);
    },
    trackEvent: function(eventId, attrs){
      var data = {
        Event: [
          _.extend({}, this.options, {
            eventId: eventId,
            attrs: attrs
          })
        ]
      };
      return ML.Analytics._request(data);
    },
    trackUserlogin: function(data){
      var data = {
        TimeLineEvent: [
          _.extend({}, this.options, {
            eventId: data.eventId,
            eventName: data.eventName,
            eventNickName: data.eventNickName,
            eventType: 1
          })
        ]
      };
      return ML.Analytics._request(data);
    },
    trackUserRegister: function(data){
      var data = {
        TimeLineEvent: [
          _.extend({}, this.options, {
            eventId: data.eventId,
            eventName: data.eventName,
            eventNickName: data.eventNickName,
            eventType: 0
          })
        ]
      };
      return ML.Analytics._request(data);
    },
    trackUserLogout: function(data){
      var data = {
        TimeLineEvent: [
          _.extend({}, this.options, {
            eventId: data.eventId,
            eventName: data.eventName,
            eventNickName: data.eventNickName,
            eventType: 2
          })
        ]
      };
      return ML.Analytics._request(data);
    },

    trackSessionStart: function(data){
      var data = {
        TimeLineEvent: [
          _.extend({}, this.options, {
            eventId: data.eventId,
            eventName: data.eventName,
            eventNickName: data.eventNickName,
            eventType: 3
          })
        ]
      };
      return ML.Analytics._request(data);
    },

    _trackSessionBegin: function(){
      var data = {
        Session: [
          _.extend({}, this.options)
        ]
      };
      return ML.Analytics._request(data);
    },
    _trackNewUser: function(){
      var data = {
        NewUser: [
          _.extend({}, this.options)
        ]
      };
      return ML.Analytics._request(data);
    }
  });

  _.extend(ML.Analytics, {
    _request: function(data){
      return ML._ajax('POST', ML.serverURL + '2.0/analytics/at', JSON.stringify(data), null, null, {
        'Content-Type': 'application/json'
      })
    }
  })
};