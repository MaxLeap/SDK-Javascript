describe('Analytics', function () {
  describe('#PageView', function(){
    it('should track page begin', function(done){
      var options = {
        appId: '56273907169e7d0001bd5c92',
        userId: '571d7d23a5ff7f0001a4f888',
        appVersion: '1.0'
      };
      var analytics = new ML.Analytics(options);
      analytics.trackPageBegin().then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    })
  });

  describe('#Event', function(){
    it('should track event', function(done){
      var options = {
        appId: '56273907169e7d0001bd5c92',
        userId: '571d7d23a5ff7f0001a4f888',
        appVersion: '1.0'
      };
      ML.analyticsEnable = false;
      var analytics = new ML.Analytics(options);
      var eventData = {"sex":"man","age":"18"};
      analytics.trackEvent('event1', eventData).then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    })
  });

  describe('#TimelineEvent', function(){
    it('should track login event', function(done){
      var options = {
        appId: '56273907169e7d0001bd5c92',
        userId: '571d7d23a5ff7f0001a4f888',
        appVersion: '1.0'
      };
      ML.analyticsEnable = false;
      var analytics = new ML.Analytics(options);
      var data = {
        eventId: 'logineventid',
        eventName: 'logineventname',
        eventNickName: 'logineventnickname'
      };
      analytics.trackUserlogin(data).then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    });

    it('should track register event', function(done){
      var options = {
        appId: '56273907169e7d0001bd5c92',
        userId: '571d7d23a5ff7f0001a4f888',
        appVersion: '1.0'
      };
      ML.analyticsEnable = false;
      var analytics = new ML.Analytics(options);
      var data = {
        eventId: 'registereventid',
        eventName: 'registereventname',
        eventNickName: 'registereventnickname'
      };
      analytics.trackUserRegister(data).then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    });

    it('should track logout event', function(done){
      var options = {
        appId: '56273907169e7d0001bd5c92',
        userId: '571d7d23a5ff7f0001a4f888',
        appVersion: '1.0'
      };
      ML.analyticsEnable = false;
      var analytics = new ML.Analytics(options);
      var data = {
        eventId: 'logouteventid',
        eventName: 'logouteventname',
        eventNickName: 'logouteventnickname'
      };
      analytics.trackUserLogout(data).then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    });

    it('should track session start event', function(done){
      var options = {
        appId: '56273907169e7d0001bd5c92',
        userId: '571d7d23a5ff7f0001a4f888',
        appVersion: '1.0'
      };
      ML.analyticsEnable = false;
      var analytics = new ML.Analytics(options);
      var data = {
        eventId: 'sessionstartid',
        eventName: 'sessionstartname',
        eventNickName: 'sessionstartnickname'
      };
      analytics.trackSessionStart(data).then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    })
  });

});