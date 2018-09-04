/**
 * Created by Administrator on 2018/7/22.
 */
// ActionTypes里面存放着App中可能发生的情况
import * as types from '../constant/ActionTypes';
// 初始化值
const initialState = {
    imageURL: 'timg',
    userToken: '',
    /*webViewUrl: '',
    qiNiuData: null,*/
};
// 导出ShiTuReducer。
export default function ShiTuReducer(state = initialState, action){
    /*console.log(112,action);*/

    // 通过switch来判断types的值，在action中实现功能
    switch (action.type) {
        // 当type=USER_TOKEN_SUCCESS时，会将action中的值，
        // 赋给userToken，在ShiTu.js中就能拿到userToken的值。
        case types.USER_TOKEN_SUCCESS:
             console.log(113,action);
            return Object.assign({}, state, {
                ...state,
                userToken: action.userToken
            });
        /*case types.QINIU_UPLOAD_TOKEN:
            // console.log(action);
            return Object.assign({}, state, {
                qiNiuData:action.qiNiuData,
            });
        case types.WEBVIEW_URL:
            return Object.assign({}, state ,{
                ...state,
                webViewUrl:action.webViewUrl,
            });*/
        case types.BACKIMAGE_URL:
            console.log(114,action);
            return Object.assign({}, state ,{
                ...state,
                imageURL:action.imageURL
            });
        default:
            return state;
    }
}
