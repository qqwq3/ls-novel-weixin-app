import React, {Component} from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory, IndexRedirect} from 'react-router';

import { Provider } from 'react-redux';
// 引入store文件，下步会创建
import configureStore from './store/ConfigureStore';
// 调用 store 文件中的rootReducer常量中保存的方法
let store = configureStore();

import Index from './components/Index/index';
import BookShelf from './components/BookShelf/bookShelf';
import BookCity from './components/BookCity/bookCity';
import BookRankings from './components/BookRankings/bookRankings';
import BookDetail from './components/BookDetail/bookDetail';
import Classification from'./components/Classification/classification';
import SecondCate from'./components/Classification/secondCate';
import BookList from './components/BookList/bookList';
import BookPage from './components/BookPage/bookPage';
import Agent from "./components/BookShelf/banner/agent";
import BindPhone from "./components/BookShelf/banner/bindphone";
import Success from "./components/BookShelf/banner/success";

import OpenVip from './components/My/OpenVip';
import Charge from './components/My/Charge'
import Evaluate from "./components/My/Evaluate";
import History from "./components/My/History";
import Feedback from "./components/My/Feedback";
import ParseCode from "./auth/ParseCode";
import {login} from "./utils/AuthUtils";
import storejs from "storejs";
import Share from "./components/BookShelf/banner/share";
import SearchPublic from './components/Search/search';
import {HttpClient} from "./utils/HttpUtils";
const storage = window.sessionStorage;

//不加登录验证的页面
const page_filter = ['/parsecode'];

export default class Container extends Component{

	constructor (props){
		super(props);
        console.log('main1',location.href)
		storage.setItem('indexUrl',JSON.stringify({url:location.href}));
	}

	componentWillMount (){
        HttpClient.get('/api/app/launch_v2').then((res)=>{
            if (res.data.data.is_clear){
                storejs.remove('userInfo');
                let url = location.href;
                page_filter.map((value)=>{
                    //没包含在过滤列表的都要求登陆
                    let reg = RegExp(value);
                    if (!reg.test(url)){
                        login(encodeURIComponent(url));
                    }
                });

            }

        });
        console.log('main',this)
	}



	render() {
		let url = location.href;
		return page_filter.map((pattern, index)=>{
			//没包含在过滤列表和没得登录信息的的都返回空白
			let reg = RegExp(pattern);
			if (!reg.test(url) && !storejs.get('userInfo')){
				return '';
			}
			return (<Provider key={index} store={store}>
				<div>
					{this.props.children}
				</div>
			</Provider>)
		});

    }
}


const root = document.getElementById('app');

render((
	<Router history={browserHistory}>
		<Route path="/" component={Container}>
			<Route path="/parsecode" component={ParseCode} />
			<IndexRedirect to="/index/book-city"  />
			<Route path="/index" component={Index}>
                <Route path="bookshelf" components={BookShelf}/>
                <Route path="book-city" components={BookCity}/>
                <Route path="book-rankings" components={BookRankings} />
				<Route path="classification" components={Classification}/>
			</Route>
			<Route path="open-vip" components={OpenVip}/>
			<Route path="charge" components={Charge}/>
			<Route path='evaluate' components={Evaluate}/>
			<Route path='history' components={History}/>
			<Route path='feedback' components={Feedback}/>
			<Route path="book-detail" components={BookDetail} />
            <Route path="secondcate" components={SecondCate} />
			<Route path="/search" components={SearchPublic} />
			<Route path="/agent">
				<Route path="index" components={Agent} />
				<Route path="phone" components={BindPhone} />
				<Route path="success" components={Success} />
				<Route path="share" components={Share} />
			</Route>
            <Route path="book-list" components={BookList} />
			<Route path="book-page(/:id)" components={BookPage} />
            <Route path="search-public" components={SearchPublic} />
		</Route>
	</Router>					
),root);