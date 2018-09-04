import React, {Component} from 'react';
import {NavBar,Icon,Toast,PullToRefresh,ListView} from 'antd-mobile';
import LazyLoad from 'react-lazyload';
import css from './secondCate.less';
import {HttpClient} from '../../utils/HttpUtils';
import { loadImage } from '../../utils/loadImage';
import {setTitle} from "../../utils/ViewTitleUtils";
import {OSS_PRE} from '../../constant/ActionTypes';
import {browserHistory} from "react-router";
class SecondCate extends React.Component {
    constructor(props) {
        super(props);
        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 === row2,
        });
        this.state = {
            hex_id:this.props.location.state.hex_id,
            hex_name:this.props.location.state.hex_name,
            content:[],
            PAGE_CONTROL:12,
            currentOffset:1,
            height: document.documentElement.clientHeight,
            dataSource,
            loading:false,
            refreshing: true,
        }
    }
    componentWillMount() {
        setTitle('小说天堂');
        HttpClient.http('get',`/api/app/book/query?category_id=${this.state.hex_id}&limit=${this.state.PAGE_CONTROL}&offset=${this.state.currentOffset}`).then(res => {
            console.log(res)
            this.setState({
                content: res.data.data.records,
            },()=>{
                const {content} = this.state;
                this.setState({
                    dataSource:this.state.dataSource.cloneWithRows(content),
                })
            });
        })
    }

    componentWillUnmount(){
        this.setState = () => { return; };
    }
    loadingToast=()=>{
        Toast.loading('加载中',11111);
    }
    onEndReached = (event) => {
        this.setState({
            currentOffset:this.state.currentOffset+=1,
        },function(){
            HttpClient.http('get',`/api/app/book/query?category_id=${this.state.hex_id}&limit=12&page=${this.state.currentOffset}`).then(res => {
                console.log('1',res.data.data.records);
                if(res.data.data.records){

                    this.setState({
                        content: [...this.state.content,...res.data.data.records],
                    },()=>{
                        const {content} = this.state;
                        this.setState({
                            dataSource:this.state.dataSource.cloneWithRows(content),
                        })
                    })
                }
            });
        })
    };
    onRefresh = () => {
        this.setState({
            refreshing: true,
            isLoading: true,
        });
        setTimeout(() => {
            this.setState({
                refreshing: false,
                isLoading: false,
            });
        }, 600);
    };

        render() {
            const {content} = this.state;
            let index = 0;//data.length -1;
            const row = (rowData,sectionID,rowID) =>{

                if(index>0 && index<content.length){
                    if(index==content.length-1){
                        var obj = content[index];
                        index = index
                    }else{
                        obj = content[index];
                        index = index+1
                    }

                }else if(index==0){
                    obj = content[index];
                    index++
                }
                return(
                    <div key={rowID} className={css.bookDetail} onClick={this.handleClick.bind(this,obj.hex_id)}>
                        <LazyLoad
                            placeholder={
                                <div className={css.imgbox}>
                                    <img className={css.img} src={`${OSS_PRE}/images/default/book_defaut.png`}/>
                                </div>
                            }
                        >
                            <div className={css.imgbox}>
                                <img className={css.img} src={loadImage(obj.id)}/>
                            </div>
                        </LazyLoad>
                        <div className={css.bookDetailRight}>
                            <p className={css.title}>
                                <span style={{color:'black',fontSize:'16px'}} className={css.spanTitle}>{obj.title}</span>
                                <span style={{color:'#cccccc',fontSize:'12px',marginRight:'10px'}} className={css.spanTotalLikes}>{obj.total_likes}人在看</span>
                            </p>
                            <p className={css.new}>{(/<br\s*\/?>/gi.test(obj.description)  ? obj.description.replace(/<br\s*\/?>/gi,"\r\n") : obj.description) ? (/<br\s*\/?>/gi.test(obj.description)  ? obj.description.replace(/<br\s*\/?>/gi,"\r\n") : obj.description):"暂无描述" }</p>
                            <p style={{margin:'5px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                <span>{obj.author.name}</span>
                                {this.statusMany(obj.status.value)}
                            </p>
                        </div>
                    </div>

                )
            };
        return (
            <div>
                <NavBar
                    mode="light"
                    icon={<Icon type="left" />}
                    onLeftClick={() =>browserHistory.goBack()}
                    style={{color: 'black',position:'fixed',top:0,borderBottom:'1px solid #f1f1f1',width:'100%',backgroundColor:'#ffffff',zIndex:10}}
                >{this.state.hex_name}</NavBar>
                <div className={css.booklist}>
                    <ListView
                        ref={el => this.lv = el}
                        dataSource={this.state.dataSource}
                        renderRow={row}
                        className="am-list"
                        pageSize={70}
                        initialListSize={60}
                        useBodyScroll
                        scrollRenderAheadDistance={500}
                        onEndReached={this.onEndReached}
                        onEndReachedThreshold={800}
                        pullToRefresh={<PullToRefresh
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh}
                        />}
                    />
                </div>
                <div className={css.loadingDiv}>
                    <div className={css.leftDiv}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className={css.rightDiv}>
                        <p>正在玩命加载中····</p>
                    </div>
                </div>
            </div>
        )
    }


    statusMany(status){
        if(status===1){
            return(
                <span className={css.status}>连载中</span>
            )
        }else if(status===2){
            return(
                <span className={css.status}>已完结</span>
            )
        }
    }
    handleClick(id){
        this.props.router.push({pathname:'/book-detail',state:{hex_id:id}});
    }

}
export default SecondCate;