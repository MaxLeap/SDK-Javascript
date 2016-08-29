import 'whatwg-fetch';
import ML from './MLConfig';
import MLObject from './MLObject';

/** ML 查询 */
class MLQuery {
    /**
     * 初始化 ML.Query
     * @param {ML.Object} objectClass - ML.Object 子类
     */
    constructor(objectClass) {
        this._objectClass = objectClass;
        this._className = objectClass.prototype._className;
        this._params = {
            where: {}
        };
    }

    /**
     * 根据 id 查询记录
     * @param {string} id - objectId
     * @returns {Promise}
     */
    get(id) {
        this._params.where['objectId'] = id;
        return this.first();
    }

    /**
     * 返回符合条件的第一条记录
     * @returns {Promise}
     */
    first() {
        this._params.limit = 1;
        let params = this._createParams();

        return this._request(params)
            .then(this._buildResult)
            .then(res=> {
                return res[0];
            })
    }

    /**
     * 返回符合条件的所有记录
     * @returns {Promise}
     */
    find() {
        let params = this._createParams();
        return this._request(params)
            .then(this._buildResult);
    }

    /**
     * 返回符合条件的记录数
     * @returns {Promise}
     */
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

    /**
     * 设置最大返回记录数
     * @param {number} n - 最大返回记录数
     * @returns {ML.Query}
     */
    limit(n) {
        this._params.limit = n;
        return this;
    }

    /**
     * 设置跳过的记录数
     * @param {number} n - 跳过记录的条数
     * @returns {ML.Query}
     */
    skip(n) {
        this._params.skip = n;
        return this;
    }

    /**
     * 设置排序为正序
     * @param {string} key - 正序
     * @returns {ML.Query}
     */
    ascending(key) {
        this._params.order = key;
        return this;
    }

    /**
     * 设置排序为逆序
     * @param {string} key - 逆序
     * @returns {ML.Query}
     */
    descending(key) {
        this._params.order = `-${key}`;
        return this;
    }

    /**
     * 存在 key 的记录
     * @param {string} key
     * @returns {ML.Query}
     */
    exists(key){
        if(key === 'objectId'){
            console.warn('objectId 一定会存在, 不能作为 exists 条件');
        }
        this._params.where[key] = {$exists: true};
        return this;
    }

    /**
     * 不存在 key 的记录
     * @param {string} key
     * @returns {ML.Query}
     */
    doesNotExist(key){
        if(key === 'objectId'){
            console.warn('objectId 一定会存在, 不能作为 exists 条件');
        }
        this._params.where[key] = {$exists: false};
        return this;
    }

    /**
     * key 等于 value 的记录
     * @param {string} key
     * @param {string} value
     * @returns {ML.Query}
     */
    equalTo(key, value){
        if(value instanceof ML.Object){
            value = {
                __type: 'Pointer',
                className: value._className,
                objectId: value.id
            };
        }

        this._params.where[key] = value;
        return this;
    }

    /**
     * key 不等于 value 的记录
     * @param {string} key
     * @param {string} value
     * @returns {ML.Query}
     */
    notEqualTo(key, value){
        this._params.where[key] = {$ne: value};
        return this;
    }

    greaterThan(key, value){
        this._params.where[key] = {$gt: value};
        return this;
    }

    lessThan(key, value){
        this._params.where[key] = {$lt: value};
        return this;
    }

    greaterThanOrEqualTo(key, value){
        this._params.where[key] = {$gte: value};
        return this;
    }

    lessThanOrEqualTo(key, value){
        this._params.where[key] = {$lte: value};
        return this;
    }

    containedIn(key, values){
        this._params.where[key] = {$in: values};
        return this;
    }

    notContainedIn(key, values){
        this._params.where[key] = {$nin: values};
        return this;
    }

    containsAll(key, values){
        this._params.where[key] = {$all: values};
        return this;
    }

    startsWith(key, value){
        this._params.where[key] = {$regex: `^${this._quote(value)}` };
        return this;
    }

    endsWith(key, value){
        this._params.where[key] = {$regex: `${this._quote(value)}$` };
        return this;
    }

    select(...keys){
        this._params.keys = keys.join(',');
        return this;
    }

    matchesQuery(key, query){
        let innerQueryParams = query._params;
        innerQueryParams.className = query._className;
        this._params.where[key] = {$inQuery: innerQueryParams};
        return this;
    }

    doesNotMatchQuery(key, query){
        let innerQueryParams = query._params;
        innerQueryParams.className = query._className;
        this._params.where[key] = {$notInQuery: innerQueryParams};
        return this;
    }

    near(key, point){
        this._params.where[key] = {$nearSphere: point};
        return this;
    }

    withinRadians(key, point, distance){
        this.near(key, point);
        this._params.where[key] = {$maxDistance: distance};
        return this;
    }

    withinMiles(key, point, distance){
        return this.withinRadians(key, point, distance / 3958.8);
    }

    withinKilometers(key, point, distance){
        return this.withinRadians(key, point, distance / 6371.0);
    }

    withinGeoBox(key, southwest, northeast){
        this._params.where[key] = {$within: { '$box': [southwest, northeast] }};
        return this;
    }

    _quote(s) {
        return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
    }

    _createParams() {
        return this._params;
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