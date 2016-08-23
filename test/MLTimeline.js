'use strict';

var APP_ID = '572afb8a667a230001e5642a';
var USER_ID = '57b580feaa150a0001c6165e';
var SERVER_URL = 'https://apiuat.maxleap.cn';

describe('Timeline', function (){
    describe('#事件追踪', function(){
        it('自定义事件', function(done){
            var params = [
                {
                    "properties":  {
                        _userId: USER_ID,
                        _eventType:5,
                        _userAgent: window.navigator.userAgent
                    },
                    time: new Date().getTime(),
                    event: 'CustomEvent',
                    type: 'track',
                    distinct_id: '6e87a18ac0ef4435807433211760ax12'
                }
            ];

            var timeline = new ML.Timeline({
                appId: APP_ID,
                userId: USER_ID,
                serverURL: SERVER_URL
            });

            timeline.trackEvent(params).then(function(res){
                expect(res.errorCode).to.be(0);
                done();
            }).catch(done);
        })
    })
});
