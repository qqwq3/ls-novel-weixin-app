import React from "react";
import {OSS_PRE} from "../../../constant/ActionTypes";
import css from './css.less';
import {setTitle} from "../../../utils/ViewTitleUtils";
import {HttpClient} from "../../../utils/HttpUtils";
import {Toast} from "antd-mobile/lib/index";
import config from '../../../auth/wx';
import {Icon} from 'antd-mobile';
import {browserHistory} from 'react-router';
let share_url = config.BANNER_SHARE.URL;
let share_title = config.BANNER_SHARE.TITLE;
let share_desc = config.BANNER_SHARE.DESC;
const storage = window.sessionStorage;

export default class Share extends React.Component{
	constructor(props){
		super(props);
	}

	componentWillMount(){
		setTitle('分享赚书币');
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
            /*url = 'http://weixin.myfoodexpress.cn/index/book-city?id=2';*/
            url = JSON.parse(storage.getItem('indexUrl')).url;
        }
		//页面加载就初始化
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
				// 分享到朋友 分享到朋友圈
				wx.onMenuShareTimeline({
					title:  '畅享阅读时光，遇见美好未来',//share_title,
					link: 'http://weixin.myfoodexpress.cn/index/book-city?id=2',//share_url,
					imgUrl: `${OSS_PRE}/images/common/icon.png`,
					success: function () {
						// 用户点击了分享后执行的回调函数
						HttpClient.post('/api/app/user/banner/callback').then((res)=>{
							if(res.data.code !== 0){
								Toast.fail((res.data.message),1);
							}else{
								if(res.data.data.share_reward>0){
                                    Toast.success(`已增加${res.data.data.share_reward}书币`);
								}else{
                                    Toast.success(`分享成功`);
								}

							}
						});
					}
				});

				wx.onMenuShareAppMessage({
					title: '畅乐读-全网免费看',//share_title,
					desc:  '畅享阅读时光，遇见美好未来',//share_desc,
					link: 'http://weixin.myfoodexpress.cn/index/book-city?id=2',//share_url,
					imgUrl: `${OSS_PRE}/images/common/icon.png`,
					type: '', // 分享类型,music、video或link，不填默认为link
					dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
					success: function () {
						// 用户点击了分享后执行的回调函数
						HttpClient.post('/api/app/user/banner/callback').then((res)=>{
							if(res.data.code !== 0){
								Toast.fail((res.data.message),1);
							}else{
                                if(res.data.data.share_reward>0){
                                    Toast.success(`已增加${res.data.data.share_reward}书币`);
                                }else{
                                    Toast.success(`分享成功`);
                                }
							}
						});
					}
				});
			});

		});
	}


	render(){
		return (
			<div className={css.share} style={{backgroundImage:`url(${OSS_PRE}/images/bookshelf/share/coin_share_main_bg.png)`}}>
				<Icon type='left' style={{position:'absolute',width:'30px',height:'30px',top:'15px',left:'10px'}} onClick={this.goBack.bind(this)}/>
			</div>
		);
	}
    goBack(){
        browserHistory.goBack();
	}
}