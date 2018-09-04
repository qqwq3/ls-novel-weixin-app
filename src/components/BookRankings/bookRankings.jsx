import React, {Component} from 'react';
import { Icon, Grid } from 'antd-mobile';
import 'antd-mobile/dist/antd-mobile.css';
import axios from 'axios';
import css from './bookRankings.less';
import { Link} from 'react-router';
import {OSS_PRE} from '../../constant/ActionTypes';
import { loadImage } from '../../utils/loadImage';
import {setTitle} from "../../utils/ViewTitleUtils";
import {HttpClient} from '../../utils/HttpUtils';
import {Toast} from 'antd-mobile';
const storage = window.sessionStorage;

class BookRankings extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            tabArr:['点击榜','收藏榜','新书榜','完结榜'],
            currentIndex:0,
            clickTF:true,
            collectTF:false,
            newBookTF:false,
            overTF:false,
            clickArr:[],
            collectArr:[],
            newBookArr:[],
            overArr:[],
            ifOver:true,
            manyPeopleRead:true,
            isBig:false,
        }
    }
    //微信分享
    shareOperate = () =>{
        const {books,chapterData} = this.state;
        console.log('xxxxx',location.href)

        let u = navigator.userAgent;
        let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
        let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        let url='';
        if (isAndroid) {
            url=location.href
        }
        if (isIOS) {
            url = JSON.parse(storage.getItem('indexUrl')).url;
        }
        HttpClient.get('/api/app/share/launch', {url: url}).then((res)=>{
            let result = res.data.data;
            wx.config({
                debug: false,
                appId: result.appId,
                timestamp: result.timestamp,
                nonceStr: result.nonceStr,
                signature: result.signature,
                jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline']
            });

            wx.ready(function(){
                // 分享到朋友圈
                wx.onMenuShareTimeline({
                    title: '畅享阅读时光，遇见美好未来',//books.title,
                    link: 'http://weixin.myfoodexpress.cn/index/book-city?id=2',//location.href+`?id=book_id${books.hex_id}`,//location.href,
                    imgUrl: `${OSS_PRE}/images/common/icon.png`,
                    success: function () {
                        // 用户点击了分享后执行的回调函数
                        HttpClient.post('/api/app/user/share_book/callback',{book_id:books.id}).then((res)=>{
                            if(res.data.code !== 0){
                                Toast.fail((res.data.message),1);
                            }else{
                                if(res.data.data.share_reward>0){
                                    Toast.success(`已增加${res.data.data.share_reward}书币`,1);
                                }else{
                                    Toast.success(`分享成功`,1);
                                }
                            }
                            location.reload([false]);
                        });
                    }
                });
                //console.log('222',location.href+`?id=book_id${books.hex_id}`)
                // 分享到朋友
                wx.onMenuShareAppMessage({
                    title: '畅乐读-全网免费看',//books.title,
                    desc: '畅享阅读时光，遇见美好未来',//chapterData&&chapterData.content&&chapterData.content.length>0&&chapterData.content!==''&&chapterData.content!=='undefined'?chapterData.content[0]:'小说读到一半要收费？这里小说全免费，媳妇再也不用担心我看小说偷偷充钱了',
                    link: 'http://weixin.myfoodexpress.cn/index/book-city?id=2',//location.href+`?id=book_id${books.hex_id}`,
                    imgUrl: `${OSS_PRE}/images/common/icon.png`,
                    type: '', // 分享类型,music、video或link，不填默认为link
                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                    success: function () {
                        // 用户点击了分享后执行的回调函数
                        HttpClient.post('/api/app/user/share_book/callback',{book_id:books.id}).then((res)=>{
                            if(res.data.code !== 0){
                                Toast.fail((res.data.message),1);
                            }else{
                                if(res.data.data.share_reward>0){
                                    Toast.success(`已增加${res.data.data.share_reward}书币`,1);
                                }else{
                                    Toast.success(`分享成功`,1);
                                }

                            }
                            location.reload([false]);
                        });
                    }
                });
            });

        });
    };
    componentWillMount(){
        setTitle('小说天堂');
        this.shareOperate();
        //点击榜
        if(sessionStorage.getItem("click")===null){
                Toast.loading('正在加载',1,()=>HttpClient.http("get",`/api/app/book/get-top-list?sort_by=total_hits`).then(res=>{
                this.setState({
                    clickArr:res.data.data,
                },function(){
                    sessionStorage.setItem("click",JSON.stringify(this.state.clickArr));
                    Toast.hide();
                });
            }),true)
        }else{
            this.setState({
                clickArr:JSON.parse(sessionStorage.getItem("click"))
            })
        }
        //收藏榜
        if(sessionStorage.getItem("collect")===null){
            HttpClient.http("get",`/api/app/book/get-top-list?sort_by=total_likes`).then(res=>{
                this.setState({
                    collectArr:res.data.data
                },function(){
                    sessionStorage.setItem("collect",JSON.stringify(this.state.collectArr));
                })
            })
        }else{
            this.setState({
                collectArr:JSON.parse(sessionStorage.getItem("collect"))
            })
        }
        //新书榜
        if(sessionStorage.getItem("newBook")===null){
            HttpClient.http("get",`/api/app/book/get-top-list?sort_by=time_created`).then(res=>{
                this.setState({
                    newBookArr:res.data.data
                },function(){
                    sessionStorage.setItem("newBook",JSON.stringify(this.state.newBookArr));
                })
            })
        }else{
            this.setState({
                newBookArr:JSON.parse(sessionStorage.getItem("newBook"))
            })
        }
        //完结榜
        if(sessionStorage.getItem("over")===null){
            HttpClient.http("get",`/api/app/book/get-top-list?sort_by=finish`).then(res=>{
                this.setState({
                    overArr:res.data.data
                },function(){
                    sessionStorage.setItem("over",JSON.stringify(this.state.overArr));
                })
            })
        }else{
            this.setState({
                overArr:JSON.parse(sessionStorage.getItem("over"))
            })
        }
    }
    render() {
        return(
            <div className={css.bookRanking}>
                <ul className={css.tableFour}>
                    {
                        this.state.tabArr.map((item,index)=>
                            <li key={index} className={this.state.currentIndex===index?css.activeClass:''} onClick={this.handleClick.bind(this,index)}>{item}</li>
                        )
                    }
                </ul>
                <div style={{width:'20%'}}></div>
                {/*content区域 通过数据请求 集体渲染*/}
                <div className={css.fictionContent}>
                    <ul>
                        {
                            this.state.clickTF? this.state.clickArr.map((item,index)=>
                                this.drwaDOM(item,index)
                            ):""
                        }
                        {
                            this.state.newBookTF?this.state.newBookArr.map((item,index)=>
                                    this.drwaDOM(item,index)
                                ):""
                        }
                        {
                            this.state.collectTF? this.state.collectArr.map((item,index)=>
                                    this.drwaDOM(item,index)
                                ):''
                        }
                        {
                            this.state.overTF?this.state.overArr.map((item,index)=>
                            this.drwaDOM(item,index)
                            ):""
                        }
                    </ul>
                </div>
            </div>
        )
    }
    //集体渲染
    drwaDOM(item,index){
        return(
            <li key={item.id} onClick={this.clickJumpDetail.bind(this,item.hex_id)}>
                <div className={css.boxLeft}>
                    <img className={css.fictionCover} src={loadImage(item.id)} alt=''/>
                </div>
                <div className={css.boxRight}>
                    {/*<div className={css.rankingBox}>*/}
                        {/*<img src={this.rankingExamine(index)} className={css.rankingImg}/>*/}
                        <b className={css.rankingMath} style={{color:this.rankingExamine(index)}}>{index+1}</b>
                    {/*</div>*/}
                    <p className={css.title}>{item.title}</p>
                    <p className={css.content}>{  (/<br\s*\/?>/gi.test(item.description)  ? item.description.replace(/<br\s*\/?>/gi,"\r\n") : item.description) ? (/<br\s*\/?>/gi.test(item.description)  ? item.description.replace(/<br\s*\/?>/gi,"\r\n") : item.description):"暂无描述" }</p>
                    <p className={css.novalType}>{item.category_name}</p>
                    <p className={css.ifOver}>{item.author_name}</p>
                    {/*{*/}
                        {/*this.statusMany(item.status)*/}
                    {/*}*/}
                </div>
            </li>
        )
    }
    // statusMany(status){
    //     if(status===1){
    //         return(
    //             <p className={css.ifOver}>连载中</p>
    //         )
    //     }else if(status===2){
    //         return(
    //             <p className={css.ifOver}>已完结</p>
    //         )
    //     }
    // }
    //判断名次的函数 传index进来
    rankingExamine(index){
        switch (index){
            case 0:
                return 'red';
                break;
            case 1:
                return `#f3916b`;
                break;
            case 2:
                return `darkred`;
                break;
            default:
                return `#808080`;
        }
    }
    handleClick(index){
        this.setState({
            currentIndex: index,
            clickTF: index === 0 ? true : false,
            collectTF: index === 1 ? true : false,
            newBookTF: index === 2 ? true : false,
            overTF: index === 3 ? true : false,
            ifOver:index===3?false:true
        })
    }
    //点击跳转详情
    clickJumpDetail(id){
        this.props.router.push({
            pathname:'/book-detail',
            state:{
                hex_id:id
            }
        });
    }
    componentWillUnmount(){
        this.setState = () => {
            return ;
        };
    }
}

export default BookRankings;