describe('Analytics', function () {
  describe('#PageView', function(){
    it('should track page begin', function(done){
      var options = {
        appId: '56273907169e7d0001bd5c92',
        userId: '571d7d23a5ff7f0001a4f888',
        appVersion: '1.0'
      };
      var analytics = new ML.Analytics(options);
      analytics.trackPageBegin();
    })
  })
});