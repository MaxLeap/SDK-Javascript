'use strict';

var Post = ML.Object.extend('Post');

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

    it.only('条件查询', function(done){
        var query = new ML.Query(Post);
        query.limit(10);
        // query.exists('content');
        // query.doesNotExist('title');
        // query.equalTo('objectId', '57babf7daa150a0001d09bd8');
        query.notEqualTo('objectId', '57babf7daa150a0001d09bd8');
        query.find().then(function(results){
            expect(results).to.be.an('array');
            done();
        }).catch(done);
    });
});