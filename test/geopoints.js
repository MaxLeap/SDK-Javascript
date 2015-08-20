var post;
var Post = ML.Object.extend('Post');

describe('Geopoints', function(){
  it('save object with geopoint', function(done){
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
    var postGeoPoint = post.get('location');
    var query = new ML.Query(Post);
    query.near('location', postGeoPoint);
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


