import React, {Component} from 'react';
import axios from 'axios';
import css from './search.less';
import { Icon, Grid } from 'antd-mobile';
import { Link} from 'react-router';

class Search extends React.Component{
    constructor(props) {
        super(props);
        console.log(this.props.title);
        this.state = {
            src:this.props.title,
        }
    }

    render() {
        return <div>
            <div className={css.content}>
                <div className={css.imgs}>
                    <div style={{width:'25px'}}></div>
                    <img className={css.title} src={this.state.src}/>
                    <Link to='/search-public'><Icon className={css.iconRight} type="search" /></Link>
                </div>
            </div>
        </div>
    }

}

export default Search;