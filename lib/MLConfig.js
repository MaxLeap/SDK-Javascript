import 'whatwg-fetch';

const SERVER_URL_CN = 'https://api.maxleap.cn/';
const SERVER_URL_EN = 'https://api.maxleap.com/';

/** ML 静态对象 */
class ML {
    /**
     * 初始化 ML
     * @param {string} appId - 应用 Id
     * @param {string} restAPIKey - 应用 REST API Key
     * @param {string} serverURL - API 服务器地址, 默认为中国区
     * @static
     */
    static initialize(appId, restAPIKey, serverURL) {
        ML.appId = appId;
        ML.restApiKey = restAPIKey;
        ML.serverURL = serverURL || SERVER_URL_CN;
    }

    /**
     * 使用中国区服务器
     */
    static useCNServer() {
        ML.serverURL = SERVER_URL_CN;
    }

    /**
     * 使用美国区服务器
     */
    static useENServer() {
        ML.serverURL = SERVER_URL_EN;
    }
}

export default ML;