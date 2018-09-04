import React, {Component} from 'react';
import axios from 'axios';
import css from './bookPage.less';
import cfg, {share_desc, share_title, share_url} from '../../../config/app';
axios.defaults.baseURL = cfg.urls;
import { loadImage } from '../../utils/loadImage';
import { Icon,Toast } from 'antd-mobile';
import { browserHistory } from 'react-router';
import moment from 'moment';
import {setTitle} from "../../utils/ViewTitleUtils";
import Modal from "../Public/Modal/modal";
import operate from "./operate";
import stores from 'storejs'
import {HttpClient} from "../../utils/HttpUtils";
import {OSS_PRE} from "../../constant/ActionTypes";

window.onload = function(){
    document.onclick = function(e){
        e = e || window.event;
        var dom =  e.srcElement|| e.target;
        if(dom.id == "menus" && document.getElementById("menus").style.display == "block") {
            document.getElementById("menus").style.display = "none";
            e.stopPropagation();
        }
    };
    console.log(222)
};

const storage = window.sessionStorage;

class BookPage extends React.Component{

    constructor(props) {
        super(props);
        console.log(33333,this.props)
        console.log(document.documentElement.clientHeight)
        const page = stores.get('page');
        /*console.log('xx',this.props.location.state.hex_id)*/
        console.log(page)
        this.state = {
            disabled:false,
            recharge_visible:false,
            style_visible:false,
            check_visible:false,//检查签到
            share_visible:false,//分享
            first_visible:false,//第一次阅读
            isLoading:false,
            signData:{},
            tabContent:operate.tabContent,
            hex_id:this.props.location.query.id?this.props.location.query.id:this.props.location.state.hex_id,
            pageContent:null,
            books:{},
            chapterData:{},
            fontSize:page && page.fontSize?page.fontSize:20,
            night:page && page.night===true?page.night:false,
            backGround:page && page.backGround?page.backGround:'#EFEBDF',
            deviceHeight:document.documentElement.clientHeight
        }
    }

    goBack = (hex_id) =>{
        browserHistory.goBack();
    };

    componentWillMount() {
        const id = this.state.hex_id;
        console.log(this.state.hex_id)
        this.getData(id);
        this.checks();
        /*this.shareOperate();*/
        const read = stores.get('read');
        if(read && read.read){

        }else{
            stores.set('read',{read:true});
            this.setState({
                first_visible:true
            })
        }
    }

    checks = () =>{
        HttpClient.get(`/api/app/user/check-sign-in`).then(res=>{
            console.log('check',res.data)
            if(res.data.code==0){
                if(!res.data.data.singed){
                    this.sign();
                }
            }
        })
    };
    sign = () =>{
        HttpClient.post(`/api/app/user/sign-in`).then(res=>{
            console.log('sign',res.data)
            if(res.data.code==0){
                this.setState({
                    check_visible:true,
                    signData:res.data.data
                })
            }
        })
    }

    getData = (id) =>{
        console.log(5555,id)
        this.setState({
            isLoading:true
        },()=>{
            Toast.loading('加载中...',0);
        });
        HttpClient.get(`/api/app/book/get-chapter?chapter_id=${id}`).then(res=>{
            console.log(123,res.data)
            if(res.data.code==0){
                this.setState({
                    pageContent:res.data.data.chapter.content,
                    books:res.data.data.book,
                    chapterData:res.data.data.chapter
                },()=>{
                    const {chapterData} = this.state;
                    this.shareOperate();
                    scrollTo(0,0);

                    if(chapterData.result&&chapterData.result.value==1){
                        this.setState({
                            recharge_visible:true
                        })
                    }
                    const list = stores.get('list');
                    if(list && list.iconId){
                        list.iconId = chapterData.hex_id;
                        stores.set('list',list);
                    }else{
                        stores.set('list',{iconId:chapterData.hex_id})
                    }
                })
            }else{
                Toast.info('获取章节错误！',1)
            }
            Toast.hide();
        })
    };

    EjectMenu = () =>{
        console.log('menu')
        this.setState({
            disabled:!this.state.disabled
        })
    };
    handleCancel = () =>{
        this.setState({
            disabled:false,
            style_visible:false
        })
    };
    jumpToShare = () =>{
        this.setState({
            share_visible:true,
            recharge_visible:false
        });
        /*this.shareOperate();*/
        setTimeout(()=>{
            this.setState({
                share_visible:false,
            })
        },5000)
    };

