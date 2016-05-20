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
    var UNKNOWN = this.UNKNOWN = '0,0';
    var INSTALLATION_FLAG = 'ml_installation_flag';
    var REFERRER_START = '8cf1f64d97224f6eba3867b57822f528';
    var detector = new ML.Detector();

    var installation = ML.store.get(INSTALLATION_FLAG);
    if(!installation){
      installation = uuid.v1();
    }
    this.options = _.extend({
      sdkVersion: ML.VERSION,
      appUserId: installation,
      sessionId: UUID,
      deviceId: installation,
      duration: 0,
      push: false,
      upgrade: false,
      url: window.location.href,
      referer: document.referrer || REFERRER_START,
      userAgent: window.navigator.userAgent,
      os: 'web',
      osVersion: detector.getOSName() + ' ' + detector.getOSVersion(),
      resolution: detector.getResolution(),
      language: detector.getLanguage(),
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
    if(!ML.store.get(INSTALLATION_FLAG)){
      this._trackNewUser();
    }
    
    if(!ML.store.get(INSTALLATION_FLAG)){
      ML.store.set(INSTALLATION_FLAG, installation, { expires: '1Y' });
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
          _.extend({}, this.options, {
            uuid: uuid.v1()
          })
        ]
      };
      this._trackSessionBegin();
      return ML.Analytics._request(data, {appId: this.options.appId});
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
            attrs: attrs,
            uuid: uuid.v1()
          })
        ]
      };
      return ML.Analytics._request(data, {appId: this.options.appId});
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
            eventName: this.UNKNOWN,
            eventNickName: this.UNKNOWN,
            eventType: 1,
            uuid: uuid.v1()
          })
        ]
      };
      return ML.Analytics._request(data, {appId: this.options.appId});
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
            eventName: this.UNKNOWN,
            eventNickName: this.UNKNOWN,
            eventType: 0,
            uuid: uuid.v1()
          })
        ]
      };
      return ML.Analytics._request(data, {appId: this.options.appId});
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
            eventName: this.UNKNOWN,
            eventNickName: this.UNKNOWN,
            eventType: 2,
            uuid: uuid.v1()
          })
        ]
      };
      return ML.Analytics._request(data, {appId: this.options.appId});
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
            eventName: this.UNKNOWN,
            eventNickName: this.UNKNOWN,
            eventType: 3,
            uuid: uuid.v1()
          })
        ]
      };
      return ML.Analytics._request(data, {appId: this.options.appId});
    },

    /**
     * Track data when an user open a page.
     * @returns {Promise}
     */
    _trackSessionBegin: function(){
      var data = {
        Session: [
          _.extend({}, this.options, {
            uuid: uuid.v1()
          })
        ]
      };
      return ML.Analytics._request(data, {appId: this.options.appId});
    },

    /**
     * Track data when an user open a website first time.
     * @returns {Promise}
     */
    _trackNewUser: function(){
      var data = {
        NewUser: [
          _.extend({}, this.options, {
            uuid: uuid.v1()
          })
        ]
      };
      return ML.Analytics._request(data, {appId: this.options.appId});
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
    _request: function(data, headers, i){
      if(!ML.analyticsEnable){
        return;
      }
      return ML._ajax('POST', ML.serverURL + '2.0/analytics/at', JSON.stringify(data), null, null, {
        'Content-Type': 'application/json',
        'X-ML-appid': headers.appId
      }).then(function(res){
        return res;
      }, function(res){
        i = i || 0;
        if(i < 2){
          ML.Analytics._request(data, headers, ++i);
        }
        return res;
      });
    }
  })
};