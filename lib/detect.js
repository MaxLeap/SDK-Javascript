'use strict';

var _ = require('underscore');

module.exports = function (ML) {

  ML.Detect = function () {
    this.detector = require('web-detector');
  };

  _.extend(ML.Detect.prototype, {
    getOSName: function () {
      return this.detector.os.name;
    },
    getOSVersion: function () {
      return this.detector.os.version;
    },
    getResolution: function () {
      return screen.width + '*' + screen.height
    },
    getLanguage: function () {
      return (navigator.language || navigator.userLanguage).match(/\w+(?=-)/)[0];
    }
  });

};