import ML from './MLConfig';

class MLObject {
    static extend(){
        //User 是 ML 保留字段
        if(className === 'User'){
            className = '_User';
        }
    }
}

ML.Object = MLObject;

export default ML;