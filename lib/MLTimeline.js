import 'whatwg-fetch';
import uuid from 'node-uuid';
import DeviceDetector from './DeviceDetector';

const SERVER_URL = 'https://api.maxleap.cn';
const ML_USER_ID_FALG = 'ML_USER_ID_FALG';
const ML_USER_SESSION_TOKEN_FLAG = 'ML_USER_SESSION_TOKEN_FLAG';
const ML_INSTALLATION_FLAG = 'ML_INSTALLATION_FLAG';
const ML_INSTALLATION_TIME = 'ML_INSTALLATION_TIME';

/** Timeline 事件数据收集 */
class Timeline {
    /**
     * 实例化 Timeline
     * @param {object} props - 创建 Timeline 对象需要 appId, userId
     */
    constructor(props) {
        this.UNKNOWN = '0,0';
        this.appId = props.appId;
        this.restAPIKey = props.restAPIKey;
        this.anonymousUserFetch;

        //用户可以使用默认 server 地址, 也可以用自己的 server
        this.serverURL = props.serverURL || ML.serverURL || SERVER_URL;

        this.userId = localStorage.getItem(ML_USER_ID_FALG); //SDK 自动创建的匿名用户的 objectId
        this.userSessionToken = localStorage.getItem(ML_USER_SESSION_TOKEN_FLAG); //SDK 自动创建的匿名用户的 sessionToken
        this.installation = localStorage.getItem(ML_INSTALLATION_FLAG);
        this.installationTime = localStorage.getItem(ML_INSTALLATION_TIME);

        //如果用户第一次访问页面, 则设置标示放在 localStorage 中
        if (!this.installation) {
            try {
                //safari 的隐身模式不允许设置 localStorage
                let mlInstallationFlag = uuid.v4();
                let mlInstallationTime = new Date().getTime();
                this.installation = mlInstallationFlag;
                this.installationTime = mlInstallationTime;
                localStorage.setItem(ML_INSTALLATION_FLAG, mlInstallationFlag);
                localStorage.setItem(ML_INSTALLATION_TIME, mlInstallationTime);
            } catch (e) {
                console.warn('请关闭隐身模式');
                return;
            }
        }

        //如果没有匿名用户, 则先创建匿名用户
        if (!this.getUserId()) {
            this.anonymousUserFetch = this._createAnonymousUser();
            this.anonymousUserFetch.then(res=> {
                if(res && res.objectId){
                    this.userId = res.objectId;
                    this.userSessionToken = res.sessionToken;
                    localStorage.setItem(ML_USER_ID_FALG, res.objectId);
                    localStorage.setItem(ML_USER_SESSION_TOKEN_FLAG, res.sessionToken);
                }
            })
        }else{
            this.anonymousUserFetch = Promise.resolve(this.getUserId());
        }

        //发送自动跟踪事件
        this._autoTrack();
    }

    /**
     * 追踪 Timeline 事件
     * @param {object} params - 发送事件参数
     */
    trackEvent(params, {url='2.0/track/event'}={}) {
        return this.anonymousUserFetch.then((res)=> {
            return fetch(`${this.serverURL}/${url}`, {
                method: 'POST',
                headers: {
                    'X-ML-AppId': this.appId
                },
                body: JSON.stringify(params)
            }).then(res=>res.json());
        });
    }

    /**
     * 更新 _User 中的信息
     * @param {object} params
     */
    updateUserInfo(params){
        return this.anonymousUserFetch.then((res)=> {
            if(this.userId){
                return fetch(`${this.serverURL}/2.0/users/${this.userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-ML-AppId': this.appId,
                        'X-ML-APIKey': this.restAPIKey,
                        'X-ML-Session-Token': this.userSessionToken
                    },
                    body: JSON.stringify(params)
                }).then(res=>res.json());
            }
        });
    }

    /**
     * 获取 SDK 自动创建的匿名用户 userId
     */
    getUserId() {
        return this.userId;
    }

    /**
     * 获取 SDK 自动创建的 installation
     */
    getInstallationId() {
        return this.installation;
    }

    /**
     * 获取后台标准格式的 uuid, 该 uuid 每条请求都不同
     */
    getDistinctId(){
        return uuid.v4();
    }

    /**
     * SDK 会自动收集一些字段
     * @param {object} params - 覆盖默认字段
     * @private
     */
    _mergeDefaultParams(params) {
        return [
            {
                properties: {
                    _eventType: params._eventType,
                    _userId: '',//_User表中的id, sdk调后台接口生成, 必须留在这里占位
                    _userAgent: window.navigator.userAgent,
                    _deviceModel: 'web',
                    uuid: uuid.v4(),
                    deviceId: this.installation,
                    appUserId: this.installation, //installation, 客户端生成
                    appId: this.appId, //appId, 由调用者传入
                    startTime: new Date().getTime(),
                    userCreateTime: Number(this.installationTime),
                    duration: 0,
                    upgrade: false,
                    carrier: this.UNKNOWN,
                    sessionId: uuid.v4(),
                    os: 'web',
                    osVersion: DeviceDetector.getOSName(),
                    resolution: DeviceDetector.getResolution(),
                    language: DeviceDetector.getLanguage(),
                    national: this.UNKNOWN,
                    network: this.UNKNOWN,
                    appVersion: this.UNKNOWN,
                    sdkVersion: '2.1.0',
                    push: false,
                    channel: this.UNKNOWN
                },
                time: new Date().getTime(),
                event: params.event,
                type: 'track',
                distinct_id: uuid.v4()
            }
        ]
    }

    /**
     * 创建匿名用户
     * @private
     */
    _createAnonymousUser() {
        let params = {
            authData: {
                anonymous: {
                    id: uuid.v4()
                }
            },
            installationIds: [this.installation]
        };

        return fetch(`${this.serverURL}/2.0/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-ML-AppId': this.appId,
                'X-ML-APIKey': this.restAPIKey
            },
            body: JSON.stringify(params)
        }).then(res=>res.json());
    }

    /**
     * 页面初始化时自动收集信息
     * @private
     */
    _autoTrack() {
        this._trackSession();
        this._trackSessionStart();
    }

    /**
     * Session 是一个用户行为的完整周期
     * @private
     */
    _trackSession() {
        let params = {
            _eventType: 5,
            event: 'Session'
        };
        params = this._mergeDefaultParams(params);

        Object.defineProperty(params[0].properties, '_userId', {
            get: ()=>{
                return this.getUserId();
            }
        });

        this.trackEvent(params);
    }

    /**
     * SessionStart 是用户开始的瞬时行为
     * @private
     */
    _trackSessionStart() {
        let params = {
            _eventType: 3,
            event: 'SessionStart'
        };

        params = this._mergeDefaultParams(params);

        Object.defineProperty(params[0].properties, '_userId', {
            get: ()=>{
                return this.getUserId();
            }
        });

        this.trackEvent(params);
    }

}

export default Timeline;