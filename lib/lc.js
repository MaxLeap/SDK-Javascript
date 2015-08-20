/*!
 * AVOSCloud JavaScript SDK
 * Built: Mon Jun 03 2013 13:45:00
 * https://leap.as
 *
 * Copyright 2015 leap.as, Inc.
 * The AVOS Cloud JavaScript SDK is freely distributable under the MIT license.
 */

var LC = module.exports = {};

LC._ = require('underscore');
LC.VERSION = require('./version');
LC.Promise = require('./promise');
LC.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
LC.localStorage = require('localStorage');

// 以下模块为了兼容原有代码，使用这种加载方式。
// The module order is important.
require('./utils')(LC);
require('./error')(LC);
require('./event')(LC);
require('./geopoint')(LC);
require('./acl')(LC);
require('./op')(LC);
require('./relation')(LC);
require('./file')(LC);
require('./object')(LC);
require('./role')(LC);
require('./collection')(LC);
require('./view')(LC);
require('./user')(LC);
require('./query')(LC);
require('./facebook')(LC);
require('./history')(LC);
require('./router')(LC);
require('./cloudfunction')(LC);
require('./status')(LC);
require('./search')(LC);

LC.LC = LC; // Backward compatibility
