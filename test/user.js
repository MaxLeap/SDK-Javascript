describe('User', function(){
  this.timeout(5000);
  var r = new Date().getTime();
  var username = 'my name' + r;
  var password = 'my pass';
  var email = r + 'tester@example.com';

  describe('#SignUp', function(){
    it('should signup a user', function(done){
      var user = new ML.User();
      user.set('username', username);
      user.set('password', password);
      user.set('email', email);
      user.signUp().then(function(user){
        expect(user).to.be.ok();
        expect(user.authenticated()).to.be(true);
        done();
      }).catch(done);
    });

    it('should signup an anonymous user', function(done){
      var user = new ML.User();
      user.anonymousSignUp().then(function(user){
        expect(user.id).to.be.ok();
        done();
      }).catch(done);
    });

    it('should respond username already taken', function(done){
      var user = new ML.User();
      user.set('username', username);
      user.set('password', password);
      user.set('email', email);

      user.signUp().then(function(){
        throw new Error('should not success');
      }, function(err){
        expect(err.code).to.be.equal(ML.Error.USERNAME_TAKEN);
        done();
      }).catch(done);
    });

    it('should respond email already taken', function(done){
      var user = new ML.User();
      user.set('username', 'my name1');
      user.set('password', 'my pass');
      user.set('email', email);

      user.signUp().then(function(){
        throw new Error('should not success');
      }, function(err){
        expect(err.code).to.be.equal(ML.Error.EMAIL_TAKEN);
        done();
      }).catch(done);
    });
  });

  describe('#Login', function(){
    it('should login a user', function(done){
      ML.User.logIn(username, password).then(function(user){
        expect(user.authenticated()).to.be(true);
        done();
      }).catch(done);
    });

    //it.only('should login with wechat', function(){
    //});

    it('should respond missing username', function(done) {
      var user = new ML.User();
      user.setPassword(password);
      user.logIn().then(function(){
        throw new Error('should not login');
      }, function(err){
        expect(err.code).to.be.equal(ML.Error.USERNAME_MISSING);
        done();
      }).catch(done);
    });

    it('should respond missing password', function(done) {
      var user = new ML.User();
      user.setUsername(username);
      user.logIn().then(function(){
        throw new Error('should not login');
      }, function(err){
        expect(err.code).to.be.equal(ML.Error.PASSWORD_MISSING);
        done();
      }).catch(done);
    });

    it('Login username not existed', function(done) {
      ML.User.logIn('invalid username', password).then(function(){
        throw new Error('should not login');
      }, function(err){
        expect(err.code).to.be(ML.Error.NOT_FIND_USER);
        done();
      }).catch(done);
    });

    it('Login password wrong', function(done) {
      ML.User.logIn(username, 'my wrong pass').then(function(){
        throw new Error('should not login');
      }, function(err){
        expect(err.code).to.be(ML.Error.PASSWORD_MISMATCH);
        done();
      }).catch(done);
    });
  });

  describe('Current User', function () {
    it('should return current user', function () {
      var currentUser = ML.User.current();
      expect(currentUser).to.be.ok();
    });
  });

  describe('#Password', function(){
    it('should change password with oldpassword be verified', function(done){
      var user = ML.User.current();
      var newpass = 'newpass';
      user.updatePassword(password, newpass).then(function(result){
        expect(result.number).to.be.equal(1);
        done();
      }).catch(done);
    });

    it('should change password', function(done){
      var user = ML.User.current();
      var newpass = 'newpass1';
      user.set('password', newpass);
      user.save().then(function(){
        ML.User.logIn(username, newpass).then(function(user){
          expect(user.authenticated()).to.be(true);
          done();
        }).catch(done);
      });
    });

    it('should send reset password email', function(done){
      ML.User.requestPasswordReset(email).then(function(result){
        expect(result.success).to.be(true);
        done();
      }).catch(done);
    });
  });

  describe('#Logout', function () {
    //由于sdk其他测试依赖用户登录，所以跳过logout
    it.skip('should logout current user', function () {
      ML.User.logOut();
      var currentUser = ML.User.current();
      expect(currentUser).to.be(null);
    });
  });
});
