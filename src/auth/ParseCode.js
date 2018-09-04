import React from "react";
import storejs from "storejs";
import {setTitle} from "../utils/ViewTitleUtils";
import {HttpClient} from "../utils/HttpUtils";

export default class ParseCode extends React.Component{
	constructor(props){
		super(props);
	}

	login = ()=>{
		//解析code和回调URL
		let str_param = location.href.split('?')[1];
		let code = null;
		let url = null;
		str_param.split('&').map((kv, index)=>{
			if (index === 0){
				code = kv.split('=')[1]
			}
			if (index === 1){
				url = kv.split('=')[1]
			}
		});


		//登录
		HttpClient.get('/api/app/user/login/weixin_service/params').then((data)=>{
			//获取登录所需参数
			let state = data.data.data.state;
			HttpClient.post('/api/app/user/login/weixin/callback',{state: state, code: code}).then((data)=>{
				console.log(data);
				//获取登录返回的authorized_key
				if (data.data.code === 0){
					storejs.set('userInfo', data.data.data);
					location.href = decodeURIComponent(url);
				}
			});
		});
	};


	componentDidMount(){
		setTitle('登录中...');
		this.login();
	}

	render(){
		return null;
	}
}