'use strict';

var _ = require('underscore');

module.exports = function(LC) {
  /**
   * Contains functions to deal with Status in AVOS Cloud.
   * @name LC.Status
   * @namespace
   */
  LC.Status = function(imageUrl, message) {
    this.data = {};
    this.inboxType = 'default';
    this.query = null;
    if(imageUrl && typeof imageUrl === 'object') {
        this.data = imageUrl;
    } else {
      if(imageUrl){
        this.data.image = imageUrl;
      }
      if(message){
        this.data.message = message;
      }
    }
    return this;
  };

  LC.Status.prototype = {
    /**
     * Gets the value of an attribute in status data.
     * @param {String} attr The string name of an attribute.
     */
    get: function(attr){
      return this.data[attr];
    },
    /**
     * Sets a hash of model attributes on the status data.
     * @param {String} key The key to set.
     * @param {} value The value to give it.
     */
    set: function(key, value){
      this.data[key] = value;
      return this;
    },
    /**
     * Destroy this status,then it will not be avaiable in other user's inboxes.
     * @param {Object} options An optional Backbone-like options object with
     *     success and error callbacks that will be invoked once the iteration
     *     has finished.
     * @return {LC.Promise} A promise that is fulfilled when the destroy
     *     completes.
     */
    destroy: function(options){
      if(!this.id)
        return LC.Promise.error('The status id is not exists.')._thenRunCallbacks(options);
      var request = LC._request("statuses", null, this.id, 'DELETE');
      return request._thenRunCallbacks(options);
    },
    /**
      * Cast the LC.Status object to an LC.Object pointer.
      * @return {LC.Object} A LC.Object pointer.
      */
    toObject: function(){
      if(!this.id)
          return null;
      return LC.Object.createWithoutData('_Status', this.id);
    },
    _getDataJSON: function() {
      var json = LC._.clone(this.data);
      return LC._encode(json);
    },
   /**
    * Send  a status by a LC.Query object.
    * <p>For example,send a status to male users:<br/><pre>
    *     var status = new AVStatus('image url', 'a message');
    *     status.query = new LC.Query('_User');
    *     status.query.equalTo('gender', 'male');
    *     status.send().then(function(){
    *              //send status successfully.
    *      }, function(err){
    *             //an error threw.
    *             console.dir(err);
    *      });
    * </pre></p>
    * @since 0.3.0
    * @param {Object} options An optional Backbone-like options object with
    *     success and error callbacks that will be invoked once the iteration
    *     has finished.
    * @return {LC.Promise} A promise that is fulfilled when the send
    *     completes.
    */
    send: function(options){
      if(!LC.User.current()){
        throw 'Please signin an user.';
      }
      if(!this.query){
        return LC.Status.sendStatusToFollowers(this, options);
      }

      var query = this.query.toJSON();
      query.className = this.query.className;
      var data = {};
      data.query = query;
      this.data = this.data || {};
      var currUser =  LC.Object.createWithoutData('_User', LC.User.current().id)._toPointer();
      this.data.source =  this.data.source || currUser;
      data.data = this._getDataJSON();
      data.inboxType = this.inboxType || 'default';

      var request = LC._request('statuses', null, null, 'POST', data);
      var self = this;
      return request.then(function(response){
        self.id = response.objectId;
        self.createdAt = LC._parseDate(response.createdAt);
        return self;
      })._thenRunCallbacks(options);
    },

    _finishFetch: function(serverData){
        this.id = serverData.objectId;
        this.createdAt = LC._parseDate(serverData.createdAt);
        this.updatedAt = LC._parseDate(serverData.updatedAt);
        this.messageId = serverData.messageId;
        delete serverData.messageId;
        delete serverData.objectId;
        delete serverData.createdAt;
        delete serverData.updatedAt;
        this.data = LC._decode(undefined, serverData);
    }
  };

  /**
   * Send  a status to current signined user's followers.For example:
   * <p><pre>
   *     var status = new AVStatus('image url', 'a message');
   *     LC.Status.sendStatusToFollowers(status).then(function(){
   *              //send status successfully.
   *      }, function(err){
   *             //an error threw.
   *             console.dir(err);
   *      });
   * </pre></p>
   * @since 0.3.0
   * @param {LC.Status} status  A status object to be send to followers.
   * @param {Object} options An optional Backbone-like options object with
   *     success and error callbacks that will be invoked once the iteration
   *     has finished.
   * @return {LC.Promise} A promise that is fulfilled when the send
   *     completes.
   */
  LC.Status.sendStatusToFollowers = function(status, options) {
    if(!LC.User.current()){
      throw 'Please signin an user.';
    }
    var query = {};
    query.className = '_Follower';
    query.keys = 'follower';
    var currUser =  LC.Object.createWithoutData('_User', LC.User.current().id). _toPointer();
    query.where = {user: currUser};
    var data = {};
    data.query = query;
    status.data = status.data || {};
    status.data.source =  status.data.source || currUser;
    data.data = status._getDataJSON();
    data.inboxType = status.inboxType || 'default';

    var request = LC._request('statuses', null, null, 'POST', data);
    return request.then(function(response){
      status.id = response.objectId;
      status.createdAt = LC._parseDate(response.createdAt);
      return status;
    })._thenRunCallbacks(options);
  };

  /**
   * <p>Send  a status from current signined user to other user's private status inbox.</p>
   * <p>For example,send a private status to user '52e84e47e4b0f8de283b079b':<br/>
   * <pre>
   *    var status = new AVStatus('image url', 'a message');
   *     LC.Status.sendPrivateStatus(status, '52e84e47e4b0f8de283b079b').then(function(){
   *              //send status successfully.
   *      }, function(err){
   *             //an error threw.
   *             console.dir(err);
   *      });
   * </pre></p>
   * @since 0.3.0
   * @param {LC.Status} status  A status object to be send to followers.
   * @param {} target The target user or user's objectId.
   * @param {Object} options An optional Backbone-like options object with
   *     success and error callbacks that will be invoked once the iteration
   *     has finished.
   * @return {LC.Promise} A promise that is fulfilled when the send
   *     completes.
   */
  LC.Status.sendPrivateStatus = function(status, target, options) {
    if(!LC.User.current()){
      throw 'Please signin an user.';
    }
    if(!target){
          throw "Invalid target user.";
    }
    var userObjectId = _.isString(target) ? target: target.id;
    if(!userObjectId){
        throw "Invalid target user.";
    }

    var query = {};
    query.className = '_User';
    var currUser =  LC.Object.createWithoutData('_User', LC.User.current().id). _toPointer();
    query.where = {objectId: userObjectId};
    var data = {};
    data.query = query;
    status.data = status.data || {};
    status.data.source =  status.data.source || currUser;
    data.data = status._getDataJSON();
    data.inboxType = 'private';
    status.inboxType = 'private';

    var request = LC._request('statuses', null, null, 'POST', data);
    return request.then(function(response){
      status.id = response.objectId;
      status.createdAt = LC._parseDate(response.createdAt);
      return status;
    })._thenRunCallbacks(options);
  };

  /**
   * Count unread statuses in someone's inbox.For example:<br/>
   * <p><pre>
   *  LC.Status.countUnreadStatuses(LC.User.current()).then(function(response){
   *    console.log(response.unread); //unread statuses number.
   *    console.log(response.total);  //total statuses number.
   *  });
   * </pre></p>
   * @since 0.3.0
   * @param {Object} source The status source.
   * @return {LC.Query} The query object for status.
   * @return {LC.Promise} A promise that is fulfilled when the count
   *     completes.
   */
  LC.Status.countUnreadStatuses = function(owner){
    if(!LC.User.current() && owner == null){
      throw 'Please signin an user or pass the owner objectId.';
    }
    owner = owner || LC.User.current();
    var options = !_.isString(arguments[1]) ? arguments[1] : arguments[2];
    var inboxType =  !_.isString(arguments[1]) ? 'default' : arguments[1];
    var params = {};
    params.inboxType = LC._encode(inboxType);
    params.owner = LC._encode(owner);
    var request = LC._request('subscribe/statuses/count', null, null, 'GET', params);
    return request._thenRunCallbacks(options);
  };

  /**
   * Create a status query to find someone's published statuses.For example:<br/>
   * <p><pre>
   *   //Find current user's published statuses.
   *   var query = LC.Status.statusQuery(LC.User.current());
   *   query.find().then(function(statuses){
   *      //process statuses
   *   });
   * </pre></p>
   * @since 0.3.0
   * @param {Object} source The status source.
   * @return {LC.Query} The query object for status.
   */
  LC.Status.statusQuery = function(source){
    var query = new LC.Query('_Status');
    if(source){
      query.equalTo('source', source);
    }
    return query;
  };

   /**
    * <p>LC.InboxQuery defines a query that is used to fetch somebody's inbox statuses.</p>
    * @see LC.Status#inboxQuery
    * @class
    */
   LC.InboxQuery = LC.Query._extend(/** @lends LC.InboxQuery.prototype */{
     _objectClass: LC.Status,
     _sinceId: 0,
     _maxId:  0,
     _inboxType: 'default',
     _owner: null,
     _newObject: function(){
      return new LC.Status();
    },
    _createRequest: function(params){
      return LC._request("subscribe/statuses", null, null, "GET",
                                   params || this.toJSON());
    },


    /**
     * Sets the messageId of results to skip before returning any results.
     * This is useful for pagination.
     * Default is zero.
     * @param {Number} n the mesage id.
     * @return {LC.InboxQuery} Returns the query, so you can chain this call.
     */
    sinceId: function(id){
      this._sinceId = id;
      return this;
    },
    /**
     * Sets the maximal messageId of results。
     * This is useful for pagination.
     * Default is zero that is no limition.
     * @param {Number} n the mesage id.
     * @return {LC.InboxQuery} Returns the query, so you can chain this call.
     */
    maxId: function(id){
      this._maxId = id;
      return this;
    },
    /**
     * Sets the owner of the querying inbox.
     * @param {Object} owner The inbox owner.
     * @return {LC.InboxQuery} Returns the query, so you can chain this call.
     */
    owner: function(owner){
      this._owner = owner;
      return this;
    },
    /**
     * Sets the querying inbox type.default is 'default'.
     * @param {Object} owner The inbox type.
     * @return {LC.InboxQuery} Returns the query, so you can chain this call.
     */
    inboxType: function(type){
      this._inboxType = type;
      return this;
    },
    toJSON: function(){
      var params = LC.InboxQuery.__super__.toJSON.call(this);
      params.owner = LC._encode(this._owner);
      params.inboxType = LC._encode(this._inboxType);
      params.sinceId = LC._encode(this._sinceId);
      params.maxId = LC._encode(this._maxId);
      return params;
    }
   });

  /**
   * Create a inbox status query to find someone's inbox statuses.For example:<br/>
   * <p><pre>
   *   //Find current user's default inbox statuses.
   *   var query = LC.Status.inboxQuery(LC.User.current());
   *   //find the statuses after the last message id
   *   query.sinceId(lastMessageId);
   *   query.find().then(function(statuses){
   *      //process statuses
   *   });
   * </pre></p>
   * @since 0.3.0
   * @param {Object} owner The inbox's owner
   * @param {String} inboxType The inbox type,'default' by default.
   * @return {LC.InboxQuery} The inbox query object.
   * @see LC.InboxQuery
   */
  LC.Status.inboxQuery = function(owner, inboxType){
    var query = new LC.InboxQuery(LC.Status);
    if(owner){
      query._owner = owner;
    }
    if(inboxType){
      query._inboxType = inboxType;
    }
    return query;
  };

};
