'use strict';
var _ = require('underscore');
module.exports = function () {

  /**
   * A ML.File is a local representation of a file that is saved to the ML cloud.
   * @param {String} name The file's name.
   * @param {Array} data The data for the file, as either:
   *     1. an Object like { base64: "..." } with a base64-encoded String.
   *     2. an Object url.
   * @class
   */
  ML.File = function (name, data) {
    this._name = name;
    this._source = new ML.Promise(function (resolve) {
      resolve(data);
    })
  };

  _.extend(ML.File.prototype, /** @lends ML.File.prototype */ {

    /**
     * Gets the name of the file. Before save is called, this is the filename
     * given by the user. After save is called, that name gets prefixed with a
     * unique identifier.
     * @returns {String}
     */
    name: function () {
      return this._name;
    },

    /**
     * Gets the url of the file. It is only available after you save the file or
     * after you get the file from a ML.Object.
     * @return {String}
     */
    url: function () {
      return '//' + this._url;
    },

    /**
     * Saves the file to the ML cloud.
     * @return {Promise} Promise that is resolved when the save finishes.
     */
    save: function () {
      var self = this;
      return this._source.then(function (source) {
        return ML._request('files', self._name, null, 'PUT', source).then(function (res) {
          self._name = res.name;
          self._url = res.url;
          return self;
        });
      });
    },

    /**
     * Destroy the file from the ML cloud.
     * @return {Promise} Promise that is resolved when the destroy finishes.
     */
    destroy: function () {
      return ML._request('files', null, null, 'DELETE', null, {'X-LAS-Fid': this._name});
    }
  });

};