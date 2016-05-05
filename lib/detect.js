'use strict';

var _ = require('underscore');

module.exports = function (ML) {

  ML.Detect = function () {
    var module = {
      options: [],
      header: [navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor, window.opera],
      dataos: [
        {name: 'Windows Phone', value: 'Windows Phone', version: 'Windows Phone'},
        {name: 'Windows', value: 'Win', version: 'NT'},
        {name: 'iOS', value: 'iPhone', version: 'OS'},
        {name: 'iOS', value: 'iPad', version: 'OS'},
        {name: 'Kindle', value: 'Silk', version: 'Silk'},
        {name: 'Android', value: 'Android', version: 'Android'},
        {name: 'PlayBook', value: 'PlayBook', version: 'OS'},
        {name: 'BlackBerry', value: 'BlackBerry', version: '/'},
        {name: 'OSX', value: 'Macintosh', version: 'OS X'},
        {name: 'Linux', value: 'Linux', version: 'rv'},
        {name: 'Palm', value: 'Palm', version: 'PalmOS'}
      ],
      databrowser: [
        {name: 'Chrome', value: 'Chrome', version: 'Chrome'},
        {name: 'Firefox', value: 'Firefox', version: 'Firefox'},
        {name: 'Safari', value: 'Safari', version: 'Version'},
        {name: 'Internet Explorer', value: 'MSIE', version: 'MSIE'},
        {name: 'Opera', value: 'Opera', version: 'Opera'},
        {name: 'BlackBerry', value: 'CLDC', version: 'CLDC'},
        {name: 'Mozilla', value: 'Mozilla', version: 'Mozilla'}
      ],
      init: function () {
        var agent = this.header.join(' '),
          os = this.matchItem(agent, this.dataos),
          browser = this.matchItem(agent, this.databrowser);

        return {os: os, browser: browser};
      },
      matchItem: function (string, data) {
        var regex,
          regexv,
          match,
          matches,
          version;
        for (var i = 0; i < data.length; i += 1) {
          regex = new RegExp(data[i].value, 'i');
          match = regex.test(string);
          if (match) {
            regexv = new RegExp(data[i].version + '[- /:;]([\\d._]+)', 'i');
            matches = string.match(regexv);
            version = '';

            if (matches) {
              if (matches[1]) {
                matches = matches[1];
              }
            }
            if (matches) {
              version = matches.replace(/_/g, '.');
            } else {
              version = 'unknown';
            }
            //如果是windows, 则根据NT版本划分操作系统版本
            if (data[i].version === 'NT') {
              if (version >= 10) {
                version = 10;
              } else if (version >= 6.3) {
                version = 8.1;
              } else if (version >= 6.2) {
                version = 8;
              } else if (version >= 6.1) {
                version = 7;
              } else if (version >= 6.0) {
                version = 'vista';
              } else if (version >= 5.1) {
                version = 'xp';
              } else if (version >= 5.0) {
                version = 2000;
              }
            }
            return {
              name: data[i].name,
              version: version
            };
          }
        }
        return {name: 'unknown', version: 'unknown'};
      }
    };
    this.module = module.init();
  };

  _.extend(ML.Detect.prototype, {
    getOSName: function () {
      return this.module.os.name
    },
    getOSVersion: function () {
      return this.module.os.version
    },
    getResolution: function () {
      return screen.width + '*' + screen.height
    },
    getLanguage: function () {
      return (navigator.language || navigator.userLanguage).match(/\w+(?=-)/)[0];
    }
  });

};