    beforeRouteEnter = (to, from, next)=> {
        var u = navigator.userAgent;
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        // XXX: 修复iOS版微信HTML5 History兼容性问题
        if (isiOS && to.path !== location.pathname) {
            // 此处不可使用location.replace
            location.assign(to.fullPath)
        } else {
            next()
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


    handleRechargeCancel = () =>{
        this.setState({
            recharge_visible:false
        },()=>{
            this.goBack();
        })
    };

    AddFontSize = () =>{
        if(this.state.fontSize>=36){
            Toast.info('已经是最大字体了！',1)
        }else{
            this.setState({
                fontSize:this.state.fontSize + 4
            },()=>{
                const page = stores.get('page');
                if(page && page.fontSize){
                    page.fontSize = this.state.fontSize;
                    stores.set('page',page);
                }else{
                    stores.set('page',{fontSize:this.state.fontSize})
                }
                console.log(111,stores.get('page'))
            })
        }

    };
    ReduceFontSize = () =>{
        if(this.state.fontSize<=14){
            Toast.info('已经是最小字体了！',1)
        }else{
            this.setState({
                fontSize:this.state.fontSize - 4
            },()=>{
                const page = stores.get('page');
                if(page && page.fontSize){
                    page.fontSize = this.state.fontSize;
                    stores.set('page',page);
                }else{
                    stores.set('page',{fontSize:this.state.fontSize})
                }
            })
        }

    };
    ChooseStyle = (backGround) =>{
        this.setState({
            backGround:backGround
        },()=>{
            const page = stores.get('page');
            if(page && page.backGround){
                page.backGround = this.state.backGround;
                stores.set('page',page);
            }else{
                stores.set('page',{backGround:this.state.backGround})
            }
            console.log(222,stores.get('page'))
        })
    };
    chapterUp = (id) =>{
        if(id){
            this.getData(id);
            scrollTo(0,0);
        }else{
            Toast.info('已经是第一章节了！',1);
        }
    };
    chapterDown = (id) =>{
        if(id){
            this.getData(id);
            scrollTo(0,0);
        }else{
            Toast.info('已经是第最后一章节了！',1);
        }
    };
    jumpToBookList = (id) =>{
        this.props.router.push({pathname:'/book-list',state:{hex_id:id}});
    };
    pageTab = (id) =>{
        const {chapterData,books} = this.state;
        switch (id) {
            case 1 :
                if(chapterData.turn_page.prev&&chapterData.turn_page.prev.hex_id){
                    this.getData(chapterData&&chapterData.turn_page?chapterData.turn_page.prev.hex_id:'');
                    scrollTo(0,0);
                }else{
                    Toast.info('已经是第一章节了！',1);
                }
                break;
            case 2 :
                this.props.router.push({pathname:'/book-list',state:{hex_id:books.hex_id}});
                break;
            case 3 :
                this.setState({
                    style_visible:!this.state.style_visible
                });
                break;
            case 4 :
                this.setState({
                    night:!this.state.night,
                    backGround:this.state.backGround=='#3C4D45'?'#EFEBDF':'#3C4D45'
                },()=>{
                    const page = stores.get('page');
                    if(page && page.night && page.backGround){
                        page.night = this.state.night;
                        page.backGround = this.state.backGround;
                        stores.set('page',page);
                    }else{
                        stores.set('page',{night:this.state.night,backGround:this.state.backGround});
                    }
                    console.log(221,page);

                });
                break;
            case 5 :
                if(chapterData.turn_page.next&&chapterData.turn_page.next.hex_id){
                    this.getData(chapterData&&chapterData.turn_page?chapterData.turn_page.next.hex_id:'');
                    scrollTo(0,0);
                }else{
                    Toast.info('已经是第最后一章节了！',1);
                }
                break;
        }

    };

    addBookShelf = (id) =>{
        HttpClient.post(`/api/app/book/add-book-case`,{book_id:id}).then(res=>{
            console.log(212,res.data)
            if(res.data.code==0){
                if(res.data.data=='add'){
                    Toast.info('加入书架成功!',1);
                }else{
                    Toast.info('已经加入书架!',1);
                }
            }else{
                Toast.info('加入书架失败!',1);
            }
        })
    };

    handleCheckCancel = () =>{
        this.setState({
            check_visible:false
        })
    };

    backToHome = () =>{
        storage.setItem('tab',JSON.stringify({iconId:2}));
        this.props.router.push({pathname:'/index/book-city'});
    };

    // 文字处理
    textFormat(content){
        const _contentArr = [];

        content.map((value, index) => _contentArr[index] = '\u3000\u3000' + value);

        return _contentArr;
    }

    render() {
        const {pageContent,books,chapterData,night,signData,fontSize} = this.state;
        const _arr = this.textFormat( chapterData.content || []);


        return <div style={{backgroundColor:this.state.backGround}}>
            <div style={this.state.disabled?{}:{display:'none'}} className={css.p_header}>
                <Icon type='left' onClick={this.goBack.bind(this)} className={css.left_back} />
                <p className={css.p_title}>{books.title}</p>
                {/*<img onClick={this.addBookShelf.bind(this,books.id)} className={css.add_shelf} src={`${OSS_PRE}/images/common/toolbar/tab_my_account_unsel@2x.png`} />*/}
            </div>
            <div onClick={this.handleCancel.bind(this)} className={css.p_content} style={{minHeight:this.state.deviceHeight}}>
                <p style={{fontSize:this.state.fontSize}} className={css.p_content_title}>{chapterData.title}</p>
                <div style={{fontSize:this.state.fontSize,lineHeight:`${fontSize/0.6}px`}} className={css.p_contents}>
                    {
                        _arr.map((text, index) => {
                            return (<p style={{ marginTop: 1 + 'rem'}} key={index}>{ text }</p>)
                        })
                    }
                </div>
                <div className={css.chapter_down}>
                    <p className={css.turn_down} onClick={this.chapterDown.bind(this,chapterData&&chapterData.turn_page&&chapterData.turn_page.next?chapterData.turn_page.next.hex_id:'')}>下一章</p>
                    <div className={css.turn_content}>
                        <p onClick={this.jumpToBookList.bind(this,books.hex_id)}>目录</p>
                        <div className={css.line_y} />
                        <p onClick={this.chapterUp.bind(this,chapterData&&chapterData.turn_page&&chapterData.turn_page.prev?chapterData.turn_page.prev.hex_id:'')}>上一章</p>
                        <div className={css.flex}/>
                        <p className={css.back_home} onClick={this.backToHome.bind(this)}>首页</p>
                        <div className={css.line_y} />
                        <p className={css.add_to_shelf} onClick={this.addBookShelf.bind(this,books.id)}>添加至书架</p>
                    </div>
                </div>
            </div>
            <div
                style={this.state.disabled?{display:'block'}:{display:'none'}}>
                <div style={this.state.style_visible?{}:{height:50}} className={css.p_modal}>
                    <div style={this.state.style_visible?{display:'block'}:{display:'none'}}>
                        <div className={css.font}>
                            <p className={css.fp1}>字体</p>
                            <p className={css.fp2} onClick={this.AddFontSize.bind(this)}>A+</p>
                            <p className={css.size}>{this.state.fontSize}</p>
                            <p className={css.fp2} onClick={this.ReduceFontSize.bind(this)}>A-</p>
                        </div>
                        <div className={css.styles}>
                            <p className={css.s_p1}>风格</p>
                            {operate.bookStyle.map((item,index)=>{
                                return <p key={index} style={{backgroundColor:item.backGround}} onClick={this.ChooseStyle.bind(this,item.backGround)} className={css.s_p}>{item.name}</p>
                            })}
                        </div>
                    </div>

                    <div className={css.bottom}>
                        <div className={css.tab_bar}>
                            {this.state.tabContent.map(item=>{
                                return <div onClick={this.pageTab.bind(this,item.id)} className={css.iconDiv} key={item.id}>
                                    <img className={css.icon} src={item.id==4?(night?item.selectUrl:item.fontUrl):item.fontUrl}/>
                                    <p className={css.iconName}>{item.id==4?(night?'日间':'夜间'):item.name}</p>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div id='menus' onClick={this.EjectMenu.bind(this)} className={css.menus}/>
            <div id='recharge' style={this.state.recharge_visible?{display:'block'}:{display:'none'}} className={css.recharges}>
                <div className={css.modal_recharge}>
                    <div className={css.m_top}>
                        <p className={css.m1}>余额提醒</p>
                        <p className={css.m_2}>书币余额不足！</p>
                        <p className={css.m_3}>当前余额: <span>{signData.balance}</span>书币</p>
                    </div>
                    <div className={css.lines}/>
                    <div className={css.m_bottom1}>
                        <p onClick={this.jumpToShare.bind(this)} className={css.b_1}>立即获取</p>
                        <div className={css.line_v}/>
                        <p onClick={this.handleRechargeCancel.bind(this)} className={css.b_2}>不看了</p>
                    </div>
                </div>
            </div>
            <div id='check' style={this.state.check_visible?{display:'block'}:{display:'none'}} className={css.checks}>
                <div className={css.modal_check}>
                    <div className={css.m_top}>
                        <p className={css.c_1}>签到成功</p>
                        <p className={css.c_22}>今日首次阅读，获得<span>{signData.reward}</span>书币</p>
                        <p className={css.c_3}>当前余额: <span>{signData.balance}</span>书币</p>
                        <div className={css.lines}/>
                        <p onClick={this.handleCheckCancel.bind(this)} className={css.know}>我知道啦</p>
                    </div>
                </div>
            </div>
            <img style={this.state.share_visible?{display:'block'}:{display:'none'}}  className={css.share_png} onClick={()=>{this.setState({share_visible:false})}} src={cfg.OSS_PRE+'/images/bookshelf/share/coin_share_main_bg.png'}/>
            <img style={this.state.first_visible?{display:'block'}:{display:'none'}}  className={css.first_read_png} onClick={()=>{this.setState({first_visible:false})}} src={cfg.OSS_PRE+'/images/read/tutorial.png'}/>
        </div>
    }
}

export default BookPage;