import 'whatwg-fetch';
import ML from './MLConfig';
import MLObject from './MLObject';

class MLQuery {
    constructor(objectClass) {
        this._where = {};
        this._limit = -1;
        this._skip = 0;
        this._objectClass = objectClass;
        this._className = objectClass.prototype._className;
    }

    get(id) {
        let params = {};
        params.where = {
            objectId: id
        };
        return _request(params);
    }

    first() {
        return this._request({
            limit: 1
        }).then(this._buildResult)
            .then(res=> {
                return res[0];
            })
    }

    find() {
        let params = this._createParams();
        return this._request(params)
            .then(this._buildResult);
    }

    count() {
        var params = this._createParams();

        //仅当 limit 为 0 时, 服务器才不会返回实体数据
        params.limit = 0;
        //设置 count 为 1, 让服务器返回 count
        params.count = 1;

        return this._request(params)
            .then(res=> {
                return res.count;
            });
    }

    limit(n) {
        this._limit = n;
        return this;
    }

    skip(n) {
        this._skip = n;
        return this;
    }

    ascending(key) {
        this._order = key;
        return this;
    }

    descending(key) {
        this._order = '-' + key;
        return this;
    }

    exists(key){
        if(key === 'objectId'){
            console.warn('objectId 一定会存在, 不能作为 exists 条件');
        }
        this._where[key] = {$exists: true};
        return this;
    }

    doesNotExist(key){
        if(key === 'objectId'){
            console.warn('objectId 一定会存在, 不能作为 exists 条件');
        }
        this._where[key] = {$exists: false};
        return this;
    }

    equalTo(key, value){
        this._where[key] = value;
        return this;
    }

    notEqualTo(key, value){
        this._where[key] = {$ne: value};
        return this;
    }

    greaterThan(key, value){
        this._where[key] = {$gt: value};
        return this;
    }

    lessThan(key, value){
        this._where[key] = {$lt: value};
        return this;
    }

    _createParams() {
        let params = {
            where: this._where
        };

        if (this._limit >= 0) {
            params.limit = this._limit;
        }
        if (this._skip > 0) {
            params.skip = this._skip;
        }
        if (this._order !== undefined) {
            params.order = this._order;
        }
        return params;
    }

    _request = (params)=> {
        return fetch(`${ML.serverURL}2.0/classes/${this._className}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-ML-AppId': ML.appId,
                'X-ML-APIKey': ML.restApiKey
            },
            body: JSON.stringify(params)
        }).then(res=>res.json());
    }

    _buildResult = (res)=> {
        return res.results.map(item=> {
            let obj = new this._objectClass(item);
            obj.id = obj.attributes.objectId;
            this._cleanAttrs(obj);
            return obj;
        })
    }

    _cleanAttrs = (object)=> {
        let attrs = ['createdAt', 'updatedAt'];
        for (let attr of attrs) {
            delete object.attributes[attr];
        }
    }
}

ML.Query = MLQuery;

export default ML;