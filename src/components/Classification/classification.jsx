import React, {Component} from 'react';
import 'antd-mobile/dist/antd-mobile.css';
import css from './classification.less';
import Search from '../Public/Search/search';
import {OSS_PRE} from '../../constant/ActionTypes';
import {HttpClient} from '../../utils/HttpUtils';
import {setTitle} from "../../utils/ViewTitleUtils";
import {Toast} from "antd-mobile/lib/index";
//import Header from "../Index/Header/header";
const storage = window.sessionStorage;
class Classification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow:true,
            boycontent:[],
            girlcontent:[],
            pressContent:[],
            currentIndex:0,
            tabArr:['男频','女频','出版'],
            boy:true,
            girl:false,
            press:false,
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
        if(sessionStorage.getItem("boy")===null){
            HttpClient.http('get',`/api/app/book/category-list`).then(res=>{
                // console.log(res.data.data)
                this.setState({
                    boycontent: res.data.data.records.male,
                    girlcontent: res.data.data.records.female,
                    pressContent:res.data.data.records.press,
                },function(){
                    sessionStorage.setItem('boy',JSON.stringify(this.state.boycontent));
                    sessionStorage.setItem('girl',JSON.stringify(this.state.girlcontent));
                    sessionStorage.setItem('press',JSON.stringify(this.state.pressContent));
                })
            });
        }else{
            this.setState({
                boycontent:JSON.parse(sessionStorage.getItem('boy')),
                girlcontent:JSON.parse(sessionStorage.getItem('girl')),
                pressContent:JSON.parse(sessionStorage.getItem('press')),
            })
        }

    }
    componentWillUnmount(){
        this.setState = () => { return; };
    }
    render() {

        return (
            <div className={css.classification}>
                <div className={css.left}>
                    <ul className={css.tabUl}>
                        {
                            this.state.tabArr.map((item,index)=>{
                                return(
                                    <li key={index}
                                        className={this.state.currentIndex===index?css.activeClass:''}
                                        onClick={this.handleClick.bind(this,index)}
                                    >{item}</li>
                                )
                            })
                        }
                    </ul>
                </div>
                <div className={css.right}>
                    <div className={css.bookContent}>
                        {
                            this.state.boy?this.state.boycontent.map((item,index)=>
                                    this.drawDom(item,index)
                                ):''

                        }
                        {
                            this.state.girl?this.state.girlcontent.map((item,index)=>
                                this.drawDom(item,index)
                            ):''
                        }
                        {
                            this.state.press?this.state.pressContent.map((item,index)=>
                                this.drawDom(item,index)
                            ):''
                        }
                    </div>
                </div>
            </div>
        )
    }

    handleClick(index) {
        this.setState({
            currentIndex:index,
            boy: index === 0 ? true : false,
            girl: index === 1 ? true : false,
            press: index === 2 ? true : false,
        })
    }

    handleClickDetail = (id,name) =>{
        this.props.router.push({pathname:'/secondcate',state:{hex_id:id,hex_name:name}});
    };
    drawDom(item,index){
        return(
            <div key={index} className={css.rightBook} onClick={this.handleClickDetail.bind(this,item.id,item.category_name)}>
                <img className={css.img} src={item.cover}/>
                <p style={{padding:'20px 0',color:'#808080'}}>{item.category_name}</p>
            </div>
        )
    }
}
export default Classification;