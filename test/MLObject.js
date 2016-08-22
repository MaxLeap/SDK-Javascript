'use strict';

var Post = ML.Object.extend('Post');

describe('Objects', function(){
    var objId;
    describe('#Saving Objects', function(){
        it('should crate a Object', function(done){
            var post = new Post();
            post.set('title', 'post1');
            post.set('content', 'Where should we go for lunch?');
            post.save().then(function(result){
                expect(post.id).to.be.ok();
                objId = post.id;
                done();
            }).catch(done);
        })
    });

    describe('#Retrieving Objects', function () {
        it('should be the just save Object', function (done) {
            var query = new ML.Query(Post);
            query.get(objId).then(function(post){
                expect(post.id).to.be(objId);
                done();
            }).catch(done);
        });
    });
});