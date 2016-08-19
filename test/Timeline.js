'use strict';

const APP_ID = '572afb8a667a230001e5642a';
const USER_ID = '572b003f70c6760001495087';

describe('Timeline', ()=>{
    describe('#TrackEvent', ()=>{
        it('should track evnet', (done)=>{
            let params = [
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

            let timeline = new ML.Timeline({
                appId: APP_ID,
                userId: USER_ID
            });

            timeline.trackEvent(params).then(res=>{
                console.log(res);
                done();
            }).catch(done);
        })
    })
});
