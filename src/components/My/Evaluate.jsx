import React, {Component} from 'react';
import axios from 'axios';
import {HttpClient} from '../../utils/HttpUtils';
import css from './Evaluate.less';
import cfg from '../../../config/app';
import moment from 'moment';
axios.defaults.baseURL = cfg.urls;
import {setTitle} from "../../utils/ViewTitleUtils";
import {OSS_PRE} from '../../constant/ActionTypes';
import ReactPullLoad,{ STATS } from 'react-pullload';
import {NavBar,Icon,Toast} from 'antd-mobile';
import {browserHistory} from 'react-router';
class Evaluate extends Component{
    constructor(props){
        super(props);
        this.state={
            offset:0,
            limit:20,
            evaluateArr:[],
            addOffSet:20,
            hasMore:true,
            action: STATS.init,
            flag:false
        }
    }
    componentWillMount(){
        setTitle('小说天堂');
        Toast.loading('正在加载',1,()=>(HttpClient.http('get',`/api/app/book/my-comments?offset=${this.state.offset}&limit=${this.state.limit}`).then(res=>{
            console.log(res.data.data);
            if(res.data.message==='无数据'){
                return Toast.fail("暂无点评",2)
            }
            this.setState({
                evaluateArr:res.data.data.records
            })
            Toast.hide()
        })),true)
    }
    handleAction = (action) => {
        console.info(action);
        console.info(this.state.action)
        console.info(action === this.state.action)

        if(action === this.state.action){
            return false
        }
        if(action === STATS.refreshing){//刷新
            this.handRefreshing();
        } else if(action === STATS.loading){//加载更多
            this.handLoadMore();
        } else{
            this.setState({
                action: action
            })
        }
    }
    handRefreshing = () =>{
        if(STATS.refreshing === this.state.action){
            return false
        }
        setTimeout(()=>{
            this.setState({
                hasMore: true,
                action: STATS.refreshed,
            });
        }, 3000)
        this.setState({
            action: STATS.refreshing
        })
    }

    handLoadMore = () => {
        if(STATS.loading === this.state.action){
            return false
        }
        //无更多内容则不执行后面逻辑
        if(!this.state.hasMore){
            return;
        }
        setTimeout(()=>{
            if(this.state.index === 0){
                this.setState({
                    action: STATS.reset,
                    hasMore: false
                });
            } else{
                this.setState({
                    offset:this.state.offset+this.state.addOffSet
                },function(){
                    HttpClient.http('get',`/api/app/book/my-comments?offset=${this.state.offset}&limit=${this.state.limit}`).then(res=>{
                        this.setState({
                            evaluateArr:[...this.state.evaluateArr,...res.data.data.records],
                            action:STATS.reset,
                        },function(){
                            if(this.state.evaluateArr.length===res.data.data.total_records&&this.state.evaluateArr.length>20){
                                this.setState({
                                    flag:true
                                })
                            }
                        })
                    }).catch(err=>{
                        console.log(err)
                    })

                })
            }
        }, 0)
        this.setState({
            action: STATS.loading
        })
    }
    render(){
        return(
            <div>
                <NavBar
                    mode="light"
                    icon={<Icon type="left" />}
                    onLeftClick={() =>browserHistory.goBack()}
                    style={{color: 'black',position:'relative',top:0,borderBottom:'1px solid #f1f1f1',width:'100%',backgroundColor:'#ffffff',zIndex:10}}
                >我的点评</NavBar>
                <div className={css.content}>
                    <ReactPullLoad
                        downEnough={150}
                        action={this.state.action}
                        handleAction={this.handleAction}
                        hasMore={true}
                        distanceBottom={500}
                    >
                    <ul>
                        {
                            this.state.evaluateArr.map(item=>
                                <li key={item.time_created}>
                                    <p className={css.title}>{item.title}</p>
                                    <p className={css.comment}>{item.content}</p>
                                    <p className={css.time}>{moment(item.time_created).format('YYYY-MM-DD')}</p>
                                    <div className={css.likesDiv}>
                                        <img src={`${OSS_PRE}/images/personalcenter/icon_like_finger@2x.png`} /><span>{item.like_count}</span>
                                    </div>
                                </li>
                            )
                        }
                    </ul>
                    </ReactPullLoad>
                    {
                        this.state.flag?<div className={css.nonono}>———— 我是有底线的 ————</div>:''
                    }
                </div>
            </div>
        )
    }
    componentWillUnmount(){
        this.setState = () => {
            return ;
        };
    }
}

export default Evaluate;