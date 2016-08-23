import 'whatwg-fetch';
import uuid from 'node-uuid';
import DeviceDetector from './DeviceDetector';

const SERVER_URL = 'https://api.maxleap.cn';
const ML_INSTALLATION_FLAG = 'ML_INSTALLATION_FLAG';
const ML_INSTALLATION_TIME = 'ML_INSTALLATION_TIME';

/** Timeline 事件数据收集 */
class Timeline{
    /**
     * 实例化 Timeline
     * @param {object} props - 创建 Timeline 对象需要 appId, userId
     */
    constructor(props){
        this.UNKNOWN = '0,0';
        this.appId = props.appId;
        this.userId = props.userId;

        //用户可以使用默认 server 地址, 也可以用自己的 server
        this.serverURL = props.serverURL || ML.serverURL || SERVER_URL;
        this.installation = localStorage.getItem(ML_INSTALLATION_FLAG);
        this.installationTime = localStorage.getItem(ML_INSTALLATION_TIME);

        //如果用户第一次访问页面, 则设置标示放在 localStorage 中
        if(!this.installation){
            try{
                //safari 的隐身模式不允许设置 localStorage
                let mlInstallationFlag = uuid.v4();
                let mlInstallationTime = new Date().getTime();
                this.installation = mlInstallationFlag;
                this.installationTime = mlInstallationTime;
                localStorage.setItem(ML_INSTALLATION_FLAG, mlInstallationFlag);
                localStorage.setItem(ML_INSTALLATION_TIME, mlInstallationTime);
            }catch(e){
                console.warn('请关闭隐身模式');
            }
        }
        this._autoTrack();
    }

    /**
     * 页面初始化时自动收集信息
     * @private
     */
    _autoTrack(){
        this._trackSession();
        this._trackSessionStart();
    }

    /**
     * Session 是一个用户行为的完整周期
     * @private
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
     * @private
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
     * @param {object} params - 覆盖默认字段
     */
    mergeDefaultParams(params){
        return [
            {
                properties: {
                    _eventType: params._eventType,
                    _userId: this.userId,
                    _userAgent: window.navigator.userAgent,
                    _deviceModel: 'web',
                    uuid: uuid.v4(),
                    deviceId: this.installation,
                    appUserId: this.appUserId, //_User表中的id, 由调用者传入
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
     * 追踪 Timeline 事件
     * @param {object} params - 发送事件参数
     */
    trackEvent(params){
        return fetch(`${this.serverURL}/2.0/track/event`, {
            method: 'POST',
            headers: {
                'X-ML-AppId': this.appId
            },
            body: JSON.stringify(params)
        }).then(res=>res.json());
    }
}

export default Timeline;