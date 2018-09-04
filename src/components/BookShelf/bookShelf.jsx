import React from 'react';
import {Carousel, WingBlank, Icon, Toast} from "antd-mobile";
import {OSS_PRE} from "../../constant/ActionTypes";
import {setTitle} from "../../utils/ViewTitleUtils";
import Search from "../Public/Search/search";
import BookList from "./booklist";
import  './bookShelf.less';
import {HttpClient} from "../../utils/HttpUtils";
import css from './bookShelf.less';
import {loadImage} from "../../utils/loadImage";
import operate from "./operate";
import {browserHistory} from "react-router";
const storage = window.sessionStorage;

function isInArray(arr,value){
    for(let i = 0; i < arr.length; i++){
        if(value === arr[i]){
            return i;
        }
    }
    return -1;
}
Array.prototype.remove=function(dx)
{
    if(isNaN(dx)||dx>this.length){return false;}
    for(let i=0,n=0;i<this.length;i++)
    {
        if(this[i]!=this[dx])
        {
            this[n++]=this[i]
        }
    }
    this.length-=1
};

window.addEventListener('contextmenu', function(e){
    e.preventDefault();
});

window.ontouchend = function () {
    throw new Error("NO ERRPR:禁止长按弹出的菜单");
};


class BookShelf extends React.Component{
	constructor(props){
		super(props);
		setTitle("小说天堂");
		this.state = {
			imgwidth:0,
			imgheight:0,
			data: [ '2'],
			books:[],
			path: ['/agent/share'],//['/#/agent/index', '/#/agent/share']
			page:1,
			limit:200,
			showIcon:false,
			checked:false,
			iconArr:[],
			typeArr:[],
            height: document.documentElement.clientHeight,
			records:[],
		};
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
                    title: '畅乐读',//books.title,
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

	componentWillMount() {
		this.shareOperate();
		this.getData();
        addEventListener("popstate",this.handlePops());
	}

    


    handlePops = () =>{
        if(this.state.showIcon){
            console.log('第三方第三方');
            this.setState({
                iconArr:[],
                typeArr:[],
                showIcon:false
            });
		}

	};

	getData = () =>{
		const { page , limit } = this.state;
		HttpClient.get('/api/app/book/get-bookrack',{page:page,limit:limit}).then(res=>{
			console.log('bookList:',res.data)
			if(res.data.code===0){
				this.setState({
					books : res.data.data,
				})
			}else{
                Toast.fail(res.data.message,1);
			}
		})
	};

    jumpToHome = () =>{
        this.props.router.push('/index/book-city');
        storage.setItem('tab',JSON.stringify({tabId:2}))
	};

    JumpToPage = (id) =>{
    	const { showIcon } = this.state;
    	if(showIcon){

		}else{
            this.props.router.push({pathname:'/book-page',state:{hex_id:'book_id'+id}});
		}

    };

    addIcons = (id,type) =>{
    	let iconArr = this.state.iconArr;
    	let typeArr = this.state.typeArr;
    	if(isInArray(iconArr,id)>-1){
    		const index = isInArray(iconArr,id);
    		console.log(index)
			iconArr.remove(index);
            typeArr.remove(index);
		}else{
            iconArr.push(id);
            typeArr.push(type);
		}

		console.log(iconArr,typeArr)
    	this.setState({
            iconArr:iconArr,
            typeArr:typeArr
		},()=>{
            console.log('xx',this.state.iconArr,this.state.typeArr)
		})
	};

    handleDelete = () =>{
		const {iconArr,typeArr} = this.state;
		const book_ids =  iconArr.join(',');
		const book_type = typeArr.join(',');
		console.log(book_ids,book_type)
		HttpClient.post('/api/app/book/bookcase/batch_delete',{book_ids:book_ids,book_type:book_type}).then(res=>{
			if(res.data.code===0){
				Toast.info('删除成功!',1);
				this.setState({
					iconArr:[],
					typeArr:[],
					showIcon:false,
				},()=>{
					this.getData();
				})
			}else{
				Toast.fail(res.data.message,1)
			}
		})
	};

	/*componentDidMount() {
		let imgwidth = document.documentElement.clientWidth;
		let imgheight = imgwidth * 0.375;
		this.setState({imgwidth:imgwidth, imgheight:imgheight});
		setTimeout(() => {
			this.setState({
				data: ['2'],
			});
		}, 100);
	}*/
	render() {
		const { books,showIcon,checked,iconArr,records } = this.state;
		return (
			<div className={css.shelf_content}>
				{books&&books.records&&books.records.length>0?
					 <div className={css.last_book}>
						<div className={css.left}>
							<img className={css.left_img} src={loadImage(books.records[0].book_id)}/>
						</div>
						<div className={css.right}>
							<p className={css.r_title}>{books.records[0].book_title}</p>
							<div className={css.r_2}>
								<p style={{fontSize:'14px',color:'#DCDCDC'}}>读至{books.records[0].completed_chapter_index?(((books.records[0].completed_chapter_index)/(books.records[0].total_chapter_count))*100).toFixed(1):'0.0'} %</p>
								<p className={css.r_continue_read} onClick={this.JumpToPage.bind(this,books.records[0].hex_id?books.records[0].hex_id:books.records[0].book_id_hex)}>继续阅读</p>
								<img className={css.r_icon}/>
							</div>
							<p className={css.r_update}>已更新至 : <span>{books.records[0].last_chapter_title}</span></p>
						</div>
					</div>
					:<div className={css.last_books}>
						<p className={css.empty_p}>嗨，终于等到你来了</p>
					</div>}
				<div className={css.middle}>
                    <WingBlank className={css.carousel}>
                        <Carousel className="my-carousel"
                                  vertical
                                  dots={false}
                                  dragging={false}
                                  swiping={false}
                                  autoplay
                                  infinite
                        >
							{operate.carousels.map((item,index)=>{
								return <div key={index} className={css.carousel_content} onClick={this.jumpUrl.bind(this,item.url)} >
									<img src={item.img} className={css.carousel_img} />
									<p className={css.carousel_name}>{item.name}</p>
									<Icon type='right' className={css.carousel_icon} />
								</div>
							})}
                        </Carousel>
                    </WingBlank>
					<div onClick={this.jumpToHome.bind(this)} className={css.middle_right}>
						<img src={`${OSS_PRE}/images/common/toolbar/tab_bookstore_sel@2x.png`} className={css.m_r_img} />
						<p>书城</p>
					</div>
				</div>{console.log('hhhhh',this.state.height)}
				<div style={{paddingBottom:`${this.state.height-468}px`}} className={css.books}>
                    {books&&books.records&&books.records.length>0?books.records.map((item,index)=>{
                           return <div
							   key={index}
							   style={index%3===0?{marginLeft:'13%'}:{}}
							   className={index%3===2?css.books_contents:css.books_content}
							   onClick={this.JumpToPage.bind(this,item.hex_id?item.hex_id:item.book_id_hex)}
                               onTouchStart={()=>{
                                   this.begin = setInterval(()=>{
                                       clearInterval(this.begin);
                                       console.log('你长安了');
                                       this.setState({
										   showIcon:true,
										   checked:true
									   })
                                       storage.setItem('back',JSON.stringify({id:1}));
                                   }, 600)
                                   this.addIcons(item.book_id_hex,item.book_type);
                                   console.log(111)
                               }}
                               onTouchMove={()=>{
                                   clearInterval(this.begin);
                                   console.log(222)
                               }}
                               onTouchEnd={()=>{
                                   clearInterval(this.begin);
                                   console.log(333)
                                   if(showIcon){
                                       console.log(331)
                                   }else{
                                       console.log(332)
                                       //this.JumpToPage(item.hex_id?item.hex_id:item.book_id_hex);
                                   }

                               }}
						   >
								<img className={css.b_img} src={loadImage(item.book_id)}/>
							   <p className={css.b_title}>{item.book_title}</p>
								   {showIcon?<Icon type='check-circle' style={isInArray(iconArr,item.book_id_hex)>-1?{color:'#F3916A'}:{}}  className={css.icon_circle}/>:''}
                            </div>
                        })

                        :<div className={css.empty}>
							<p>空空如也</p>
							<p className={css.e_p2}>快去书城逛逛吧~</p>
						</div>
                    }
				</div>
				<div style={showIcon?{}:{display:'none'}} onClick={this.handleDelete.bind(this)} className={css.bottom}>
                    <div>
                        <img className={css.delete}  src={`${OSS_PRE}/images/common/icon_delete.png`}/>
                    </div>
                    <div>
                        <p>删除({iconArr.length})</p>
                    </div>
				</div>

			</div>
		);
	}
    jumpUrl(url){
        if(url==''){
            return false;
        }else{
            browserHistory.push(url)
        }
    }
}

export default BookShelf;