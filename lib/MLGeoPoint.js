import 'whatwg-fetch';
import ML from './MLConfig';

/** ML 地理位置 */
class MLGeoPoint {
    constructor(arg1, arg2){
        this.latitude = arg1;
        this.longitude = arg2;
    }

    static current(options){
        return new Promise((resolve, reject)=>{
            window.navigator.geolocation.getCurrentPosition(location=>{
                resolve(new ML.GeoPoint(location.coords.latitude, location.coords.longitude), error=>{
                    reject(error);
                });
            });
        });
    }

    radiansTo(point){
        let d2r = Math.PI / 180.0;
        let lat1rad = this.latitude * d2r;
        let long1rad = this.longitude * d2r;
        let lat2rad = point.latitude * d2r;
        let long2rad = point.longitude * d2r;
        let deltaLat = lat1rad - lat2rad;
        let deltaLong = long1rad - long2rad;
        let sinDeltaLatDiv2 = Math.sin(deltaLat / 2);
        let sinDeltaLongDiv2 = Math.sin(deltaLong / 2);
        let a = ((sinDeltaLatDiv2 * sinDeltaLatDiv2) +
        (Math.cos(lat1rad) * Math.cos(lat2rad) *
        sinDeltaLongDiv2 * sinDeltaLongDiv2));
        a = Math.min(1.0, a);
        return 2 * Math.asin(Math.sqrt(a));
    }

    kilometersTo(point){
        return this.radiansTo(point) * 6371.0;
    }

    milesTo(point){
        return this.radiansTo(point) * 3958.8;
    }

    toJSON(){
        return {
            "__type": "GeoPoint",
            latitude: this.latitude,
            longitude: this.longitude
        };
    }

}

ML.GeoPoint = MLGeoPoint;

export default ML;