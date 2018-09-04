import React from "react";
import css from './css.less';
import {setTitle} from "../../../utils/ViewTitleUtils";
import {HttpClient} from "../../../utils/HttpUtils";
import {hashHistory} from "react-router";
import {Button, InputItem, List, Toast} from "antd-mobile";
import { createForm } from 'rc-form';

class BindPhone extends React.Component {
	constructor(props){
		super(props);
		setTitle("绑定手机");
		this.state = {
			mobile:null,
			vcode:null,
			canSend: false,
			canBind:false,
			sendBtn:"发送"
		}
	}
	//发送验证码
	send = ()=>{
		if(this.state.canSend){
			HttpClient.post('/api/app/user/mobile/send_verify_code', {"mobile": this.state.mobile}).then((data)=>{
				if (data.data.code === 0){
					console.log("发送成功");
					Toast.success('发送成功', 1);
					let tm = 60;
					this.time = setInterval(() => {
							this.setState({ sendBtn: tm });
							tm -= 1;
							if (tm === 0){
								clearInterval(this.time);
								this.onPhoneChange(this.state.mobile);
								this.setState({sendBtn:"发送"});
							}
						},
						1000
					);
				}else{
					console.log(data);
					Toast.fail('出错了', 1);
				}
			});
		}
	};

	//绑定
	bind = ()=>{
		if (this.state.canBind){
			HttpClient.post('/api/app/user/agent_apply', {"mobile": this.state.mobile, 'vcode': this.state.vcode}).then((data)=>{
				if (data.data.code === 0){
					hashHistory.push("/agent/success");
				}else{
					alert(data.data.message);
					console.log(data.data.message);
				}
			});
		}
	};

	//验证手机号
	onPhoneChange = (value)=>{
		this.setState({ mobile: value });
		if (value.toString().length === 11){
			this.setState({ canSend:true });
		}else {
			this.setState({ canSend:false });
			this.setState({ canBind:false });
		}
	};
	//验证码
	onCodeChange = (value)=>{
		this.setState({ vcode: value });
		if (value.toString().length === 4){
			this.setState({ canBind:true });
		}else {
			this.setState({ canBind:false });
		}
	};

	render() {
		let canSend = this.state.canSend;
		let canBind = this.state.canBind;

		const { getFieldProps } = this.props.form;
		return (
			<div className={css.phone}>
				<List renderHeader={() => '验证手机成为代理'}>
					<List.Item>
						<InputItem
							{...getFieldProps('number')}
							type="number"
							maxLength = {11}
							placeholder="188xxxxxxxx"
							onChange = {this.onPhoneChange}
							value = {this.state.mobile}
						>手机号</InputItem>
					</List.Item>

					<List.Item>
						<div>
							<div style={{width: '80%', float: 'left'}}>
								<InputItem
									{...getFieldProps('number')}
									type="number"
									onChange={this.onCodeChange}
									maxLength = {4}
									value = {this.state.vcode}
									placeholder="验证码"
								>验证码</InputItem>
							</div>
							<div style={{width: '20%', float:'right', marginTop: '2%'}}>
								<Button disabled={!canSend} onClick={this.send} type="primary" size="small" inline>{this.state.sendBtn}</Button>
							</div>
						</div>
					</List.Item>

					<List.Item>
						<div>
							<Button disabled={!canBind} onClick={this.bind}  type="primary">验证并申请</Button>
						</div>
					</List.Item>
				</List>

			</div>
		);
	}
}

export default BindPhone = createForm()(BindPhone);