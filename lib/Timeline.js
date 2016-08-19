import 'whatwg-fetch';
import uuid from 'node-uuid';
import DeviceDetector from './DeviceDetector';

const API_SERVER = 'https://apiuat.maxleap.cn';
const ML_INSTALLATION_FLAG = 'ML_INSTALLATION_FLAG';

export default class Timeline{
    constructor(props){
        this.UNKNOWN = '0,0';
        this.appId = props.appId;
        this.userId = props.userId;
        this.installation = localStorage.getItem(ML_INSTALLATION_FLAG);

        //如果用户第一次访问页面, 则设置标示放在 localStorage 中
        if(!this.installation){
            localStorage.setItem(ML_INSTALLATION_FLAG, uuid.v4());
        }
        this._autoTrack();
    }

    /**
     * 页面初始化时自动收集信息
     */
    _autoTrack(){
        this._trackSession();
        this._trackSessionStart();
    }

    /**
     * Session 是一个用户行为的完整周期
     */
    _trackSession(){
        let params = this.mergeDefaultParams({
            _eventType: 5,
            event: 'Session'
        });

        this.trackEvent(params);
    }

    /**
     * SessionStart 是用户开始的瞬时行为
     */
    _trackSessionStart(){
        let params = this.mergeDefaultParams({
            _eventType: 3,
            event: 'SessionStart'
        });

        this.trackEvent(params);
    }

    /**
     * SDK 会自动收集一些字段
     */
    mergeDefaultParams(params){
        return [
            {
                properties: {
                    _eventType: params._eventType,
                    _userId: this.userId,
                    _userAgent: window.navigator.userAgent,
                    uuid: uuid.v4(),
                    deviceId: this.installation,
                    appUserId: this.appUserId, //_User表中的id, 由调用者传入
                    appId: this.appId, //appId, 由调用者传入
                    startTime: new Date().getTime(),
                    userCreateTime: new Date().getTime(),
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
                    sdkVersion: '2.0.4',
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


    trackEvent(params){
        return fetch(`${API_SERVER}/2.0/track/event`, {
            method: 'POST',
            headers: {
                'X-ML-AppId': this.appId
            },
            body: JSON.stringify(params)
        }).then(res=>res.json());
    }
}
