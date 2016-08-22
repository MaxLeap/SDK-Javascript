import 'whatwg-fetch';

/** ML 静态对象 */
class ML {
    /**
     * 初始化 ML
     * @param {string} appId - 应用 Id
     * @param {string} restAPIKey - 应用 REST API Key
     * @param {string} serverURL - API 服务器地址
     */
    static initialize(appId, restAPIKey, serverURL){
        ML.appId = appId;
        ML.restApiKey = restAPIKey;
        ML.serverURL = serverURL;
    }

    static useCNServer(){
        ML.serverURL = 'https://api.maxleap.cn/';
    }

    static useENServer(){
        ML.serverURL = 'https://api.maxleap.com/';
    }
}

export default ML;