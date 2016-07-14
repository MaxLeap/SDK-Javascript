describe('CloudCode', function(){
  describe('#CloudFunction', function(){
    it('shoud call cloudfunction', function(done){
      var data = {
        "artistName" : "Gagagaga",
        "name" : "bybyby"
      };

      var cloudCode = new ML.CloudCode();
      cloudCode.callFunctionInBackground('hello', data)
        .then(function(res){
          expect(res.name).to.be.ok();
          done();
        }).catch(done);
    });
  })
});