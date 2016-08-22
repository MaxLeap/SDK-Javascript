'use strict';

var Post = ML.Object.extend('Post');

describe('Objects', function(){
    var objId;
    describe('#Saving Objects', function(){
        it('should crate a Object', function(done){
            var myPost = new Post();
            myPost.set('title', 'post1');
            myPost.set('content', 'Where should we go for lunch?');
            myPost.save().then(function(result){
                objId = result.id;
                done();
            }).catch(done);
        })
    })
});