'use strict';
var _ = require('underscore');
module.exports = function (ML) {
  /**
   * ML.Analytics collects data of user actions and analytics it in MaxLeap.
   * @param {Object} options The initial configuration
   * @constructor
   */
  ML.Analytics = function(options){
    var UUID = uuid.v1();
    var UNKNOWN = '0,0';
    var REFERRER_START = '8cf1f64d97224f6eba3867b57822f528';
    var detect = new ML.Detect();

    var installation = ML.localStorage.getItem('installation');
    if(!installation){
      installation = uuid.v1();
    }

    this.options = _.extend({
      sdkVersion: ML.VERSION,
      appUserId: installation,
      uuid: UUID,
      sessionId: UUID,
      deviceId: UUID,
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
      userCreateTime: new Date().getTime(),
      startTime: new Date().getTime(),
      ctimestamp: new Date().getTime(),
      channel: UNKNOWN,
      network: UNKNOWN,
      carrier: UNKNOWN,
      national: UNKNOWN,
      deviceModel: UNKNOWN
    }, options);

    this.trackPageBegin();
    //Track new user only one time.
    if(!ML.localStorage.getItem('installation')){
      this._trackNewUser();
    }
    
    if(!ML.localStorage.getItem('installation')){
      ML.localStorage.setItem('installation', installation);
    }
  };

  _.extend(ML.Analytics.prototype, /** @lends ML.Analytics.prototype */{
    /**
     * Track data when an user open a page.
     * @returns {Promise}
     */
    trackPageBegin: function(){
      var data = {
        PageView: [
          _.extend({}, this.options)
        ]
      };
      this._trackSessionBegin();
      return ML.Analytics._request(data);
    },
    /**
     * Track custom event.
     * @param {String} eventId Id of the custom event.
     * @param {Object} attrs Key-value map of the custom event.
     * @returns {Promise}
     */
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

    /**
     * Track data when an user login.
     * @param {Object} data Event data of user login.
     * @returns {Promise}
     */
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

    /**
     * Track data when an user register.
     * @param {Object} Event data of user register.
     * @returns {Promise}
     */
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

    /**
     * Track data when an user logout.
     * @param {Object} Event data of user logout.
     * @returns {Promise}
     */
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

    /**
     * Track data when an user open a page.
     * @param {Object} Event data of session start.
     * @returns {Promise}
     */
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

    /**
     * Track data when an user open a page.
     * @returns {Promise}
     */
    _trackSessionBegin: function(){
      var data = {
        Session: [
          _.extend({}, this.options)
        ]
      };
      return ML.Analytics._request(data);
    },

    /**
     * Track data when an user open a website first time.
     * @returns {Promise}
     */
    _trackNewUser: function(){
      var data = {
        NewUser: [
          _.extend({}, this.options)
        ]
      };
      return ML.Analytics._request(data);
    }
  });

  _.extend(ML.Analytics, /** @lends ML.Analytics */{
    /**
     * Post data to server, and retry when fail.
     * @param {Object} data
     * @param {i} i Retry time, by default undefined.
     * @returns {Promise}
     * @private
     */
    _request: function(data, i){
      if(!ML.analyticsEnable){
        return;
      }
      return ML._ajax('POST', ML.serverURL + '2.0/analytics/at', JSON.stringify(data), null, null, {
        'Content-Type': 'application/json'
      }).then(function(res){
        return res;
      }, function(res){
        i = i || 0;
        if(i < 2){
          ML.Analytics._request(data, ++i);
        }
        return res;
      });
    }
  })
};