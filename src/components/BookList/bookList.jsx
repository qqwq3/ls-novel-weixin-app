import React, {Component} from 'react';
import axios from 'axios';
import css from './bookList.less';
import cfg from '../../../config/app';
axios.defaults.baseURL = cfg.urls;
import {Icon,Modal,WhiteSpace, WingBlank } from 'antd-mobile';
import { browserHistory } from 'react-router';
import {setTitle} from "../../utils/ViewTitleUtils";
import {OSS_PRE} from '../../constant/ActionTypes';
import {HttpClient} from "../../utils/HttpUtils";
const storage = window.sessionStorage;
function removeChar(str) {
    const reg = new RegExp(str,"g");
    return str.replace(reg,"");
}
function closest(el, selector) {
    const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
        if (matchesSelector.call(el, selector)) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}
class BookList extends Component{
    constructor(props){
        super(props);
        this.state = {
            chaptersList:[],
            hex_id:this.props.location.state.hex_id,
            title:'目录',
            height: document.documentElement.clientHeight,
            limit:100,
            totalChapter:'',
            offset:0,
            reverserImg:true,
            moneyIndex:0,
            allChapterIndex:0,
            arrChapter:[],
            modal1: false,
            currentIndex:0,
            clickIndex:1
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
    showModal = key => (e) => {
        e.preventDefault(); // 修复 Android 上点击穿透
        this.setState({
            [key]: true,
        });
    };
    onClose = key => () => {
        this.setState({
            [key]: false,
        });
    };
    onWrapTouchStart = (e) => {
        // fix touch to scroll background page on iOS
        if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
            return;
        }
        const pNode = closest(e.target, '.am-modal-content');
        if (!pNode) {
            e.preventDefault();
        }
    };
    componentWillMount(){
        this.shareOperate();
        HttpClient.get(`/api/app/book/get-chapters-pager?book_id=${this.state.hex_id}&limit=${this.state.limit}&offset=${this.state.offset}`).then(res=>{
            this.setState({
                totalChapter:res.data.data.total_records,
                title:res.data.data.book.title,
                chaptersList: res.data.data.chapters,
                moneyIndex:res.data.data.book.vip_chapter_index
            },()=>{
                const allChapter=this.state.totalChapter;
                    this.setState({
                        allChapterIndex : Math.ceil(allChapter/100),
                    },()=>{
                        const arr1=[];
                        for(let i=0;i<this.state.allChapterIndex;i++){
                            if(i>=0){
                                arr1.push(i+1)
                            }
                        }
                        this.setState({
                            arrChapter : arr1
                        })
                    })
            })
        })
    }
    goBack = () =>{
        console.log(222,this.props);
        browserHistory.goBack();
    };
    render(){
        return(
            <div className={css.headers}>
                <div className={css.header}>
                    <Icon className={css.iconLeft} onClick={this.goBack.bind(this)} color={'#808080'} type="left"/>
                    <div className={css.title}>{this.state.title}</div>
                    <div className={css.iconRight}></div>
                </div>
                <div className={css.chapters}>
                    <div className={css.totalChapters}>
                        <p>共{this.state.totalChapter}章</p>
                    </div>
                    <div className={css.changeChapters}>
                        <WingBlank>
                        <ul className={css.clickUl}>
                                <li onClick={this.showModal('modal1')}>
                                    <p>{(this.state.clickIndex-1)*100+1}-{this.state.clickIndex==this.state.allChapterIndex?this.state.totalChapter:this.state.clickIndex*100}章</p>
                                    <img src={`${OSS_PRE}/images/personalcenter/index_more.png`} />
                                </li>
                            </ul>
                        {/*<WhiteSpace />*/}
                            <Modal
                                visible={this.state.modal1}
                                transparent
                                maskClosable={true}
                                onClose={this.onClose('modal1')}
                                title="目录"
                                wrapProps={{ onTouchStart: this.onWrapTouchStart }}
                                popup={true}
                                closable={true}
                                style={{width:'70%',top:"50%",marginTop:'-150px',left:'50%',marginLeft:'-35%'}}
                            >
                                <div className={this.state.arrChapter.length>=4?css.modalDiv:''}>
                                    <ul className={css.chapterUl}>
                                        {
                                            this.state.arrChapter.map((item,index)=>
                                                <li ref='chapterValue' key={item} onClick={this.catalogueClick.bind(this,index)} className={this.state.currentIndex===index?css.activeClass:''}>
                                                    {(item-1)*100+1}-
                                                    {
                                                        item==this.state.allChapterIndex?this.state.totalChapter:item*100
                                                    }章
                                                </li>
                                            )}
                                    </ul>
                                </div>
                            </Modal>
                        </WingBlank>
                    </div>
                    <div className={css.sequence} onClick={this.reverseClick.bind(this)}>
                        {
                            this.state.reverserImg?<img src={`${OSS_PRE}/images/personalcenter/descending.png`} />:<img src={`${OSS_PRE}/images/personalcenter/ascending.png`} />
                        }
                    </div>
                </div>
                <div className={css.line}></div>
                <ul className={css.chaptersList}>
                    {
                        this.state.chaptersList.map((item, index) => {
                            return<li key={index} onClick={this.jumpToRead.bind(this, item.hex_id)}>
                                    <p>{item.title}</p>
                                    {(item.source_site_index) >= this.state.moneyIndex?<img src={`${OSS_PRE}/images/bookdetail/icon_rmb@2x.png`}/>:''}
                                </li>


                        })
                    }
                </ul>
            </div>
        )
    }
    //点击跳章节
    jumpToRead = (id) =>{
        console.log(id);
        this.props.router.push({pathname:'/book-page',state:{hex_id:id}});
    };
    //点击目录请求数据
    catalogueClick(index){
        this.setState({
           clickIndex:index+1
        });
        this.onClose('modal1')();
        if(sessionStorage.getItem(`chapter${index}`)==null){
            HttpClient.get(`/api/app/book/get-chapters-pager?book_id=${this.state.hex_id}&limit=${this.state.limit}&offset=${(this.state.offset+100)*index}`).then(res=>{
                this.setState({
                    chaptersList:res.data.data.chapters,
                    reverserImg:true,
                    currentIndex:index,
                },()=>{
                    sessionStorage.setItem(`chapter${index}`,JSON.stringify(this.state.chaptersList));
                })
            })
        }else{
            this.setState({
                chaptersList:JSON.parse(sessionStorage.getItem(`chapter${index}`)),
                reverserImg:true,
                currentIndex:index,
            })
        }

    }
    reverseClick(){
        this.setState({
            chaptersList:this.state.chaptersList.reverse(),
            reverserImg:!this.state.reverserImg,
        })
    }
    componentWillUnmount(){
      for(var i=0;i<this.state.allChapterIndex;i++){
          sessionStorage.removeItem(`chapter${i}`);
      }
    }
}


export default BookList;