var post;
var Post = ML.Object.extend('Post');

describe.only('地理位置', function(){
    this.timeout(5000);
    it('当前地理位置', function (done) {
        ML.GeoPoint.current().then(function(result){
            expect(result.latitude).to.be.ok();
            expect(result.longitude).to.be.ok();
            done();
        });
    });
    it('创建带有地理位置属性的对象', function(done){
        post = new Post();
        post.set('title', 'Post Geopoint');
        var geoPoint = new ML.GeoPoint(40, -30);
        post.set('location', geoPoint);
        post.save().then(function(post){
            expect(post.get('location')).to.be.ok();
            done();
        }).catch(done);
    });

    it('near',function(done){
        var geoPoint = new ML.GeoPoint(10, 10);
        var query = new ML.Query(Post);
        query.near('location', geoPoint);
        query.find().then(function(results){
            expect(results).to.be.an('array');
            done();
        }).catch(done);
    });

    it('radiansTo', function(){
        var geoPoint = new ML.GeoPoint(40, -30);
        var geoPoint2 = new ML.GeoPoint(40, -20);

        var radians = geoPoint.radiansTo(geoPoint2);
        expect(radians).to.be.ok();
    });

    it('milesTo', function(){
        var geoPoint = new ML.GeoPoint(40, -30);
        var geoPoint2 = new ML.GeoPoint(40, -20);

        var miles = geoPoint.milesTo(geoPoint2);
        expect(miles).to.be.ok();
    });

    it('kilometersTo', function(){
        var geoPoint = new ML.GeoPoint(40, -30);
        var geoPoint2 = new ML.GeoPoint(40, -20);

        var kilometers = geoPoint.kilometersTo(geoPoint2);
        expect(kilometers).to.be.ok();
    });

    it('within geobox', function(done){
        var query = new ML.Query(Post);
        var southwest = new ML.GeoPoint(39.97, 116.33);
        var northeast = new ML.GeoPoint(39.99, 116.37);
        query.withinGeoBox('location', southwest, northeast);
        query.limit(10);
        query.find().then(function(results){
            expect(results).to.be.an('array');
            done();
        }).catch(done);
    });
});


