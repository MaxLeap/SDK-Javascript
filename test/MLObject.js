'use strict';

var Post = ML.Object.extend('Post');
var Person = ML.Object.extend('Person');
var Comment = ML.Object.extend('Comment');

describe('对象', function(){
    this.timeout(5000);
    var objId;
    describe('#存储对象', function(){
        it('存储单个对象', function(done){
            var post = new Post();
            post.set('title', 'post1');
            post.set('tags', ['Frontend', 'JavaScript']);
            post.set('content', 'Where should we go for lunch?');
            post.save().then(function(result){
                expect(post.id).to.be.ok();
                objId = post.id;
                done();
            }).catch(done);
        });

        it('级联存储对象', function(done){
            var post = new Post();
            var person = new Person();
            var comment = new Comment();
            post.set('title', 'post2');
            person.set('title', 'person');
            comment.set('content', '期待更多信息');
            comment.add('post', post);
            comment.add('person', person);
            comment.save().then(function(result){
                expect(post.id).to.be.ok();
                expect(person.id).to.be.ok();
                expect(comment.id).to.be.ok();
                console.log(comment);
                done();
            }).catch(done);
        });
    });

    describe('#关联对象', function(){
        it('一对一关联', function(done){
            var comment = new Comment();
            var person = new Person();
            person.set('name', 'person1');

            comment.set('content', 'comment content');
            comment.add('person', person);
            comment.save().then(function(comment){
                expect(comment.get('person')[0].id).to.be.ok();
                done();
            })
        });

        it('一对多关联', function(done){
            var comment = new Comment();
            var person1 = new Person();
            var person2 = new Person();
            person1.set('name', 'person1');
            person2.set('name', 'person2');

            comment.set('content', 'comment content');
            comment.add('person', person1);
            comment.add('person', person2);
            comment.save().then(function(comment){
                expect(comment.get('person')[0].id).to.be.ok();
                expect(comment.get('person')[1].id).to.be.ok();
                done();
            })
        });

    });

    describe('#获取对象', function () {
        it('返回被存储的对象', function (done) {
            var query = new ML.Query(Post);
            query.get(objId).then(function(post){
                expect(post.id).to.be(objId);
                done();
            }).catch(done);
        });
    });

    describe('#更新对象', function(){
        it('更新对象属性', function(done){
            var query = new ML.Query(Post);
            query.get('57babd009a19d60001b3500e').then(function(post){
                var title = 'post2';
                post.set('title', title);
                post.save().then(function(post){
                    expect(post.get('title')).to.be.equal(title);
                    done();
                });
            }).catch(done);
        })
    });


    describe('#删除对象', function(){
        it('删除一个对象', function(done){
            var post = new Post();
            post.set('title', 'post1');
            post.save().then(function(){
                post.destroy().then(function(result){
                    expect(result.number).to.be(1);
                    done();
                });
            });
        });

        it('批量删除对象', function(){
            var post1 = new Post();
            var post2 =  new Post();
            post1.set('title', 'post1');
            post2.set('title', 'post2');
            var objects = [post1, post2];
            var promises = [post1.save(), post2.save()];
            Promise.all(promises).then(function(){
                ML.Object.destroyAll(objects).then(function(results){
                    expect(results[0].number).to.be(1);
                    expect(results[1].number).to.be(1);
                    done();
                });
            });


        });
    })
});