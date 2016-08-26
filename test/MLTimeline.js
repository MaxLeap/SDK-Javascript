'use strict';

var APP_ID = '572afb8a667a230001e5642a';
var REST_API_KEY = 'MlpuX1ZRVDFqb3N1UGxTZGpsV0U3Zw';
var SERVER_URL = 'https://apiuat.maxleap.cn';

describe.only('Timeline', function (){
    var timeline = new ML.Timeline({
        appId: APP_ID,
        restAPIKey: REST_API_KEY,
        serverURL: SERVER_URL
    });
    describe('#事件追踪', function(){
        it('自定义事件', function(done){
            var params = [
                {
                    properties:  {
                        _eventType:5,
                        _userAgent: window.navigator.userAgent,
                        get _userId(){
                            return timeline.getUserId();
                        },
                        get appUserId() {
                            return timeline.getInstallationId();
                        }
                    },
                    time: new Date().getTime(),
                    event: 'CustomEvent',
                    type: 'track',
                    distinct_id: uuid.v4()
                }
            ];

            timeline.trackEvent(params).then(function(res){
                expect(res.errorCode).to.be(0);
                done();
            }).catch(done);
        });
    });

    describe('#更新 user 信息', function(){
       it('更新匿名用户信息', function(done){
           var params = {
               utm_campaign: 'spring_sale',
               utm_source: 'baidu',
               utm_medium: 'cpc',
               utm_term: 'running+shoes',
               utm_content: 'ad1'
           };

           timeline.updateUserInfo(params).then(function(res){
               expect(res.number).to.be(1);
               done();
           }).catch(done);
       })
    });
});
