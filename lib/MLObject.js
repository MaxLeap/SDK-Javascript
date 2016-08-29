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

    static destroyAll(values){
        let batchDeleteParams = values.map(item=>{
            return {
                method: 'delete',
                path: `classes/${item._className}/${item.id}`
            }
        });
        return fetch(`${ML.serverURL}2.0/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-ML-AppId': ML.appId,
                'X-ML-APIKey': ML.restApiKey
            },
            body: JSON.stringify({requests:batchDeleteParams})
        }).then(res=>res.json());
    }

    set(key, value) {
        if(value.toJSON){
            this.attributes[key] = value.toJSON();
        }
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
        for (let key in attrs) {
            this.set(key, attrs[key]);
        }
        if(this.id){
            return this._update();
        }else{
            return this._create();
        }
    }

    destroy(){
        return fetch(`${ML.serverURL}2.0/classes/${this._className}/${this.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-ML-AppId': ML.appId,
                'X-ML-APIKey': ML.restApiKey
            },
            body: JSON.stringify(this.attributes)
        }).then(res=>res.json());
    }

    add(key, value) {
        this._opAddQueue.push({
            operation: {
                body: value.attributes,
                method: 'POST',
                path: `/2.0/classes/${value._className}`
            },
            object: value,
            key: key
        });
    }

    fetch() {
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

    _create(){
        let saveAttrs = ()=> {
            return fetch(`${ML.serverURL}2.0/classes/${this._className}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-ML-AppId': ML.appId,
                    'X-ML-APIKey': ML.restApiKey
                },
                body: JSON.stringify(this.attributes)
            }).then(res=>res.json())
                .then(res=> {
                    this._opAddQueue.forEach((item)=> {
                        this.attributes[item.key] = [];
                    });

                    this._opAddQueue.forEach((item)=> {
                        this.attributes[item.key].push(item.object);
                    });
                    return res;
                })
                .then(this._buildResult);
        };

        if (this._opAddQueue.length) {
            return this._deepSave()
                .then(saveAttrs);
        } else {
            return saveAttrs();
        }
    }

    _update(){
        let saveAttrs = ()=> {
            return fetch(`${ML.serverURL}2.0/classes/${this._className}/${this.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-ML-AppId': ML.appId,
                    'X-ML-APIKey': ML.restApiKey
                },
                body: JSON.stringify(this.attributes)
            }).then(res=>res.json())
                .then(res=> {
                    this._opAddQueue.forEach((item)=> {
                        this.attributes[item.key] = item.object;
                    });
                    return res;
                })
                .then(this._buildResult);
        };

        if (this._opAddQueue.length) {
            return this._deepSave()
                .then(saveAttrs);
        } else {
            return saveAttrs();
        }
    }

    _deepSave() {
        let requestParams = {
            requests: this._opAddQueue.map(item=> {
                return item.operation;
            })
        };

        return fetch(`${ML.serverURL}2.0/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-ML-AppId': ML.appId,
                'X-ML-APIKey': ML.restApiKey
            },
            body: JSON.stringify(requestParams)
        }).then(res=>res.json())
            .then(res=> {
                res.forEach((item, i)=> {
                    this._opAddQueue[i].object.id = item.objectId;
                    if(!this.attributes[this._opAddQueue[i].key]){
                        this.attributes[this._opAddQueue[i].key] = [];
                    }
                    this.attributes[this._opAddQueue[i].key].push({
                        __type: 'Pointer',
                        className: this._opAddQueue[i].object._className,
                        objectId: this._opAddQueue[i].object.id
                    })
                });
            });
    }

    _buildResult = (res)=> {
        //仅当 this.id 不存在时,才会从 res.objectId 赋值, 因为在 update 时, 后台不返回 objectId
        if(!this.id){
            this.id = res.objectId;
        }
        return this;
    }

    _cleanAttrs = (object)=> {
        let attrs = ['objectId', 'createdAt', 'updatedAt'];
        for (let attr of object) {
            delete object[attr];
        }
    }
}

ML.Object = MLObject;

export default ML;