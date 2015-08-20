'use strict';

var _ = require('underscore');

module.exports = function(LC) {
  /**
   * @class
   *
   * <p>A LC.User object is a local representation of a user persisted to the
   * LC cloud. This class is a subclass of a LC.Object, and retains the
   * same functionality of a LC.Object, but also extends it with various
   * user specific methods, like authentication, signing up, and validation of
   * uniqueness.</p>
   */
  LC.User = LC.Object.extend("_User", /** @lends LC.User.prototype */ {
    // Instance Variables
    _isCurrentUser: false,


    // Instance Methods

    /**
     * Internal method to handle special fields in a _User response.
     */
    _mergeMagicFields: function(attrs) {
      if (attrs.sessionToken) {
        this._sessionToken = attrs.sessionToken;
        delete attrs.sessionToken;
      }
      LC.User.__super__._mergeMagicFields.call(this, attrs);
    },

    /**
     * Removes null values from authData (which exist temporarily for
     * unlinking)
     */
    _cleanupAuthData: function() {
      if (!this.isCurrent()) {
        return;
      }
      var authData = this.get('authData');
      if (!authData) {
        return;
      }
      LC._objectEach(this.get('authData'), function(value, key) {
        if (!authData[key]) {
          delete authData[key];
        }
      });
    },

    /**
     * Synchronizes authData for all providers.
     */
    _synchronizeAllAuthData: function() {
      var authData = this.get('authData');
      if (!authData) {
        return;
      }

      var self = this;
      LC._objectEach(this.get('authData'), function(value, key) {
        self._synchronizeAuthData(key);
      });
    },

    /**
     * Synchronizes auth data for a provider (e.g. puts the access token in the
     * right place to be used by the Facebook SDK).
     */
    _synchronizeAuthData: function(provider) {
      if (!this.isCurrent()) {
        return;
      }
      var authType;
      if (_.isString(provider)) {
        authType = provider;
        provider = LC.User._authProviders[authType];
      } else {
        authType = provider.getAuthType();
      }
      var authData = this.get('authData');
      if (!authData || !provider) {
        return;
      }
      var success = provider.restoreAuthentication(authData[authType]);
      if (!success) {
        this._unlinkFrom(provider);
      }
    },

    _handleSaveResult: function(makeCurrent) {
      // Clean up and synchronize the authData object, removing any unset values
      if (makeCurrent) {
        this._isCurrentUser = true;
      }
      this._cleanupAuthData();
      this._synchronizeAllAuthData();
      // Don't keep the password around.
      delete this._serverData.password;
      this._rebuildEstimatedDataForKey("password");
      this._refreshCache();
      if (makeCurrent || this.isCurrent()) {
        LC.User._saveCurrentUser(this);
      }
    },

    /**
     * Unlike in the Android/iOS SDKs, logInWith is unnecessary, since you can
     * call linkWith on the user (even if it doesn't exist yet on the server).
     */
    _linkWith: function(provider, options) {
      var authType;
      if (_.isString(provider)) {
        authType = provider;
        provider = LC.User._authProviders[provider];
      } else {
        authType = provider.getAuthType();
      }
      if (_.has(options, 'authData')) {
        var authData = this.get('authData') || {};
        authData[authType] = options.authData;
        this.set('authData', authData);

        // Overridden so that the user can be made the current user.
        var newOptions = _.clone(options) || {};
        newOptions.success = function(model) {
          model._handleSaveResult(true);
          if (options.success) {
            options.success.apply(this, arguments);
          }
        };
        return this.save({'authData': authData}, newOptions);
      } else {
        var self = this;
        var promise = new LC.Promise();
        provider.authenticate({
          success: function(provider, result) {
            self._linkWith(provider, {
              authData: result,
              success: options.success,
              error: options.error
            }).then(function() {
              promise.resolve(self);
            });
          },
          error: function(provider, error) {
            if (options.error) {
              options.error(self, error);
            }
            promise.reject(error);
          }
        });
        return promise;
      }
    },

    /**
     * Unlinks a user from a service.
     */
    _unlinkFrom: function(provider, options) {
      var authType;
      if (_.isString(provider)) {
        authType = provider;
        provider = LC.User._authProviders[provider];
      } else {
        authType = provider.getAuthType();
      }
      var newOptions = _.clone(options);
      var self = this;
      newOptions.authData = null;
      newOptions.success = function(model) {
        self._synchronizeAuthData(provider);
        if (options.success) {
          options.success.apply(this, arguments);
        }
      };
      return this._linkWith(provider, newOptions);
    },

    /**
     * Checks whether a user is linked to a service.
     */
    _isLinked: function(provider) {
      var authType;
      if (_.isString(provider)) {
        authType = provider;
      } else {
        authType = provider.getAuthType();
      }
      var authData = this.get('authData') || {};
      return !!authData[authType];
    },

    /**
     * Deauthenticates all providers.
     */
    _logOutWithAll: function() {
      var authData = this.get('authData');
      if (!authData) {
        return;
      }
      var self = this;
      LC._objectEach(this.get('authData'), function(value, key) {
        self._logOutWith(key);
      });
    },

    /**
     * Deauthenticates a single provider (e.g. removing access tokens from the
     * Facebook SDK).
     */
    _logOutWith: function(provider) {
      if (!this.isCurrent()) {
        return;
      }
      if (_.isString(provider)) {
        provider = LC.User._authProviders[provider];
      }
      if (provider && provider.deauthenticate) {
        provider.deauthenticate();
      }
    },

    /**
     * Signs up a new user. You should call this instead of save for
     * new LC.Users. This will create a new LC.User on the server, and
     * also persist the session on disk so that you can access the user using
     * <code>current</code>.
     *
     * <p>A username and password must be set before calling signUp.</p>
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {Object} attrs Extra fields to set on the new user, or null.
     * @param {Object} options A Backbone-style options object.
     * @return {LC.Promise} A promise that is fulfilled when the signup
     *     finishes.
     * @see LC.User.signUp
     */
    signUp: function(attrs, options) {
      var error;
      options = options || {};

      var username = (attrs && attrs.username) || this.get("username");
      if (!username || (username === "")) {
        error = new LC.Error(
            LC.Error.OTHER_CAUSE,
            "Cannot sign up user with an empty name.");
        if (options && options.error) {
          options.error(this, error);
        }
        return LC.Promise.error(error);
      }

      var password = (attrs && attrs.password) || this.get("password");
      if (!password || (password === "")) {
        error = new LC.Error(
            LC.Error.OTHER_CAUSE,
            "Cannot sign up user with an empty password.");
        if (options && options.error) {
          options.error(this, error);
        }
        return LC.Promise.error(error);
      }

      // Overridden so that the user can be made the current user.
      var newOptions = _.clone(options);
      newOptions.success = function(model) {
        model._handleSaveResult(true);
        if (options.success) {
          options.success.apply(this, arguments);
        }
      };
      return this.save(attrs, newOptions);
    },

    /**
     * Signs up a new user with mobile phone and sms code.
     * You should call this instead of save for
     * new LC.Users. This will create a new LC.User on the server, and
     * also persist the session on disk so that you can access the user using
     * <code>current</code>.
     *
     * <p>A username and password must be set before calling signUp.</p>
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {Object} attrs Extra fields to set on the new user, or null.
     * @param {Object} options A Backbone-style options object.
     * @return {LC.Promise} A promise that is fulfilled when the signup
     *     finishes.
     * @see LC.User.signUpOrlogInWithMobilePhone
     * @see LC.Cloud.requestSmsCode
     */
    signUpOrlogInWithMobilePhone: function(attrs, options) {
      var error;
      options = options || {};

      var mobilePhoneNumber = (attrs && attrs.mobilePhoneNumber) ||
                              this.get("mobilePhoneNumber");
      if (!mobilePhoneNumber || (mobilePhoneNumber === "")) {
        error = new LC.Error(
            LC.Error.OTHER_CAUSE,
            "Cannot sign up or login user by mobilePhoneNumber " +
            "with an empty mobilePhoneNumber.");
        if (options && options.error) {
          options.error(this, error);
        }
        return LC.Promise.error(error);
      }

      var smsCode = (attrs && attrs.smsCode) || this.get("smsCode");
      if (!smsCode || (smsCode === "")) {
        error = new LC.Error(
            LC.Error.OTHER_CAUSE,
             "Cannot sign up or login user by mobilePhoneNumber  " +
             "with an empty smsCode.");
        if (options && options.error) {
          options.error(this, error);
        }
        return LC.Promise.error(error);
      }

      // Overridden so that the user can be made the current user.
      var newOptions = _.clone(options);
      newOptions._makeRequest = function(route, className, id, method, json) {
        return LC._request('usersByMobilePhone', null, null, "POST", json);
      };
      newOptions.success = function(model) {
        model._handleSaveResult(true);
        delete model.attributes.smsCode;
        delete model._serverData.smsCode;
        if (options.success) {
          options.success.apply(this, arguments);
        }
      };
      return this.save(attrs, newOptions);
    },

    /**
     * Logs in a LC.User. On success, this saves the session to localStorage,
     * so you can retrieve the currently logged in user using
     * <code>current</code>.
     *
     * <p>A username and password must be set before calling logIn.</p>
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {Object} options A Backbone-style options object.
     * @see LC.User.logIn
     * @return {LC.Promise} A promise that is fulfilled with the user when
     *     the login is complete.
     */
    logIn: function(options) {
      var model = this;
      var request = LC._request("login", null, null, "GET", this.toJSON());
      return request.then(function(resp, status, xhr) {
        var serverAttrs = model.parse(resp, status, xhr);
        model._finishFetch(serverAttrs);
        model._handleSaveResult(true);
        if(!serverAttrs.smsCode)
          delete model.attributes['smsCode'];
        return model;
      })._thenRunCallbacks(options, this);
    },

    /**
     * @see LC.Object#save
     */
    save: function(arg1, arg2, arg3) {
      var i, attrs, current, options, saved;
      if (_.isObject(arg1) || _.isNull(arg1) || _.isUndefined(arg1)) {
        attrs = arg1;
        options = arg2;
      } else {
        attrs = {};
        attrs[arg1] = arg2;
        options = arg3;
      }
      options = options || {};

      var newOptions = _.clone(options);
      newOptions.success = function(model) {
        model._handleSaveResult(false);
        if (options.success) {
          options.success.apply(this, arguments);
        }
      };
      return LC.Object.prototype.save.call(this, attrs, newOptions);
    },

    /**
     * Follow a user
     * @since 0.3.0
     * @param {} target The target user or user's objectId to follow.
     * @param {Object} options An optional Backbone-like options object with
     *     success and error callbacks that will be invoked once the iteration
     *     has finished.
     */
    follow: function(target, options){
      if(!this.id){
          throw "Please signin.";
      }
      if(!target){
          throw "Invalid target user.";
      }
      var userObjectId = _.isString(target) ? target: target.id;
      if(!userObjectId){
          throw "Invalid target user.";
      }
      var route = 'users/' + this.id + '/friendship/' + userObjectId;
      var request = LC._request(route, null, null, 'POST', null);
      return request._thenRunCallbacks(options);
    },

    /**
     * Unfollow a user.
     * @since 0.3.0
     * @param {} target The target user or user's objectId to unfollow.
     * @param options {Object} An optional Backbone-like options object with
     *     success and error callbacks that will be invoked once the iteration
     *     has finished.
     */
    unfollow: function(target, options){
      if(!this.id){
          throw "Please signin.";
      }
      if(!target){
          throw "Invalid target user.";
      }
      var userObjectId = _.isString(target) ? target: target.id;
      if(!userObjectId){
          throw "Invalid target user.";
      }
      var route = 'users/' + this.id + '/friendship/' + userObjectId;
      var request = LC._request(route, null, null, 'DELETE', null);
      return request._thenRunCallbacks(options);
    },

    /**
     *Create a follower query to query the user's followers.
     * @since 0.3.0
     * @see LC.User#followerQuery
     */
    followerQuery: function() {
        return LC.User.followerQuery(this.id);
    },

    /**
     *Create a followee query to query the user's followees.
     * @since 0.3.0
     * @see LC.User#followeeQuery
     */
    followeeQuery: function() {
        return LC.User.followeeQuery(this.id);
    },

    /**
     * @see LC.Object#fetch
     */
    fetch: function(options) {
      var newOptions = options ? _.clone(options) : {};
      newOptions.success = function(model) {
        model._handleSaveResult(false);
        if (options && options.success) {
          options.success.apply(this, arguments);
        }
      };
      return LC.Object.prototype.fetch.call(this, newOptions);
    },

    /**
     * Update user's new password safely based on old password.
     * @param {String} oldPassword, the old password.
     * @param {String} newPassword, the new password.
     * @param {Object} An optional Backbone-like options object with
     *     success and error callbacks that will be invoked once the iteration
     *     has finished.
     */
    updatePassword: function(oldPassword, newPassword, options) {
      var route = 'users/' + this.id + '/updatePassword';
      var params = {
        old_password: oldPassword,
        new_password: newPassword
      };
      var request = LC._request(route, null, null, 'PUT', params);
      return request._thenRunCallbacks(options, this);
    },

    /**
     * Returns true if <code>current</code> would return this user.
     * @see LC.User#current
     */
    isCurrent: function() {
      return this._isCurrentUser;
    },

    /**
     * Returns get("username").
     * @return {String}
     * @see LC.Object#get
     */
    getUsername: function() {
      return this.get("username");
    },

    /**
     * Returns get("mobilePhoneNumber").
     * @return {String}
     * @see LC.Object#get
     */
    getMobilePhoneNumber: function(){
      return this.get("mobilePhoneNumber");
    },

    /**
     * Calls set("mobilePhoneNumber", phoneNumber, options) and returns the result.
     * @param {String} mobilePhoneNumber
     * @param {Object} options A Backbone-style options object.
     * @return {Boolean}
     * @see LC.Object.set
     */
    setMobilePhoneNumber: function(phone, options) {
      return this.set("mobilePhoneNumber", phone, options);
    },

    /**
     * Calls set("username", username, options) and returns the result.
     * @param {String} username
     * @param {Object} options A Backbone-style options object.
     * @return {Boolean}
     * @see LC.Object.set
     */
    setUsername: function(username, options) {
      return this.set("username", username, options);
    },

    /**
     * Calls set("password", password, options) and returns the result.
     * @param {String} password
     * @param {Object} options A Backbone-style options object.
     * @return {Boolean}
     * @see LC.Object.set
     */
    setPassword: function(password, options) {
      return this.set("password", password, options);
    },

    /**
     * Returns get("email").
     * @return {String}
     * @see LC.Object#get
     */
    getEmail: function() {
      return this.get("email");
    },

    /**
     * Calls set("email", email, options) and returns the result.
     * @param {String} email
     * @param {Object} options A Backbone-style options object.
     * @return {Boolean}
     * @see LC.Object.set
     */
    setEmail: function(email, options) {
      return this.set("email", email, options);
    },

    /**
     * Checks whether this user is the current user and has been authenticated.
     * @return (Boolean) whether this user is the current user and is logged in.
     */
    authenticated: function() {
      return !!this._sessionToken &&
          (LC.User.current() && LC.User.current().id === this.id);
    }

  }, /** @lends LC.User */ {
    // Class Variables

    // The currently logged-in user.
    _currentUser: null,

    // Whether currentUser is known to match the serialized version on disk.
    // This is useful for saving a localstorage check if you try to load
    // _currentUser frequently while there is none stored.
    _currentUserMatchesDisk: false,

    // The localStorage key suffix that the current user is stored under.
    _CURRENT_USER_KEY: "currentUser",

    // The mapping of auth provider names to actual providers
    _authProviders: {},


    // Class Methods

    /**
     * Signs up a new user with a username (or email) and password.
     * This will create a new LC.User on the server, and also persist the
     * session in localStorage so that you can access the user using
     * {@link #current}.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {String} username The username (or email) to sign up with.
     * @param {String} password The password to sign up with.
     * @param {Object} attrs Extra fields to set on the new user.
     * @param {Object} options A Backbone-style options object.
     * @return {LC.Promise} A promise that is fulfilled with the user when
     *     the signup completes.
     * @see LC.User#signUp
     */
    signUp: function(username, password, attrs, options) {
      attrs = attrs || {};
      attrs.username = username;
      attrs.password = password;
      var user = LC.Object._create("_User");
      return user.signUp(attrs, options);
    },

    /**
     * Logs in a user with a username (or email) and password. On success, this
     * saves the session to disk, so you can retrieve the currently logged in
     * user using <code>current</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {String} username The username (or email) to log in with.
     * @param {String} password The password to log in with.
     * @param {Object} options A Backbone-style options object.
     * @return {LC.Promise} A promise that is fulfilled with the user when
     *     the login completes.
     * @see LC.User#logIn
     */
    logIn: function(username, password, options) {
      var user = LC.Object._create("_User");
      user._finishFetch({ username: username, password: password });
      return user.logIn(options);
    },

    /**
     * Logs in a user with a session token. On success, this saves the session
     * to disk, so you can retrieve the currently logged in user using
     * <code>current</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {String} sessionToken The sessionToken to log in with.
     * @param {Object} options A Backbone-style options object.
     * @return {LC.Promise} A promise that is fulfilled with the user when
     *     the login completes.
     */
    become: function(sessionToken, options) {
      options = options || {};

      var user = LC.Object._create("_User");
      return LC._request(
          "users",
          "me",
          null,
          "GET",
          {
            useMasterKey: options.useMasterKey,
            session_token: sessionToken
          }
      ).then(function(resp, status, xhr) {
          var serverAttrs = user.parse(resp, status, xhr);
          user._finishFetch(serverAttrs);
          user._handleSaveResult(true);
          return user;

      })._thenRunCallbacks(options, user);
    },

    /**
     * Logs in a user with a mobile phone number and sms code sent by
     * LC.User.requestLoginSmsCode.On success, this
     * saves the session to disk, so you can retrieve the currently logged in
     * user using <code>current</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {String} mobilePhone The user's mobilePhoneNumber
     * @param {String} smsCode The sms code sent by LC.User.requestLoginSmsCode
     * @param {Object} options A Backbone-style options object.
     * @return {LC.Promise} A promise that is fulfilled with the user when
     *     the login completes.
     * @see LC.User#logIn
     */
   logInWithMobilePhoneSmsCode: function(mobilePhone, smsCode, options){
      var user = LC.Object._create("_User");
      user._finishFetch({ mobilePhoneNumber: mobilePhone, smsCode: smsCode });
      return user.logIn(options);
   },

    /**
     * Sign up or logs in a user with a mobilePhoneNumber and smsCode.
     * On success, this saves the session to disk, so you can retrieve the currently
     * logged in user using <code>current</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {String} mobilePhoneNumber The user's mobilePhoneNumber.
     * @param {String} smsCode The sms code sent by LC.Cloud.requestSmsCode
     * @param {Object} attributes  The user's other attributes such as username etc.
     * @param {Object} options A Backbone-style options object.
     * @return {LC.Promise} A promise that is fulfilled with the user when
     *     the login completes.
     * @see LC.User#signUpOrlogInWithMobilePhone
     * @see LC.Cloud.requestSmsCode
     */
    signUpOrlogInWithMobilePhone: function(mobilePhoneNumber, smsCode, attrs, options) {
      attrs = attrs || {};
      attrs.mobilePhoneNumber = mobilePhoneNumber;
      attrs.smsCode = smsCode;
      var user = LC.Object._create("_User");
      return user.signUpOrlogInWithMobilePhone(attrs, options);
    },


    /**
     * Logs in a user with a mobile phone number and password. On success, this
     * saves the session to disk, so you can retrieve the currently logged in
     * user using <code>current</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {String} mobilePhone The user's mobilePhoneNumber
     * @param {String} password The password to log in with.
     * @param {Object} options A Backbone-style options object.
     * @return {LC.Promise} A promise that is fulfilled with the user when
     *     the login completes.
     * @see LC.User#logIn
     */
   logInWithMobilePhone: function(mobilePhone, password, options){
      var user = LC.Object._create("_User");
      user._finishFetch({ mobilePhoneNumber: mobilePhone, password: password });
      return user.logIn(options);
   },

    /**
     * Logs out the currently logged in user session. This will remove the
     * session from disk, log out of linked services, and future calls to
     * <code>current</code> will return <code>null</code>.
     */
    logOut: function() {
      if (LC.User._currentUser !== null) {
        LC.User._currentUser._logOutWithAll();
        LC.User._currentUser._isCurrentUser = false;
      }
      LC.User._currentUserMatchesDisk = true;
      LC.User._currentUser = null;
      LC.localStorage.removeItem(
          LC._getAVPath(LC.User._CURRENT_USER_KEY));
    },

    /**
     *Create a follower query for special user to query the user's followers.
     * @param userObjectId {String} The user object id.
     * @since 0.3.0
     */
    followerQuery: function(userObjectId) {
        if(!userObjectId || !_.isString(userObjectId)) {
          throw "Invalid user object id.";
        }
        var query = new LC.FriendShipQuery('_Follower');
        query._friendshipTag ='follower';
        query.equalTo('user', LC.Object.createWithoutData('_User', userObjectId));
        return query;
    },

    /**
     *Create a followee query for special user to query the user's followees.
     * @param userObjectId {String} The user object id.
     * @since 0.3.0
     */
    followeeQuery: function(userObjectId) {
        if(!userObjectId || !_.isString(userObjectId)) {
          throw "Invalid user object id.";
        }
        var query = new LC.FriendShipQuery('_Followee');
        query._friendshipTag ='followee';
        query.equalTo('user', LC.Object.createWithoutData('_User', userObjectId));
        return query;
    },

    /**
     * Requests a password reset email to be sent to the specified email address
     * associated with the user account. This email allows the user to securely
     * reset their password on the LC site.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {String} email The email address associated with the user that
     *     forgot their password.
     * @param {Object} options A Backbone-style options object.
     */
    requestPasswordReset: function(email, options) {
      var json = { email: email };
      var request = LC._request("requestPasswordReset", null, null, "POST",
                                   json);
      return request._thenRunCallbacks(options);
    },

    /**
     * Requests a verify email to be sent to the specified email address
     * associated with the user account. This email allows the user to securely
     * verify their email address on the LC site.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {String} email The email address associated with the user that
     *     doesn't verify their email address.
     * @param {Object} options A Backbone-style options object.
     */
    requestEmailVerify: function(email, options) {
      var json = { email: email };
      var request = LC._request("requestEmailVerify", null, null, "POST",
                                   json);
      return request._thenRunCallbacks(options);
    },

   /**
    * @Deprecated typo error, please use requestEmailVerify
    */
    requestEmailVerfiy: function(email, options) {
      var json = { email: email };
      var request = LC._request("requestEmailVerify", null, null, "POST",
                                   json);
      return request._thenRunCallbacks(options);
    },

    /**
     * Requests a verify sms code to be sent to the specified mobile phone
     * number associated with the user account. This sms code allows the user to
     * verify their mobile phone number by calling LC.User.verifyMobilePhone
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {String} mobilePhone The mobile phone number  associated with the
     *                  user that doesn't verify their mobile phone number.
     * @param {Object} options A Backbone-style options object.
     */
    requestMobilePhoneVerify: function(mobilePhone, options){
      var json = { mobilePhoneNumber: mobilePhone };
      var request = LC._request("requestMobilePhoneVerify", null, null, "POST",
                                   json);
      return request._thenRunCallbacks(options);
    },


    /**
     * Requests a reset password sms code to be sent to the specified mobile phone
     * number associated with the user account. This sms code allows the user to
     * reset their account's password by calling LC.User.resetPasswordBySmsCode
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {String} mobilePhone The mobile phone number  associated with the
     *                  user that doesn't verify their mobile phone number.
     * @param {Object} options A Backbone-style options object.
     */
    requestPasswordResetBySmsCode: function(mobilePhone, options){
      var json = { mobilePhoneNumber: mobilePhone };
      var request = LC._request("requestPasswordResetBySmsCode", null, null, "POST",
                                   json);
      return request._thenRunCallbacks(options);
    },

    /**
     * Makes a call to reset user's account password by sms code and new password.
    * The sms code is sent by LC.User.requestPasswordResetBySmsCode.
     * @param {String} code The sms code sent by LC.User.Cloud.requestSmsCode
     * @param {String} password The new password.
     * @param {Object} options A Backbone-style options object
     * @return {LC.Promise} A promise that will be resolved with the result
     * of the function.
     */
    resetPasswordBySmsCode: function(code, password, options){
      var json = { password: password};
      var request = LC._request("resetPasswordBySmsCode", null, code, "PUT",
                                json);
      return request._thenRunCallbacks(options);
    },

    /**
     * Makes a call to verify sms code that sent by LC.User.Cloud.requestSmsCode
     * If verify successfully,the user mobilePhoneVerified attribute will be true.
     * @param {String} code The sms code sent by LC.User.Cloud.requestSmsCode
     * @param {Object} options A Backbone-style options object
     * @return {LC.Promise} A promise that will be resolved with the result
     * of the function.
     */
    verifyMobilePhone: function(code, options){
      var request = LC._request("verifyMobilePhone", null, code, "POST",
                                null);
      return request._thenRunCallbacks(options);
    },

    /**
     * Requests a logIn sms code to be sent to the specified mobile phone
     * number associated with the user account. This sms code allows the user to
     * login by LC.User.logInWithMobilePhoneSmsCode function.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {String} mobilePhone The mobile phone number  associated with the
     *           user that want to login by LC.User.logInWithMobilePhoneSmsCode
     * @param {Object} options A Backbone-style options object.
     */
    requestLoginSmsCode: function(mobilePhone, options){
      var json = { mobilePhoneNumber: mobilePhone };
      var request = LC._request("requestLoginSmsCode", null, null, "POST",
                                   json);
      return request._thenRunCallbacks(options);
    },

    /**
     * Retrieves the currently logged in AVUser with a valid session,
     * either from memory or localStorage, if necessary.
     * @return {LC.Object} The currently logged in LC.User.
     */
    current: function() {
      if (LC.User._currentUser) {
        return LC.User._currentUser;
      }

      if (LC.User._currentUserMatchesDisk) {

        return LC.User._currentUser;
      }

      // Load the user from local storage.
      LC.User._currentUserMatchesDisk = true;

      var userData = LC.localStorage.getItem(LC._getAVPath(
          LC.User._CURRENT_USER_KEY));
      if (!userData) {

        return null;
      }
      LC.User._currentUser = LC.Object._create("_User");
      LC.User._currentUser._isCurrentUser = true;

      var json = JSON.parse(userData);
      LC.User._currentUser.id = json._id;
      delete json._id;
      LC.User._currentUser._sessionToken = json._sessionToken;
      delete json._sessionToken;
      LC.User._currentUser._finishFetch(json);
      //LC.User._currentUser.set(json);

      LC.User._currentUser._synchronizeAllAuthData();
      LC.User._currentUser._refreshCache();
      LC.User._currentUser._opSetQueue = [{}];
      return LC.User._currentUser;
    },

    /**
     * Persists a user as currentUser to localStorage, and into the singleton.
     */
    _saveCurrentUser: function(user) {
      if (LC.User._currentUser !== user) {
        LC.User.logOut();
      }
      user._isCurrentUser = true;
      LC.User._currentUser = user;
      LC.User._currentUserMatchesDisk = true;

      var json = user.toJSON();
      json._id = user.id;
      json._sessionToken = user._sessionToken;
      LC.localStorage.setItem(
          LC._getAVPath(LC.User._CURRENT_USER_KEY),
          JSON.stringify(json));
    },

    _registerAuthenticationProvider: function(provider) {
      LC.User._authProviders[provider.getAuthType()] = provider;
      // Synchronize the current user with the auth provider.
      if (LC.User.current()) {
        LC.User.current()._synchronizeAuthData(provider.getAuthType());
      }
    },

    _logInWith: function(provider, options) {
      var user = LC.Object._create("_User");
      return user._linkWith(provider, options);
    }

  });
};
