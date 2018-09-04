import React, {Component} from 'react';
import css from './index.less';
import { Drawer,Icon } from 'antd-mobile';
import {OSS_PRE} from "../../constant/ActionTypes";
const storage = window.sessionStorage;
import operate from "./operate";
import cfg from '../../../config/app';
import axios from 'axios';
axios.defaults.baseURL = cfg.urls;
import {setTitle} from "../../utils/ViewTitleUtils";
import {HttpClient} from '../../utils/HttpUtils';
import storejs from "storejs";
import {browserHistory} from 'react-router';
class Index extends React.Component {
	constructor(props) {
		super(props);
		const tab = JSON.parse(storage.getItem('tab'));
		const queryId = this.props.location.query.id;
		this.state = {
			hidden:false,
            tabId:tab&&tab.tabId?tab.tabId:queryId?queryId:2,
            myBookB:0,
            isVip:0,
            isComment:0,
            isRead:0,
            open: false,
            agentState:null
		}
	}
    shareOperate = () =>{
        const {books,chapterData} = this.state;
        console.log('xxxxx',location.href)

        let u = navigator.userAgent;
        let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
        let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        let url='';
        if (isAndroid) {
            url=location.href
            //alert('android')
        }
        if (isIOS) {
            //url=location.href.split('#')[0]  //hash后面的部分如果带上ios中config会不对
            //alert('ios')
            //url = 'http://weixin.myfoodexpress.cn/index/book-city?id=2';
            url = JSON.parse(storage.getItem('indexUrl')).url;
        }
        //url = 'http://weixin.myfoodexpress.cn/index/book-city?id=2';
        //alert(url)
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
                    title: '畅乐读-全网免费看',//books.title,
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
        this.setState({
            open:false
        });
        this.shareOperate();
        addEventListener("popstate",this.handlePop);
        const tab = JSON.parse(storage.getItem('tab'));
        const query_id = this.props.location.query.id;
	    this.setState({
            tabId:query_id?query_id:(tab&&tab.tabId?tab.tabId:this.state.tabId)
        });
        HttpClient.http('get','/api/app/user/my').then(res=>{
            this.setState({
                myBookB:res.data.data.balance,
                isVip:res.data.data.vip_day,
                isComment:res.data.data.total_comment,
                isRead:res.data.data.total_read
            })
        })
    }
    handleTab(id){
        this.setState({
            tabId:id
        });
        storage.setItem('tab',JSON.stringify({tabId:id}));
        switch (id) {
            case 1:
                this.props.router.push({pathname:'/index/bookshelf'});
                break;
            case 2:
                this.props.router.push({pathname:'/index/book-city'});
                break;
            case 3:
                this.props.router.push({pathname:'/index/book-rankings'});
                break;
            case 4:
                this.props.router.push({pathname:'/index/classification'});
                break;
        }
    }
    handlePop = () =>{
        if(JSON.parse(storage.getItem('back')).id!==1){
            this.setState({
                tabId:2
            },()=>{
                this.props.router.push({pathname:'/index/book-city'});
                storage.setItem('tab',JSON.stringify({tabId:2}));
            })
        }else{
            storage.setItem('back',JSON.stringify({id:0}))
            this.props.router.push({pathname:'/index/bookshelf'});
        }
    };
	render() {
        //const { tabId } = this.state;
        let tabId = this.state.tabId;
        let userInfo = storejs.get('userInfo');
        const tab = JSON.parse(storage.getItem('tab'));
        if(tab&&tab.tabId){
            tabId=tab.tabId;
        }
        const sidebar=(
            <div className={css.userInfo}>
                <div className={css.userMessage}>
                    <div className={css.headImgBox} style={{backgroundImage:`url(${OSS_PRE}/images/personalcenter/sidebar_bg.png)`}}>
                        <div className={css.ImgVipLogo}>
                        <img src={`${userInfo.avatar}`} alt='' className={css.headImg}/>
                        {
                            this.vipLogo()
                        }
                        </div>
                        <p className={css.userName}>
                            {userInfo.name}&nbsp;&nbsp;ID:{userInfo.id}
                        </p>
                        <div className={css.bookBSurplus}>
                            <span className={css.yueBoob}>余额：<span>{this.state.myBookB}</span> 书币</span>
                            <div className={css.forMore} onClick={this.jumpShare.bind(this)}>获取更多</div>
                        </div>
                    </div>

                </div>
                <div className={css.evaluateHistory}>
                    <ul>
                        <li onClick={this.evaluate.bind(this)}>
                                <img src={`${OSS_PRE}/images/personalcenter/my_comment.png`} className={css.iconFont}/>
                                <p>我的点评</p>
                        </li>
                        <li onClick={this.history.bind(this)}>
                            <img src={`${OSS_PRE}/images/personalcenter/history.png`} className={css.iconFont}/>
                            <p>阅读记录</p>

                        </li>
                        <li onClick={this.feedback.bind(this)}>
                            <img src={`${OSS_PRE}/images/personalcenter/feedback.png`} className={css.iconFont}/>
                            <p>意见反馈</p>
                        </li>
                        <li>
                            <img src={`${OSS_PRE}/images/personalcenter/customer_service.png`} className={css.iconFont}/>
                            <p>
                                联系客服
                                <span className={css.wechatDiv}>微信：pob999</span>
                            </p>
                        </li>
                    </ul>
                </div>
            </div>
        );
		return (
			<div>
                <div className={css.headers}>
                    <div className={css.headers_content}>
                        <img className={css.user_center} onClick={this.onOpenChange} src={`${OSS_PRE}/images/personalcenter/my_account.png`}/>
                        <div className={css.s_search_content}>
                            <Icon  className={css.ic_2} type='search' />
                            <div className={css.line_y}/>
                            <form action='javascript:return true' className={css.s_input}>
                                <input
                                    type="text"
                                    className={css.s_input1}
                                    onFocus={()=>browserHistory.push("/search")}
                                />
                            </form>
                        </div>
                        <p className={css.search}>搜索</p>
                    </div>
                    <div style={parseInt(tabId)===1?{display:'none'}:{}}  className={css.bars_content}>
                        {operate.tabs.map((item,index)=>{
                            return <p style={parseInt(tabId)===item.id?{color:'#F3916B'}:{}} onClick={this.handleTab.bind(this,item.id)} key={index}>{item.name}</p>
                        })}
                    </div>
                </div>
				<div className={css.content}>
                    {this.props.children}
				</div>
                {
                    this.state.open?<Drawer
                    className="my-drawer"
                    overlayStyle={{position:'fixed',height:'100%',zIndex:9998}}
                    style={{ minHeight: document.documentElement.clientHeight }}
                    enableDragHandle={false}
                    sidebar={sidebar}
                    open={this.state.open}
                    onOpenChange={this.onOpenChange}
                    sidebarStyle={{width:'80%',height:'100%',zIndex:9999,position:'fixed'}}
                    transitions={true}
                    >&nbsp;
                    </Drawer>:''
                }

			</div>
			)

	}
    //抽屉动画
    onOpenChange = (...args) => {
        this.setState({ open: !this.state.open });
    }
    //判断是否为vip渲染皇冠
    vipLogo(){
        if(this.state.isVip>0){
            return(
                <img src={`${OSS_PRE}/images/personalcenter/icon_vip_yellow@2x.png`} alt='' className={css.vipLogo}/>
            )
        }else{
            return(
                <img src={`${OSS_PRE}/images/personalcenter/icon_vip_gray@2x.png`} alt='' className={css.vipLogo}/>
            )
        }
    }
    //点击获取更多跳转到分享页
    jumpShare(){
        this.props.router.push("/agent/share")
    }
    clickOpenVIP(){
        this.props.router.push('/open-vip');
    }
    clickBookB(){
        this.props.router.push('/charge');
    }
    evaluate(){
        this.props.router.push('/evaluate');
    }
    history(){
        this.props.router.push('/history');
    }
    feedback(){
        this.props.router.push('/feedback');
    }
    componentWillUnmount(){
        this.setState = () => {
            return ;
        };
    }
}
export default Index;
