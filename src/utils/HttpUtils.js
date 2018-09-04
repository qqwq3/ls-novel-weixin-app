import * as axios from "axios";
import cfg from '../../config/app';
import storejs from "storejs";
import {login} from "./AuthUtils";

export class HttpClient {

	static get(url, param, hearders){
		return this.http("GET", url, param, hearders);
	}

	static post(url, param, hearders){
		return this.http("POST", url, param, hearders);
	}

	/**
	 * HttpClient工具类
	 * @param type 请求方法 string
	 * @param url 请求地址 string
	 * @param param 请求参数 json
	 * @param headers json
	 * @returns {*}
	 */
	static http(type, url, param={}, headers={}){
		//拼接api前缀
		url = cfg.urls + url;

		//添加auth_key
		let userInfo = storejs.get('userInfo');
		headers['Authorized-Key'] = userInfo? userInfo.authorized_key : userInfo;
		headers['platform'] = 'weixin';
		//响应拦截
		axios.interceptors.response.use(function (response) {
			//登录超时或者未登录
			if (response.data.code == 401){
				// storejs.remove('userInfo');
				// location.reload(true);
				login(location.href);
			}
			return response;
		}, function (error) {
			return Promise.reject(error);
		});

		return axios({
			method: type,
			url: url,
			params: param,
			headers:headers,
		});
	}
}