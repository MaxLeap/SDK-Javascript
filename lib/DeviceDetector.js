import WebDetector from 'web-detector';

export default class DeviceDetector {
    static getOSName(){
        return WebDetector.os.name === 'na' ? 'unknown' : WebDetector.os.name;
    }

    static getOSVersion(){
        //如果是windows系统,web-detector返回的是NT的版本号,需要转换成windows版本
        if(WebDetector.os.name === 'windows'){
            if (WebDetector.os.version >= 10) {
                return '10';
            } else if (WebDetector.os.version >= 6.3) {
                return '8.1';
            } else if (WebDetector.os.version >= 6.2) {
                return '8';
            } else if (WebDetector.os.version >= 6.1) {
                return '7';
            } else if (WebDetector.os.version >= 6.0) {
                return 'vista';
            } else if (WebDetector.os.version >= 5.1) {
                return 'xp';
            } else if (WebDetector.os.version >= 5.0) {
                return '2000';
            }
        }
        return WebDetector.os.fullVersion === '-1' ? 'unknown' : WebDetector.os.fullVersion;
    }

    static getResolution(){
        return screen.width + '*' + screen.height;
    }

    static getLanguage(){
        return (navigator.language || navigator.userLanguage).match(/\w+(?=-)/)[0];
    }
}