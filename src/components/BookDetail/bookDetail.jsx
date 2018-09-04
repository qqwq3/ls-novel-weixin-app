import React, {Component} from 'react';
import axios from 'axios';
import css from './bookDetail.less';
import cfg from '../../../config/app';
axios.defaults.baseURL = cfg.urls;
import { loadImage } from '../../utils/loadImage';
import { Icon,Toast } from 'antd-mobile';
import { browserHistory } from 'react-router';
import moment from 'moment';
import {setTitle} from "../../utils/ViewTitleUtils";
import Header from "../Public/Header/header";
import {HttpClient} from "../../utils/HttpUtils";
import Books from "../BookShelf/booklist";
import stores from 'storejs'
import {OSS_PRE} from "../../constant/ActionTypes";
const storage = window.sessionStorage;

class BookDetail extends React.Component {
    constructor(props) {
        super(props);
        const page = stores.get('page');
        console.log(111,this.props)
        this.state = {
            bookDetailList:{},
            hex_id:this.props.location.state.hex_id,
            recommendList:[],
            iconName:'down',
            similarList:[],
            pages:null,
            fledTextHeight: 65,
            fledTextStatus: false,
            showAll:false
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

    componentWillMount(){
        setTitle('小说天堂');
        this.shareOperate();
        console.log('componentWillMount',this.state.hex_id)
        this.getData(this.state.hex_id);

    }

    getData = (id) =>{
        HttpClient.get(`/api/app/book/detail?id=${id}`).then(res=>{
            console.log(res.data)
            if(res.data.code==0){
                this.setState({
                    bookDetailList:res.data.data
                },()=>{
                    //this.getComments(this.state.bookDetailList.id);
                    this.getSimilarBooks(this.state.bookDetailList.id);
                    this.getChapters(this.state.bookDetailList.hex_id);
                })
            }
        });
    };

    /***
     * 获取评论
     ***/
    getComments = (id) =>{
        HttpClient.get(`/api/app/book/get-comments?book_id=${id}`).then(ress=>{
            console.log(222,ress.data)
            if(ress.data.code==0){
                this.setState({
                    recommendList:ress.data.data.records,
                })
            }
        });
    };
    /***
     * 获取相识书籍
     ***/
    getSimilarBooks = (id) =>{
        HttpClient.get(`/api/app/book/similar?book_id=${id}`).then(resss=>{
            console.log(resss.data)
            if(resss.data.code==0){
                this.setState({
                    similarList:resss.data.data.records
                })
            }
        });
    };
    /***
     * 获取总章节数
     **/
    getChapters = (id) =>{
        HttpClient.get(`/api/app/book/get-chapters-pager?book_id=${id}&page=1&limit=1`).then(resC=>{
            console.log(33,resC.data)
            if(resC.data.code==0){
                this.setState({
                    pages:resC.data.data.total_records
                })
            }
        });
    };

    goBack = () =>{
        browserHistory.goBack();
    };

    handleSwip =() =>{
        this.setState({
            iconName:this.state.iconName=='down'?'up':'down',
            fledTextStatus: !this.state.fledTextStatus,
        })
    };
    jumpToLastChapter = (id) =>{
        if(id){
            this.props.router.push({pathname:'/book-page',state:{hex_id:id}});
        }
    };
    jumpToBookDetail = (id) =>{
        console.log('sss',this.state.hex_id)
        this.setState({
            hex_id:id
        },()=>{
            this.getData(id);
            scrollTo(0,0);
            location.reload([false]);
            /*const page = stores.get('page');
            if(page){
                page.hex_id = id;
                stores.set('page',page);
            }else{
                stores.set('page',{fontSize:id})
            }*/
            this.props.router.push({pathname:'/book-detail',state:{hex_id:id}})
        })
    };

    componentDidMount() {
        console.log('componentDidMount',this.state.hex_id)
    }

    addBookShelf = (id) =>{
        HttpClient.post(`/api/app/book/add-book-case`,{book_id:id}).then(res=>{
            console.log(212,res.data)
            if(res.data.code==0){
                if(res.data.data=='add'){
                    Toast.info('加入书架成功!',1);
                    Books.addBook();
                }else{
                    Toast.info('已经加入书架!',1);
                }
            }else{
                Toast.info('加入书架失败!',1);
            }
        })
    };
    thumbsUp = (id) =>{
        HttpClient.post(`/api/app/book/like-comment`,{comment_id:id}).then(res=>{
            if(res.data.code==0){
                this.getComments(this.state.bookDetailList.id);
            }else{

            }
        })
    };

    handleShow(){
        this.setState({
            showAll:!this.state.showAll
        })
    }

    jumpToRead = (hex_id) =>{
        console.log('hex_id',hex_id)
        this.props.router.push({pathname:'/book-page',state:{hex_id:'book_id'+hex_id}});
    };
    JumpToList = (hex_id) =>{
        this.props.router.push({pathname:'/book-list',state:{hex_id:hex_id}});
    };

    render() {
        const {bookDetailList,showAll} = this.state;
        return <div className={css.book_details}><div className={css.book_detail}>
            <Header title={'书籍详情'}/>
            <div className={css.detailContent}>
                <div className={css.d_top}>
                    <div className={css.d_left}>
                        <img className={css.d_img} src={loadImage(bookDetailList.id)}/>
                    </div>
                    <div className={css.d_right}>
                        <p className={css.d_title}>{bookDetailList.title}</p>
                        <p className={css.d_author}>{bookDetailList.author_name}</p>
                        <p className={css.d_type}>{this.state.bookDetailList.category_name}<span className={css.span1}>{((bookDetailList.total_words)/10000).toFixed(2)}万字</span><span>{bookDetailList.status?bookDetailList.status.text:''}</span></p>
                    </div>
                </div>

                <div className={css.follow}>
                    <p>共有<span>{bookDetailList.total_likes}</span>个小伙伴在追这本书</p>
                    <div className={css.f_right}>
                        <div className={css.f_bottom}/>
                    </div>
                </div>

                <div>
                    <p onClick={this.handleShow.bind(this)} className={css.d_bottom} style={showAll?{webkitLineClamp:'unset'}:{}}>
                        {
                            (/<br\s*\/?>/gi.test(bookDetailList.description)  ?
                                <span className={css.p_text}>{ bookDetailList.description.replace(/<br\s*\/?>/gi,"\r\n") }</span> :
                                bookDetailList.description)
                        }
                        <span className={showAll?css.p_icons:css.p_cion} />
                    </p>
                </div>
            </div>
            <div>
                <div className={css.catalog}>
                    <div onClick={this.jumpToLastChapter.bind(this,bookDetailList&&bookDetailList.latest_chapter?bookDetailList.latest_chapter.hex_id:'')} className={css.updates}>
                        <img className={css.up_img} src={cfg.OSS_PRE+'/images/default/new_book.png'} />
                        <p className={css.up_p1}>最新</p>
                        <p className={css.up_p2}>
                            {this.state.bookDetailList.latest_chapter?this.state.bookDetailList.latest_chapter.title:''}
                            <span style={bookDetailList.latest_chapter&&bookDetailList.vip_chapter_index<bookDetailList.latest_chapter.source_site_index?{}:{display:'none'}} className={css.fee}>¥</span>
                        </p>
                        <Icon type='right' className={css.catlog_icon}/>
                    </div>
                    <div className={css.lines}/>
                    <div onClick={this.JumpToList.bind(this,this.state.bookDetailList.hex_id)} className={css.catalog_s}>
                        <img className={css.up_img1} src={cfg.OSS_PRE+'/images/bookdetail/icon_book_detail_update@3x.png'} />
                        <p className={css.up_p1}>目录</p>
                        <p className={css.up_p2}>共{this.state.pages}章</p>
                        <Icon type='right'className={css.catlog_icon}/>
                    </div>
                </div>
                {/*{this.state.recommendList.length>0?<div className={css.evaluater}>
                    <p className={css.e_title}>评论<span>(52)</span></p>
                    {this.state.recommendList.map((item,index)=>{
                        return <div key={index} className={css.e_content}>
                            <div className={css.e_left}>
                                <img className={css.e_left_img} src={loadImage(item.user_id,'avatar','64x64',false)}/>
                            </div>
                            <div className={css.e_right}>
                                <p className={css.e_name}>{item.user_name}</p>
                                <p className={css.e_remark}>{item.content}</p>
                                <div className={css.e_bottom}>
                                    <p className={css.e_time}>{moment(item.time_created).format('YYYY-MM-DD HH:mm:ss')}</p>
                                    <img className={css.zan} onClick={this.thumbsUp.bind(this,item.id)} src={cfg.OSS_PRE+'/images/bookdetail/icon_like_finger@2x.png'} />
                                    <p>{item.like_count}</p>
                                </div>
                            </div>
                        </div>
                    })}

                </div>:''}*/}
                <div className={css.recommend}>
                    <div className={css.recommend_header}>
                        <div className={css.r_span}/>
                        <p className={css.r_title}>看过本书的人还在看</p>
                    </div>

                    <div className={css.r_content}>
                        {this.state.similarList?this.state.similarList.map((item,index)=>{
                            return  <div style={index%4===0?{marginLeft:'20px'}:{}} key={index} onClick={this.jumpToBookDetail.bind(this,item.hex_id)} className={index%4==3?css.re_texts:css.re_text}>
                                <img className={css.re_img} src={loadImage(item.id)} />
                                <p className={css.text_name}>{item.title}</p>
                                <p className={css.s_author}>{item.author?item.author.name:''}</p>
                            </div>
                        }):''}

                    </div>
                </div>
            </div>
            {/*<div className={css.bt_bottom}>

                <p onClick={this.addBookShelf.bind(this,this.state.bookDetailList.id)} className={css.bt2}>加入书架</p>
                <p onClick={this.jumpToRead.bind(this,this.state.hex_id)} className={css.bt1}>立即阅读</p>
                <p className={css.bt3}>评论</p>
            </div>*/}
            <div className={css.bt_bottom1}>
                <p onClick={this.jumpToRead.bind(this,this.state.hex_id)} className={css.bt1_1}>立即阅读</p>
                <p onClick={this.addBookShelf.bind(this,this.state.bookDetailList.id)} className={css.bt2_1}>加入书架</p>
            </div>
        </div>
        </div>
    }

}

export default BookDetail;