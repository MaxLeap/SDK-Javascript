var appId = '572afb8a667a230001e5642a';
var userId = '572aaf3c70c6760001495048';
describe('Analytics', function () {
  describe('#PageView', function(){
    it('should track page begin', function(done){
      var options = {
        appId: appId,
        userId: userId,
        appVersion: '1.0'
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

});