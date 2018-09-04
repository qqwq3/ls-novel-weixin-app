import React, {Component} from 'react';
import axios from 'axios';
import cfg from '../../../config/app'
import css from './History.less';
import {HttpClient} from '../../utils/HttpUtils';
axios.defaults.baseURL = cfg.urls;
import { loadImage } from '../../utils/loadImage';
import {Toast,Icon,NavBar} from "antd-mobile";
import {setTitle} from "../../utils/ViewTitleUtils";
import ReactPullLoad,{ STATS } from 'react-pullload';
import moment from 'moment';
import { browserHistory } from 'react-router';
class History extends Component{
    constructor(props){
        super(props);
        this.state={
            hasMore:true,
            offset:0,
            limit:20,
            historyArr:[],
            addOffSet:20,
            action: STATS.init,
            height: document.documentElement.clientHeight,
            flag:false
        }
    }
    componentWillMount(){
        setTitle('小说天堂');
        Toast.loading('正在加载',1,()=>(HttpClient.http('get',`/api/app/book/get-book-reads?offset=${this.state.offset}&limit=${this.state.limit}`).then(res=>{
            console.log(res.data.data)
            if(res.data.message==='无数据'){
                return Toast.fail("暂无阅读记录",2)
            }
            this.setState({
                historyArr:res.data.data.records,
            })
        })),true)
    }
    handleAction = (action) => {
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
                    HttpClient.http('get',`/api/app/book/get-book-reads?offset=${this.state.offset}&limit=${this.state.limit}`).then(res=>{
                        this.setState({
                            historyArr:[...this.state.historyArr,...res.data.data.records],
                            action:STATS.reset,
                        },function(){
                            console.log(this.state.historyArr)
                            if(this.state.historyArr.length===res.data.data.total_records&&this.state.historyArr.length>20){
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
            <div className={css.history}>
                <NavBar
                    mode="light"
                    icon={<Icon type="left" />}
                    onLeftClick={() =>browserHistory.goBack()}
                    style={{color: 'black',position:'relative',top:0,borderBottom:'1px solid #f1f1f1',width:'100%',backgroundColor:'#ffffff',zIndex:10}}
                >阅读记录</NavBar>
                <div>
                    <ReactPullLoad
                        downEnough={150}
                        action={this.state.action}
                        handleAction={this.handleAction}
                        hasMore={true}
                        distanceBottom={500}
                    >
                        <ul className={css.contentUl}>
                            {
                                this.state.historyArr.map(item=>
                                    <li key={item.book_id}>
                                        <div onClick={this.continueRead.bind(this,item)}>
                                        <img src={loadImage(item.book_id)} className={css.bookImg}/>
                                        <div className={css.bookContent}>
                                            <p className={css.title}>{item.book_title}</p>
                                            <p className={css.author}>{item.author_name}</p>
                                            <p className={css.goOnRead}>阅读至 {item.chapter_title}</p>
                                            <p className={css.readTime}>{
                                                // this.changeTimestamp(item.latest_chapter.time_created)
                                                moment(item.time_created*1000).format('YYYY-MM-DD')
                                            }</p>
                                        </div>
                                        </div>
                                        <div
                                            className={css.goOnReadDiv}
                                            onClick={this.jumpClassify.bind(this,item.category_id,item.category_name)}
                                        >找相似</div>
                                    </li>
                                )
                            }
                        </ul>
                    </ReactPullLoad>
                    {
                        this.state.flag?<div className={css.nonono}>———— 已经到底了 ————</div>:''
                    }
                </div>
            </div>
        )
    }
    jumpClassify(id,name){
        console.log(id)
        this.props.router.push({pathname:'/secondcate',state:{hex_id:id,hex_name:name}});
    }
    continueRead(item){
        //继续阅读
        const hexId = item.book_id_hex;
        this.props.router.push({pathname:'/book-page',state:{hex_id:'book_id'+hexId}});
    }
    componentWillUnmount(){
        this.setState = () => {
            return ;
        };
    }
}


export default History;