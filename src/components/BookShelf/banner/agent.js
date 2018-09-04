import React from "react";
import css from '../bookShelf.less';
import {OSS_PRE} from "../../../constant/ActionTypes";
import {setTitle} from "../../../utils/ViewTitleUtils";
import {HttpClient} from "../../../utils/HttpUtils";
import { hashHistory } from 'react-router'

export default class Agent extends React.Component{
	constructor(props){
		super(props);
		setTitle("升级代理");
	}
	onClick(){
		HttpClient.post('/api/app/user/agent_apply_init').then(data=>{
			//alert(JSON.stringify(data));
			let status = data.data.data.state;
			if (status==='-1' || status==='4'){
				hashHistory.push("/agent/phone");
			}else {
				alert('当前状态('+status+')无法申请代理.');
			}
		});
	}
	render(){
		return (
			<div className={css.agent} style={{backgroundImage:`url(${OSS_PRE}/images/bookshelf/agent/agent_apply_main_bg2.png)`}}>
				<div>
					<img src={`${OSS_PRE}/images/bookshelf/agent/apply_btn.png`} onClick={()=>{this.onClick()}}/>
				</div>
			</div>
		);
	}

}
