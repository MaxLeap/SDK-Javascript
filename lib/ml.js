/*!
 * LeapCloud JavaScript SDK
 * Built: Mon Jun 03 2013 13:45:00
 * https://leap.as
 *
 * Copyright 2015 leap.as, Inc.
 * The Leap Cloud JavaScript SDK is freely distributable under the MIT license.
 */

global.ML = module.exports = {};
global.uuid = require('node-uuid');
ML._ = require('underscore');
ML.VERSION = require('./version');

ML.Promise = require('./promise');
ML.localStorage = require('localStorage');

ML.useCNServer = function(){
  ML.serverURL = 'https://api.maxleap.cn/';
};

ML.useENServer = function(){
  ML.serverURL = 'https://api.maxleap.com/';
};


// The module order is important.
require('./utils')(ML);
require('./error')(ML);
require('./event')(ML);
require('./geopoint')(ML);
require('./op')(ML);
require('./relation')(ML);
require('./file')(ML);
require('./object')(ML);
require('./view')(ML);
require('./user')(ML);
require('./query')(ML);

ML.ML = ML;
