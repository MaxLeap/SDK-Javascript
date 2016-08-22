import 'whatwg-fetch';
import ML from './MLConfig';
import MLObject from './MLObject';

class MLQuery{
    constructor(objectClass){
        this._where = {};
        this._limit = -1;
        this._skip = 0;
        this._objectClass = objectClass;
        this._className = objectClass.prototype._className;
    }

    get(id){
        console.log(id);
        let params = {};
        params.where = {
            objectId: id
        };
        return _request(params)
    }

    first(){
        return this._request({
            limit: 1
        }).then(res=>{
            return res[0];
        })
    }

    _request=(params)=>{
        return fetch(`${ML.serverURL}2.0/classes/${this._className}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-ML-AppId': ML.appId,
                'X-ML-APIKey': ML.restApiKey
            },
            body: JSON.stringify(params)
        }).then(res=>res.json())
            .then(this._buildResult);
    }

    _buildResult=(res)=>{
        return res.results.map(item=>{
            let obj = new this._objectClass(item);
            obj.id = obj.attributes.objectId;
            this._cleanAttrs(obj);
            return obj;
        })
    }

    _cleanAttrs=(object)=>{
        let attrs = ['createdAt', 'updatedAt'];
        for(let attr of attrs){
            delete object.attributes[attr];
        }
    }
}

ML.Query = MLQuery;

export default ML;