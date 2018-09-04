import config from '../auth/wx';

export const login = (url)=>{
	location.href='https://open.weixin.qq.com/connect/oauth2/authorize?appid='+config.APPID+'&redirect_uri='+config.CALLBACK_URL+'&response_type=code&scope=snsapi_userinfo&state='+url+'#wechat_redirect';
};