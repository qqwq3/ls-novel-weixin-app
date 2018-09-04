import React, {Component} from 'react';
import axios from 'axios';
import css from './Charge.less';
import {OSS_PRE} from '../../constant/ActionTypes';
//axios.defaults.baseURL = 'http://192.168.188.198:8081';
import cfg from '../../../config/app';
axios.defaults.baseURL = cfg.urls;
import {HttpClient} from '../../utils/HttpUtils'
import {Icon,Toast} from 'antd-mobile';
import qs from 'qs';
import {setTitle} from "../../utils/ViewTitleUtils";
function failToast() {
    Toast.fail('请输入正确充值码', 1);
}
function successToast() {
    Toast.success('充值成功', 1);
}
class Charge extends Component{
    constructor(props){
        super(props)
    }
    componentWillMount(){
        setTitle('小说天堂');
    }
    render(){
        let qrcodeImg = 'http://novel-res.oss-cn-hangzhou.aliyuncs.com/agent_qrcode/10.jpg';
        return(
            <div className={css.charge}>
                <img src={`${OSS_PRE}/images/pay/bg_charge_center@3x.png`} alt='' className={css.bgImg} style={{height:'document.documentElement.clientHeight'}}/>
                <div className={css.content}>
                    <p className={css.chargeCode}>充值码</p>
                    <input type='text' ref='inputValue' className={css.chargeInput} placeholder='粘贴充值码'/>
                    <div className={css.nowCharge} onClick={this.nowCharge.bind(this)}>立即充值</div>
                    <div className={css.qrCode}>
                        <img src={qrcodeImg} />
                    </div>
                    <p className={css.codePrice}>每个充值码10元，可兑换一个书币</p>
                    <p className={css.codePrice}>购买充值码请联系微信客服：<span>pob9990</span></p>
                </div>
            </div>
        )
    }
    nowCharge(){
        let chargeCode=this.refs.inputValue.value;
        let reg=/^[0-9a-zA-Z]+$/;
        let result=reg.test(chargeCode);
        if(!result){
            return failToast();
        }
        HttpClient.http('post','/api/app/user/recharge_v2',{code:chargeCode,agent_id:'weixin'}).then(res=>{
            Toast.info(res.data.message,2);
            if(res.data.message==='success'){
                successToast();
            }
        })
    }
    componentWillUnmount(){
        this.setState = () => {
            return ;
        };
    }
}

export default Charge;