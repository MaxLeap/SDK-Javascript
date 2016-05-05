'use strict';

var _ = require('underscore');

module.exports = function (ML) {

  ML.Detector = function () {
    this.detector = require('web-detector');
  };

  _.extend(ML.Detector.prototype, {
    getOSName: function () {
      return this.detector.os.name === 'na' ? 'unknown' : this.detector.os.name;
    },
    getOSVersion: function () {
      //如果是windows系统,web-detector返回的是NT的版本号,需要转换成windows版本
      if(this.detector.os.name === 'windows'){
        if (this.detector.os.version >= 10) {
          return '10';
        } else if (this.detector.os.version >= 6.3) {
          return '8.1';
        } else if (this.detector.os.version >= 6.2) {
          return '8';
        } else if (this.detector.os.version >= 6.1) {
          return '7';
        } else if (this.detector.os.version >= 6.0) {
          return 'vista';
        } else if (this.detector.os.version >= 5.1) {
          return 'xp';
        } else if (this.detector.os.version >= 5.0) {
          return '2000';
        }
      }
      return this.detector.os.fullVersion === '-1' ? 'unknown' : this.detector.os.fullVersion;
    },
    getResolution: function () {
      return screen.width + '*' + screen.height
    },
    getLanguage: function () {
      return (navigator.language || navigator.userLanguage).match(/\w+(?=-)/)[0];
    }
  });

};