import 'whatwg-fetch';
import ML from './MLConfig';

/** MLObject */
class MLObject {
    /**
     * 根据 props 初始化 MLObject
     * @param {object} props
     */
    constructor(props) {
        this.attributes = props || {};
        this._batchRequest = [];
        this._opAddQueue = [];
    }


    /**
     * 创建 MLObject 子类
     * @param {string} className - 子类名
     * @param {object} protoProps - 实例属性
     * @param {object} staticProps - 静态属性
     * @returns {MLObject} {Child} - MLObject 子类
     */
    static extend(className, protoProps, staticProps) {
        //User 是 ML 保留字段
        if (className === 'User') {
            className = '_User';
        }

        class Child extends MLObject {
            constructor(props) {
                super(props);
            }
        }

        Child.prototype._className = className;

        return Child;
    }

    set(key, value) {
        this.attributes[key] = value;
    }

    get(key) {
        return this.attributes[key];
    }

    /**
     * 存储对象
     * @param attrs
     */
    save(attrs) {

        this.deepSave();



        for (let key in attrs) {
            this.set(key, attrs[key]);
        }
        return fetch(`${ML.serverURL}2.0/classes/${this._className}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-ML-AppId': ML.appId,
                'X-ML-APIKey': ML.restApiKey
            },
            body: JSON.stringify(this.attributes)
        }).then(res=>res.json())
            .then(this._buildResult);
    }

    deepSave(){
        let childKeys = Object.keys(this._opAddQueue);

        if(childKeys.length){
            return fetch(`${ML.serverURL}2.0/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-ML-AppId': ML.appId,
                    'X-ML-APIKey': ML.restApiKey
                },
                body: JSON.stringify(this.attributes)
            }).then(res=>res.json())
                .then(res=>{
                    console.log(res);
                });
        }
    }

    add(key, value){
        this._opAddQueue[key] = {
            body: value.attributes,
            method: 'POST',
            path: `/2.0/classes/${value._className}`
        }

    }

    fetch(){
        return fetch(`${ML.serverURL}2.0/classes/${this._className}/${this.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-ML-AppId': ML.appId,
                'X-ML-APIKey': ML.restApiKey
            }
        }).then(res=>res.json())
            .then(this._buildResult);
    }

    _buildResult=(res)=>{
        this.id = res.objectId;
        return this;
    }

    _cleanAttrs=(object)=>{
        let attrs = ['objectId', 'createdAt', 'updatedAt'];
        for(let attr of object){
            delete object[attr];
        }
    }
}

ML.Object = MLObject;

export default ML;