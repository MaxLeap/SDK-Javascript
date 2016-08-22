'use strict';

var Post = ML.Object.extend('Post');
var query = new ML.Query(Post);

describe('Query', function(){
    it.only('should return an object',function(done){
        query.first().then(function(result){
            expect(result).to.be.ok();
            done();
        }).catch(done);
    });
});