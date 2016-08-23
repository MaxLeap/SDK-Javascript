'use strict';

var Post = ML.Object.extend('Post');
var Comment = ML.Object.extend('Comment');

describe('查询', function(){
    it('返回一个对象',function(done){
        var query = new ML.Query(Post);
        query.first().then(function(result){
            expect(result).to.be.ok();
            done();
        }).catch(done);
    });

    it('返回一个数组', function(done){
        var query = new ML.Query(Post);
        query.find().then(function(results){
            expect(results).to.be.an('array');
            done();
        }).catch(done);
    });

    it('返回结果个数', function(done){
        var query = new ML.Query(Post);
        query.count().then(function(result){
            expect(result).to.be.an('number');
            done();
        }).catch(done);
    });

    it('条件查询', function(done){
        var query = new ML.Query(Post);
        query.limit(10);
        query.skip(1);
        query.exists('content');
        query.doesNotExist('title');
        query.equalTo('objectId', '57babf7daa150a0001d09bd8');
        query.notEqualTo('objectId', '57babf7daa150a0001d09bd8');
        query.greaterThan('score', 7);
        query.containedIn('name', ['henry', 'zhou']);
        query.notContainedIn('name', ['bai']);
        query.containsAll('name', ['henry', 'frank']);
        query.ascending('title');
        query.descending('title');
        query.endsWith('name', 'bai');
        query.find().then(function(results){
            expect(results).to.be.an('array');
            done();
        }).catch(done);
    });

    it('关系查询', function(done){
        var query = new ML.Query(Post);
        query.first().then(function(post){
            query = new ML.Query(Comment);
            query.equalTo('post', post);
            query.find().then(function(results){
                expect(results).to.be.an('array');
                done();
            });
        }).catch(done);
    });

    it('子查询', function(done){
        var innerQuery = new ML.Query(Post);
        innerQuery.exists('image');

        var query = new ML.Query(Comment);
        query.matchesQuery('post', innerQuery);
        query.doesNotMatchQuery('post', innerQuery);
        query.find().then(function(comments) {
            expect(comments).to.be.an('array');
            done();
        });
    });

    it('select & fetch', function(done){
        var query = new ML.Query(Post);
        query.select('title', 'content');
        query.first().then(function(result){
            result.fetch().then(function(obj){
                expect(obj).to.be.ok();
                done();
            });
        }).catch(done);
    });
});