import React, {Component} from 'react';
import axios from 'axios';
import css from './OpenVip.less';
import {Toast} from 'antd-mobile';
import {OSS_PRE} from '../../constant/ActionTypes';
import cfg from '../../../config/app';
import {HttpClient} from '../../utils/HttpUtils';
import {setTitle} from "../../utils/ViewTitleUtils";
import storejs from "storejs";
axios.defaults.baseURL = cfg.urls;
//axios.defaults.baseURL = 'http://192.168.188.198:8081';
import {Icon,Grid} from 'antd-mobile';
class OpenVip extends Component{
    constructor(props){
        super(props);
        this.state={
            balance:0,
            vipDay:0,
            avatar:'',
            name:'',
        }
    }
    componentWillMount(){
        setTitle('小说天堂');
        let userInfo = storejs.get('userInfo');
        HttpClient.http('get',`/api/app/user/my`).then((res)=>{
            console.log(res.data);
            this.setState({
                balance:res.data.data.balance,
                vipDay:res.data.data.vip_day,
                name:userInfo.name,
                avatar:userInfo.avatar
            })
        });
    }
    
    render(){
        return(
            <div>
                <div className={css.openVip}>
                    <div className={css.card}>
                        <img src={`${OSS_PRE}/images/personalcenter/vip_card@2x.png`} className={css.vipCard}/>
                        <img src={`${this.state.avatar}`} alt='' className={css.userImg}/>
                        <p className={css.userName}>{this.state.name}</p>
                        <p className={css.surplusDay}>VIP剩余：{this.state.vipDay}天</p>
                    </div>
                </div>
                <div className={css.balance}>余额：{this.state.balance}</div>

                <div className={css.bottom}>
                        <div className={css.threeSDiv}>
                            <img src={`${OSS_PRE}/images/personalcenter/icon_vip_coin@2x.png`} alt=''/>
                            <div><span>只需<b>1800</b>书币</span></div>
                        </div>
                        <div className={css.threeSDiv}>
                            <img src={`${OSS_PRE}/images/personalcenter/icon_vip_books@2x.png`} alt=''/>
                            <div><span>畅读<b>所有</b>书籍</span></div>
                        </div>
                        <div className={css.threeSDiv}>
                            <img src={`${OSS_PRE}/images/personalcenter/icon_vip_calendar@2x.png`} alt=''/>
                            <div><span>持续<b>30</b>天</span></div>
                        </div>
                    <div className={css.nowOpen} onClick={this.nowOpenVip.bind(this)}>立即开通</div>
                </div>
            </div>
        )
    }
    nowOpenVip(){
        HttpClient.http('post',`/api/app/user/Recharge_vip_v2`).then(res=>{
            console.log(res.data);
            if(res.data.code !==0){Toast.show(res.data.message)}
            if(res.data.code ===0){
                Toast.show('开通成功');
                setTimeout(()=>{location.reload(true)},2500)
            }
        })
    }
    componentWillUnmount(){
        this.setState = () => {
            return ;
        };
    }
}

export default OpenVip;