'use strict';

var Post = ML.Object.extend('Post');
var Person = ML.Object.extend('Person');
var Comment = ML.Object.extend('Comment');

describe('Objects', function(){
    var objId;
    describe('#存储对象', function(){
        it('存储单个对象', function(done){
            var post = new Post();
            post.set('title', 'post1');
            post.set('content', 'Where should we go for lunch?');
            post.save().then(function(result){
                expect(post.id).to.be.ok();
                objId = post.id;
                done();
            }).catch(done);
        });

        it.only('级联存储对象', function(done){
            var post = new Post();
            var person = new Person();
            var comment = new Comment();
            post.set('title', 'post2');
            person.set('title', 'person');
            comment.set('content', '期待更多信息');
            comment.add('post', post);
            comment.save().then(function(result){
                console.log(person);
                expect(comment.id).to.be.ok();
                done();
            }).catch(done);
        });
    });

    describe('#获取对象', function () {
        it('should be the just save Object', function (done) {
            var query = new ML.Query(Post);
            query.get(objId).then(function(post){
                expect(post.id).to.be(objId);
                done();
            }).catch(done);
        });
    });
});