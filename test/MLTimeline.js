'use strict';

var APP_ID = '572afb8a667a230001e5642a';
var REST_API_KEY = 'MlpuX1ZRVDFqb3N1UGxTZGpsV0U3Zw';
var SERVER_URL = 'https://apiuat.maxleap.cn';

describe('Timeline', function (){
    describe('#事件追踪', function(){
        it.only('自定义事件', function(done){
            var timeline = new ML.Timeline({
                appId: APP_ID,
                restAPIKey: REST_API_KEY,
                serverURL: SERVER_URL
            });

            var distinctId = '6c30eefa-d256-4237-812c-061f7a1e8b4a';
            // var distinctId = uuid.v4();

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
                    distinct_id: distinctId
                }
            ];

            timeline.trackEvent(params).then(function(res){
                expect(res.errorCode).to.be(0);
                done();
            }).catch(done);
        })
    })
});
