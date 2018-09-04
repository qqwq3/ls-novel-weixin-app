import React from "react";
import {setTitle} from "../../../utils/ViewTitleUtils";
import {OSS_PRE} from "../../../constant/ActionTypes";
import css from './css.less';
import {hashHistory} from "react-router";
class Success extends React.Component{
	render(){
		setTitle("申请成功");
		return (
			<div className={css.success}>
				<img src={`${OSS_PRE}/images/bookshelf/agent/green_tick@2x.png`} />
				<div>申请成功, 等待审核(一个工作日内)</div>
				<div>审核成功后,重新启动app会出现后台入口</div>
				<button onClick={()=>{hashHistory.push("/index/bookshelf");}}>确定</button>
			</div>
		);
	}
}

export default Success;