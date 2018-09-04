import React, {Component} from 'react';
import axios from 'axios';
import css from './search.less';
import cfg from '../../../config/app';
axios.defaults.baseURL = cfg.urls;
import { loadImage } from '../../utils/loadImage';
import { Icon,Toast,Modal } from 'antd-mobile';
import { browserHistory } from 'react-router';
import {HttpClient} from "../../utils/HttpUtils";
import stores from 'storejs';
import {OSS_PRE} from '../../constant/ActionTypes';
function trim(s){
    return s.replace(/(^\s*)|(\s*$)/g, "");
}
const modalAlert = Modal.alert;
class SearchPublic extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            bookList:[],
            input_value:'',
            record:[],
            searchCancel:true,
        }
    }

    handleSearch = (event) =>{
        if(event.keyCode == '13'){
            this.setState({
                searchCancel:false,
            },()=>{
                if(trim(this.state.input_value)){
                    this.getData();
                }else{
                    Toast.info('搜索不能为空！');
                }
            });
            document.activeElement.blur();
        }
    };

    getData = () =>{
        let history = stores.get('historyRecords');
        if(history && history!=='undefined' && history.length<6 && history.length>=0){
            history.push(this.state.input_value);
            history = Array.from(new Set(history));
            stores.set('historyRecords',history);
        }else if(history && history!=='undefined'&& history.length>=6){
            history.push(this.state.input_value);
            const his_len1 = history.length;
            history = Array.from(new Set(history));
            const his_len2 = history.length;
            if(his_len1 === his_len2){
                history.splice(0,1);
            }else{
                const index = history.indexOf(this.state.input_value);
                const str = history.splice(index,1);
                history.push(str[0]);
            }
            stores.set('historyRecords',history);
        }else if(!history || history==='undefined'){
            history = [];
            history.push(this.state.input_value);
            stores.set('historyRecords',history);
        }else{
            console.log('history44',history)
        }
        HttpClient.get(`/api/app/book/query?book_name=${this.state.input_value}`).then(res=>{
            console.log(res.data)
            if(res.data.code==0){
                this.setState({
                    bookList:res.data.data.records
                })
            }
        })
    };

    handleSearchButton = (event) =>{
        this.setState({
            searchCancel:false,
        },()=>{
            if(trim(this.state.input_value)){
                this.getData();
            }else{
                Toast.info('搜索不能为空！');
            }
        });
        document.activeElement.blur();
    };

    jumpToDetail = (id) =>{
        this.props.router.push({pathname:'/book-detail',state:{hex_id:id}});
    }

    onInputChange = (e) =>{
        console.log(e.target.value)
        this.setState({
            input_value:e.target.value,
            searchCancel:true,
        })
    };

    handleHistoryRecord = (str) =>{
        this.setState({
            input_value:str,
            searchCancel:false,
        },()=>{
            this.getData();
        })
    };
    handleDelete = () =>{
        stores.set('historyRecords');
        console.log(stores.get('historyRecords'))
        this.setState({
            record:[]
        })
    };
    goBack = () =>{
        browserHistory.goBack();
    };
    clickCancel(){
        browserHistory.goBack();
    }
    componentWillMount(){
        const record = stores.get('historyRecords');
        this.setState({
            record:record
        })
    }


    render () {
        const {bookList,input_value,record} = this.state;

        return <div>
            <div className={css.s_header}>
                <Icon onClick={this.goBack.bind(this)} className={css.ic_1} type='left' />
                <div className={css.s_search_content}>
                    <Icon onClick={this.handleSearchButton.bind(this)} className={css.ic_2} type='search' />
                    <div className={css.line_y}/>
                    <form action='javascript:return true' className={css.s_input}>
                        <input
                            onKeyDown={this.handleSearch.bind(this)}
                            onChange={this.onInputChange.bind(this)}
                            type="text"
                            className={css.s_input1}
                            value={trim(input_value)?input_value:''}
                            autoFocus='autoFocus'
                        />
                    </form>
                </div>
                {
                    this.state.searchCancel?
                        <p onClick={this.handleSearchButton.bind(this)} className={css.cancle}>搜索</p>:
                        <p onClick={this.clickCancel.bind(this)} className={css.cancle}>取消</p>
                }
            </div>
            {bookList.length>0?''
                :<div className={css.history}>
                    <div className={css.h_head}>
                        <p>历史搜索</p>
                        <img
                            src={`${OSS_PRE}/images/default/icon_trash.png`}
                            style={{width:'15px',height:'15px'}}
                            onClick={() =>
                                modalAlert('温馨提示', '确认要清空上次搜索记录吗？', [
                                    { text: '取消', onPress: () => console.log('cancel'),style:{color:'#888'}},
                                    { text: '确认', onPress: () => this.handleDelete(),style:{color:'#f3916b'} },
                                ])
                            }
                        />
                    </div>
                    <div className={css.record_list}>
                        {console.log(record)}
                        {record&&record!== 'undefined' &&record.length>0?record.reverse().map((item,index)=>{
                            return <p key={index} onClick={this.handleHistoryRecord.bind(this,item)} className={css.record}>{item}</p>
                        }):''}
                    </div>
                </div>}
            {bookList?bookList.map((item,index)=>{
                return <div key={index} onClick={this.jumpToDetail.bind(this,item.hex_id)} className={css.s_content}>
                    <div className={css.content_single}>
                        <div className={css.c_left}>
                            <img className={css.s_img} src={loadImage(item.id)} />
                        </div>
                        <div className={css.c_right}>
                            <p className={css.c_title}>{item.title}</p>
                            <p className={css.new_chapter}>{item.latest_chapter?item.latest_chapter.title:''}</p>
                            <p className={css.auth}>{item.author?item.author.name:''}<span>{item.total_hits}人在阅读</span></p>
                        </div>
                    </div>
                    <div className={css.lines} />
                </div>
            }):''}

        </div>
    }


}

export default SearchPublic;