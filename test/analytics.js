var appId = '572afb8a667a230001e5642a';
var userId = '572aaf3c70c6760001495048';
describe('Analytics', function () {
  describe('#PageView', function(){
    it('should track page begin', function(done){
      var options = {
        appId: appId,
        userId: userId,
        appVersion: '1.0',
        channel: '360'
      };
      var analytics = new ML.Analytics(options);
      analytics.trackPageBegin().then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    })
  });

  describe('#CustomEvent', function(){
    it('should track event', function(done){
      var options = {
        appId: appId,
        userId: userId,
        appVersion: '1.0'
      };
      var analytics = new ML.Analytics(options);
      var eventData = {"gender":"male","age":"18"};
      analytics.trackEvent('event1', eventData).then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    })
  });

  describe('#TimelineEvent', function(){
    it('should track login event', function(done){
      var options = {
        appId: appId,
        userId: userId,
        appVersion: '1.0'
      };
      var analytics = new ML.Analytics(options);
      var data = {
        eventId: 'logineventid'
      };
      analytics.trackUserlogin(data).then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    });

    it('should track register event', function(done){
      var options = {
        appId: appId,
        userId: userId,
        appVersion: '1.0'
      };
      var analytics = new ML.Analytics(options);
      var data = {
        eventId: 'registereventid'
      };
      analytics.trackUserRegister(data).then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    });

    it('should track logout event', function(done){
      var options = {
        appId: appId,
        userId: userId,
        appVersion: '1.0'
      };
      var analytics = new ML.Analytics(options);
      var data = {
        eventId: 'logouteventid'
      };
      analytics.trackUserLogout(data).then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    });

    it('should track session start event', function(done){
      var options = {
        appId: appId,
        userId: userId,
        appVersion: '1.0'
      };
      var analytics = new ML.Analytics(options);
      var data = {
        eventId: 'sessionstartid'
      };
      analytics.trackSessionStart(data).then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    })
  });

  describe('#TrackOriginEvent', function(){
    it('should track origin event', function(done){
      var options = {
        appId: appId,
        userId: userId,
        appVersion: '1.0'
      };
      var analytics = new ML.Analytics(options);
      var data = [{
        "distinct_id": "2b0a6f51a3cd6775",
        "time": 1434556935000,
        "type": "track",
        "event": "ViewProduct",
        "properties": {
          "_manufacturer":"Apple",
          "_model": "iPhone 5",
          "_os":"iOS",
          "_os_version":"7.0",
          "_app_version":"1.3",
          "_wifi":true,
          "_ip":"180.79.35.65",
          "_province":"湖南",
          "_city":"长沙",
          "_screen_width":320,
          "_screen_height":640,
          "product_id":123451231231212,
          "product_name":"苹果",
          "product_classify":"水果",
          "product_price":14.0
        }
      }];
      analytics.trackOriginEvent(data).then(function(res){
        expect(res.errorCode).to.be(0);
        done();
      }).catch(done);
    });
  });
});