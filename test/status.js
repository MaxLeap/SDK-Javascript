function errorProcessor(err){
  throw err;
}
describe("LC.Status",function(){
  this.timeout(10000);
  describe("Send status.",function(){
    it("should send status to followers.",function(done){
      var status = new LC.Status('image url', 'message');
      LC.Status.sendStatusToFollowers(status).then(function(status){
        debug(status);
        done();
      }, errorProcessor);
    });

    it("should send private status to an user.",function(done){
      var status = new LC.Status('image url', 'message');
      LC.Status.sendPrivateStatus(status, '52f9be45e4b035debf88b6e2').then(function(status){
        debug(status);
        done();
      }, errorProcessor);
    });

    it("should send  status to a female user.",function(done){
      var status = new LC.Status('image url', 'message');
      status.query = new LC.Query('_User');
      status.query.equalTo('gender', 'female');
      status.send().then(function(status){
        debug(status);
        done();
      }, errorProcessor);
    });
  });

  describe("Query statuses.", function(){
    it("should return unread count.", function(done){
      LC.Status.countUnreadStatuses(null, function(response){
        debug(response);
        expect(response.total).to.be.greaterThan(0);
        expect(response.unread).to.be.greaterThan(0);
        done();
      });
    });

    it("should return unread count that is greater than zero.", function(done){
      LC.Status.countUnreadStatuses(LC.Object.createWithoutData('_User', '52f9be45e4b035debf88b6e2'),'private', function(response){
        debug(response);
        expect(response.total).to.be.greaterThan(0);
        expect(response.unread).to.be.greaterThan(0);
        done();
      });
    });
    it("should return private statuses.", function(done){
      var query = LC.Status.inboxQuery(LC.Object.createWithoutData('_User', '52f9be45e4b035debf88b6e2'), 'private');
      query.find().then(function(statuses){
        debug(statuses);
        done();
      }, errorProcessor);
    });
    it("should return published statuses.", function(done){
      var query = LC.Status.statusQuery(LC.User.current());
      query.find().then(function(statuses){
        debug(statuses);
        done();
      }, errorProcessor);
    });
  });

  describe("Status guide test.", function(){
    //follow 52f9be45e4b035debf88b6e2
    //unfolow 52f9be45e4b035debf88b6e2
    var targetUser = '52f9be45e4b035debf88b6e2';
    it("should follow/unfollow successfully.", function(done){
      LC.User.current().follow(targetUser).then(function(){
        var query = LC.User.current().followeeQuery();
        query.include('followee');
        query.find().then(function(followees){
          debug(followees);
          expect(followees.length).to.be(1);
          expect(followees[0].id).to.be('52f9be45e4b035debf88b6e2');
          expect(followees[0].get('username')).to.be('u625');
          LC.User.current().unfollow(targetUser).then(function(){
            var query = LC.User.current().followeeQuery();
            query.include('followee');
            query.find().then(function(followees){
              debug(followees);
              expect(followees.length).to.be(0);
              done();
            }, errorProcessor);
          }, errorProcessor);
        }, errorProcessor);
      }, errorProcessor);
    }, errorProcessor);
    var targetUserObject = LC.Object.createWithoutData('_User', targetUser);
    it("should send statuses.", function(done){
      //send private status to  targetUser
      LC.Status.countUnreadStatuses(targetUserObject, 'private').then(function(result){
        debug(result);
        var total = result.total;
        var unread  = result.unread;
        var status = new LC.Status(null, '秘密消息');
        LC.Status.sendPrivateStatus(status, targetUser).then(function(status){
          expect(status.id).to.be.ok();
          setTimeout(function(){
            LC.Status.countUnreadStatuses(targetUserObject, 'private').then(function(result){
              debug(result);
              expect(result.total).to.be(total + 1);
              expect(result.unread).to.be(unread+1);
              //query private statuses
              var query = LC.Status.inboxQuery(targetUserObject, 'private');
              query.find().then(function(statuses){
                expect(statuses[0].get('message')).to.be('秘密消息');
                LC.Status.countUnreadStatuses(targetUserObject, 'private').then(function(result){
                  debug(result);
                  expect(result.total).to.be(total + 1);
                  expect(result.unread).to.be(0);
                  done();
                },errorProcessor);
              }, errorProcessor);
            }, errorProcessor);
          },3000);
        }, errorProcessor);
      }, errorProcessor);
    });
  });
});
