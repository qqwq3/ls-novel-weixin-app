import {Button, Icon, ListView, Toast} from "antd-mobile";
import React from "react";
import {HttpClient} from "../../utils/HttpUtils";
import {loadImage} from "../../utils/loadImage";
import {Link} from "react-router";
import css from "./bookShelf.less";
import storejs from "storejs";
const dataSource = new ListView.DataSource({
	rowHasChanged: (row1, row2) => row1 !== row2,
});
export default class Books extends React.Component {

	constructor(props) {
		document.oncontextmenu=function(e){
			e.preventDefault();
		};
		super(props);
		this.state = {
			dataSource,
			isLoading: true,
			height:0,
			page:1,
			limit:20,
			delStatus:false,
			delIDs: {},
			books:[]
		}
	}

	flushHeight= ()=>{
		let num = this.state.books.length;
		if (num && num>0){
			let height = Math.ceil(num/3) * 130;
			this.setState({height:height});
		}
	};

	/**
	 * 书架加入一本书籍
	 */
	static addBook(){
		//该状态为false 则需要从新加载数据, 为true则读取旧数据
		storejs.set('bookshelf_status',false);
	}

	getData(){
		if (!this.state.delStatus){
			HttpClient.get("/api/app/book/get-bookrack", {page:this.state.page, limit:this.state.limit}).then((res)=>{
				//提取api数据之前的数据
				let books = this.state.books;
				//提取api返回的新数据
				let new_books = res.data.data.records;
				//只有加载到数据了并且是登录状态才去更新页码和本地数据
				if (new_books.length > 0 && storejs.get('userInfo')){
					this.setState({books:[...books,...new_books],dataSource:dataSource}, ()=>{
						let next_page = this.state.page+1;
						this.setState({page:next_page,dataSource: this.state.dataSource.cloneWithRows(this.state.books), isLoading: false},()=>{
							this.flushHeight();
							storejs.set('bookshelf_books', this.state.books);
							storejs.set('bookshelf_page_num', next_page);
							storejs.set('bookshelf_status', true);
						});
					});
				}else{
					console.log('没有更多数据了');
				}
			});
		}
	}

	componentDidMount() {
		//如果本地存在书籍列表和页码数 则直接取出渲染
		let books = storejs.get('bookshelf_books');
		let page = storejs.get('bookshelf_page_num');
		let status = storejs.get('bookshelf_status');
		if(books && page && status){
			this.setState({books:books,page:page,dataSource: this.state.dataSource.cloneWithRows(books), isLoading: false},()=>{
				this.flushHeight();
			});

		}else {
			storejs.remove("bookshelf_books");
			storejs.remove("bookshelf_page_num");
			storejs.remove('bookshelf_status');
			this.setState({page:1});
			this.getData();
		}
	}

	onEndReached = (event) => {
		if (this.state.delStatus){
			return;
		}
		if (this.state.isLoading && !this.state.hasMore) {
			return;
		}
		this.setState({ isLoading: true }, ()=>{this.getData();});
	};


	/**
	 * 添加要删除书籍的ID
	 * @param rowID
	 */
	addDelID = (rowID)=>{
		let delIDs = this.state.delIDs;
		if (delIDs[`rowid${rowID}`]){
			delIDs[`rowid${rowID}`] = false
		}else{
			delIDs[`rowid${rowID}`] = true;
		}
		//delete delIDs[`rowid${rowID}`];
		this.setState({delIDs:delIDs});
	};
	/**
	 * 执行删除
	 */
	deleteBooks = ()=>{
		//promotion','bookcase' 前者表示推荐,后者表示收藏书籍
		let param = '';
		let param_type='';
		for (let p in this.state.delIDs){
			let book = this.state.books[parseInt(p.replace('rowid', ''))];
			if (book['book_type'] == 'promotion'){
				param+=`,${book['book_id_hex']}`;
				param_type+=`,promotion`;
			}
			if (book['book_type'] == 'bookcase') {
				param+=`,${book['book_id_hex']}`;
				param_type+=`,bookcase`;
			}
		}
		/**
		 * 删除成功:
		 * 		更新数据:books DataSource store
		 * 		清理数据:delIds delStatus
		 */
		let delCallBack = ()=>{
			this.setState({
				delStatus:false,
				delIDs:{},
				page:1,
				books:[],
				dataSource:dataSource},()=>{
				storejs.remove("bookshelf_books");
				storejs.remove("bookshelf_page_num");
				storejs.remove('bookshelf_status');
				this.getData();
			});
		};

		HttpClient.post('/api/app/book/bookcase/batch_delete', {book_ids: param.substr(1), book_type:param_type.substr(1)}).then((res)=>{
			console.log(res);
			if (res.data.code==0){
				Toast.success('删除成功',1);
				delCallBack();
			}else{
				Toast.fail(res.data.message, 1);
			}
		});
	};

	/**
	 * 取消删除操作
	 */
	cancelDeleteBooks = ()=>{
		this.setState({delIDs:{},delStatus:false});
	};


	render() {
		const separator = (sectionID, rowID) => (
			<div key={`${sectionID}-${rowID}`} />
		);
		let data = this.state.books;
		console.log(data);
		let index = data.length - 1;
		const row = (rowData, sectionID, rowID) => {
			if (index < 0) {
				index = data.length - 1;
			}
			const obj = data[index--];

			return (
				/**
				 * 改变删除状态下默认的点击执行方式
				 */
				<Link onClick={(e)=>{
					if (this.state.delStatus){
						e.preventDefault();
						this.addDelID(rowID);
					}
				}}
					  to={`/book-page?id=book_id${data[rowID].book_id_hex}`} >

					<div className={css.book} key={rowID}
						 onTouchStart={()=>{
							 this.begin = setInterval(()=>{
								 this.setState({delStatus:true});
								 this.addDelID(rowID);
								 clearInterval(this.begin);
							 }, 600)
						 }}
						 onTouchMove={()=>{
							 clearInterval(this.begin);
						 }}
						 onTouchEnd={()=>{
							 clearInterval(this.begin);
						 }}
					>
						<div className={css.del} style={{position:'absolute', marginLeft:'20%'}}><Icon color='green' style={this.state.delIDs[`rowid${rowID}`]?{backgroundColor:'gray', borderRadius:'50%'}:{display:'none'}} type="check-circle-o" size='sm' /></div>
						<div className={css.img} style={{backgroundImage: `url(${loadImage(data[rowID].book_id)})`}}/>
						<div className={css.span}><span>{data[rowID].book_title}</span></div>
					</div>
				</Link>
			);
		};
		return (
			<div style={{height:this.state.height}}>
				<ListView
					ref={el => this.lv = el}
					dataSource={this.state.dataSource}
					renderFooter={() => (<div style={{ padding: 30, textAlign: 'center' }}>
					</div>)}
					renderRow={row}
					renderSeparator={separator}
					className="am-list"
					pageSize={4}
					useBodyScroll
					scrollRenderAheadDistance={500}
					onEndReached={this.onEndReached}
					onEndReachedThreshold={10}
					initialListSize={this.state.books.length}
				/>
				<Button className={css.delBtn} onClick={this.deleteBooks} size='small' type="warning" style={this.state.delStatus?{position:'fixed'}:{display:'none'}}>删除</Button>
				<Button className={css.cancelDelBtn} onClick={this.cancelDeleteBooks}  size='small' type="warning" style={this.state.delStatus?{position:'fixed'}:{display:'none'}}>取消</Button>
			</div>

		);
	}
}