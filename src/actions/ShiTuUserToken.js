/**
 * Created by Administrator on 2018/7/22.
 */
// 获取actionType中的全部状态，需要哪个就用哪个
import * as types from '../constant/ActionTypes';

export function userToken(){
    return dispatch =>{
        dispatch(getUserToken());
    }
}

export function getUserToken() {
    return {
        type:types.USER_TOKEN_SUCCESS,
        userToken:'ewewew'
    }
}

export function imageURL() {
    return dispatch=>{
        dispatch(getImageURL())
    }
}
export function getImageURL() {
    return {
        type:types.BACKIMAGE_URL,
        imageURL:'xxx.png'
    }
}