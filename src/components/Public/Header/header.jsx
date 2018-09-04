import React, {Component} from 'react';
import axios from 'axios';
import css from './header.less';
import { Icon, Grid } from 'antd-mobile';
import {browserHistory} from "react-router";
import {OSS_PRE} from '../../../constant/ActionTypes';
class Header extends React.Component{
    constructor(props) {
        super(props);
        console.log(this.props.title);
        this.state = {
            title:this.props.title,
        }
    }

    componentWillReceiveProps(nextProps) {
        const title = nextProps.title.toString();
        /*console.log(title)*/
        this.setState({
            title:title
        })

    }

    goBack = () =>{
        console.log(222,this.props)
        browserHistory.goBack();
    }

    render() {
        return <div className={css.headers}>
            <div className={css.header}>
                <Icon className={css.iconLeft} onClick={this.goBack.bind(this)} color={'#808080'} type="left"/>
                <div className={css.title}>{this.state.title}</div>
                {/*<div className={css.iconRight}></div>*/}
                <img src={`${OSS_PRE}/images/personalcenter/app_icon.png`} onClick={this.jumpBookCity.bind(this)}/>
            </div>
            <div className={css.line}></div>
        </div>
    }
    jumpBookCity(){
        browserHistory.push('/index/book-city');
    }
}

export default Header;