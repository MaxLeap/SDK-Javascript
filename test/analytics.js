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
    it.only('should track event', function(done){
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

});