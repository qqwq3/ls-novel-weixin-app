import React, {Component} from 'react';
import axios from 'axios';
import css from './bookCity.less';
import Search from '../Public/Search/search';
import { Carousel,Icon } from 'antd-mobile';
import cfg from '../../../config/app';
axios.defaults.baseURL = cfg.urls;
import { loadImage } from '../../utils/loadImage';
import {setTitle} from "../../utils/ViewTitleUtils";
import {HttpClient} from "../../utils/HttpUtils";
import {OSS_PRE} from "../../constant/ActionTypes";
import {browserHistory} from 'react-router';
import {Toast} from "antd-mobile/lib/index";
const storage = window.sessionStorage;

class BookCity extends React.Component{
    constructor(props) {
        super(props);
        console.log('book-city',this.props);
        this.state ={
            dataList:[],
            carousel:[{
                id:1,
                img:`${OSS_PRE}/images/bookshelf/banner/banner2.png`,
                url:'/agent/share'
            },{
                id:2,
                img:`${OSS_PRE}/images/bookshelf/banner/banner3.png`,
                url:''
            }],
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
        HttpClient.get('/api/app/book/get-promotion?promotion_id=2,3,68,69,7').then(res=>{
            console.log(res.data.data)
            const arr=[];
            const arrr=[];
            for(let key in res.data.data.promotions){
                arr.push(res.data.data.promotions[key]);
            }
            console.log(arr);
            this.setState({
                dataList:arr,
            },()=>{
                console.log(this.state.dataList);
            })
        });
    }
    handleSimilar = (id,name) =>{
        this.props.router.push({pathname:'/secondcate',state:{hex_id:id,hex_name:name}});
    };

    JumpToDetail = (id) =>{
        this.props.router.push({pathname:'/book-detail',state:{hex_id:id}});
    };
    jumpUrl(url){
        if(url==''){
            return false;
        }else{
            browserHistory.push(url)
        }
    }
    render() {
        return <div>
            <div className={css.book_city}>
                <Carousel
                    autoplay={true}
                    infinite={true}
                >
                    {this.state.carousel.map(val => (
                            <img
                                key={val.id}
                                src={val.img}
                                alt=""
                                style={{ width: '100%', verticalAlign: 'top' }}
                                onLoad={() => {
                                    window.dispatchEvent(new Event('resize'));
                                    this.setState({ imgHeight: 'auto' });
                                }}
                                onClick={this.jumpUrl.bind(this,val.url)}
                            />
                    ))}
                </Carousel>
                {this.state.dataList.map((item,index)=>{

                    return(
                        item.books.length !== 0 &&
                        <div key={index} className={css.content}>
                            <p className={css.title}>{item.title}</p>
                            <div className={css.middle} onClick={this.JumpToDetail.bind(this,item.books[0].hex_id?item.books[0].hex_id:'')}>
                            {/*<div className={css.middle} onClick={this.JumpToDetail.bind(this)}>*/}
                            <div className={css.m_img}><img className={css.m_left} src={loadImage(item.books[0].id)}/></div>
                                <div className={css.m_right}>
                                    <div className={css.title_content}>
                                        <p className={css.text_title}>{item.books[0].title}</p>
                                    </div>
                                    <div className={css.author_content}>
                                        <p className={css.author}>{item.books[0].author_name}</p>
                                        <p>{item.books[0].total_hits}人在看</p>
                                    </div>
                                    <p className={css.remark}>{(/<br\s*\/?>/gi.test(item.books[0].description)  ? item.books[0].description.replace(/<br\s*\/?>/gi,"\r\n") : item.books[0].description)}</p>
                                    <div className={css.types}>
                                        <p className={item.books[0].status===1?css.complete1:item.books[0].status===2?css.complete2:css.complete}>{item.books[0].status===0?'下架':item.books[0].status===1?'连载':item.books[0].status===2?'完结':''}</p>
                                        <p className={css.numbers}>{((item.books[0].total_words)/10000).toFixed(2)}万字</p>
                                        <p className={css.book_type}>{item.books[0].category_name}</p>
                                    </div>
                                </div>
                            </div>
                            <div onClick={this.handleSimilar.bind(this,item.books[0].category_id,item.books[0].category_name)} className={css.more}>
                                <p>更多</p>
                                <Icon className={css.icon_more} type='right'/>
                            </div>
                            <div className={css.recomend}>
                                {item.books.map((items,indexs)=>{
                                    return  indexs >0 && indexs <= 4?
                                        <div key={indexs} onClick={this.JumpToDetail.bind(this,items.hex_id)} className={indexs%4==0?css.re_texts:css.re_text}>
                                            <img className={css.re_img} src={loadImage(items.id)} />
                                            <p className={css.text_name}>{items.title}</p>
                                        </div>:''
                                })}
                            </div>
                            <div className={this.state.dataList.length-index==1?'':css.lines}></div>
                        </div>
                    )
                })}
            </div>


        </div>
    }

}

export default BookCity;