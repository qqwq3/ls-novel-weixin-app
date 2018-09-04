import React, {Component} from 'react';
import axios from 'axios';
import css from './Feedback.less';
import cfg from '../../../config/app';
axios.defaults.baseURL = cfg.urls;
//axios.defaults.baseURL = 'http://192.168.188.198:8081';
import {NavBar,Icon,Toast} from 'antd-mobile';
import {setTitle} from "../../utils/ViewTitleUtils";
import {HttpClient} from "../../utils/HttpUtils";
import {browserHistory} from 'react-router';
class Feedback extends Component{
    constructor(props){
        super(props);
        this.state={
            questionTypeArr:['更新慢','不流畅','耗流量','书籍少','价格高','界面少','提示少','不好用'],
            ACN:false,
            mapLabel:new Map(),
            currentIndex: null,
            typeValueArr:[],
            click:''
        }
    }
    componentWillMount(){
        setTitle('小说天堂');
        clearInterval(this.submitTime);
    }
    render(){
        return(
            <div className={css.feedback}>
                <NavBar
                    mode="light"
                    icon={<Icon type="left" />}
                    onLeftClick={() =>browserHistory.goBack()}
                    style={{color: 'black',position:'relative',top:0,borderBottom:'1px solid #f1f1f1',width:'100%',backgroundColor:'#ffffff',zIndex:10}}
                >意见反馈</NavBar>
                <div className={css.questionType}>
                    <p>问题类型</p>
                    <ul>
                        {
                            this.state.questionTypeArr.map((item,index) => {
                                const value = (this.state.mapLabel).get(index);
                                const color = value === item ? 'white' : '#333';
                                const background=value===item?"#f3916b":'';
                                return (
                                    <li style={{color: color,background:background}} ref='typeValue' key={item} onClick={this.handleClick.bind(this,item,index)}>{item}</li>
                                )
                            })
                        }
                    </ul>
                </div>
                <div className={css.inputType}>
                    <textarea className={css.opnionInput} placeholder='请留下您宝贵的意见，我们将努力做到更好。&#10;积极反馈，有机会获得丰厚奖励。' ref='ideaValue'/>
                </div>
                <div className={css.phoneDiv}>
                    <input type='number' className={css.phoneNumber} placeholder='手机号码，以便回访' ref='phoneValue'/>
                    <div className={css.notDiv}></div>
                </div>
                {/*<div className={css.submitBtn} onClick={this.submitClick.bind(this)}>提交</div>*/}
                <button className={css.submitBtn} onClick={this.submitClick.bind(this)}  disabled={this.state.click}>提交</button>
            </div>
        )
    }
    handleClick(item,index){
        let mapLabel = this.state.mapLabel;
        if(mapLabel.has(index)){
            mapLabel.delete(index);
        }else{
            mapLabel.set(index, item);
        }
        this.setState({mapLabel});
    }
    submitClick(){
        const reg=/^[1][3,4,5,7,8][0-9]{9}$/;
        let typeValue=this.state.mapLabel;
        if(this.refs.ideaValue.value===''){
            return Toast.info("意见不能为空",1)
        }
        if(!reg.test(this.refs.phoneValue.value)){
            return Toast.info("请输入正确手机号",1)
        }
        HttpClient.http("post","/api/app/user/submit_problem",{
            phone: this.refs.phoneValue.value,
            problem_type: [...typeValue.values()].join(','),
            content: this.refs.ideaValue.value,
        }).then(res=>{
            if(res.data.message==='success'){
                return Toast.success('提交成功', 1);
            }
            Toast(res.data.message);
        }).catch(err=>{
            console.log(err)
        })
        this.setState({
            click:'disabled'
        },()=>{
             this.submitTime=setInterval(()=>{
                this.setState({
                    click:''
                })
            },5000)
        })
    }
    componentWillUnmount(){
        clearInterval(this.submitTime);
        this.setState = () => {
            return ;
        };
    }
}

export default Feedback;