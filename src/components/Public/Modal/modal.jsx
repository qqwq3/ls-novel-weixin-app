import React, {Component} from 'react';
import css from './modal.less';

window.onload = function(){
    document.onclick = function(e){
        e = e || window.event;
        var dom =  e.srcElement|| e.target;
        if(dom.id == "boxweixin" && document.getElementById("boxweixin").style.display == "block") {
            document.getElementById("boxweixin").style.display = "none";
            e.stopPropagation();
        }
    };
    console.log(222)
};

class Modal extends React.Component{

    constructor(props) {
        super(props);
        console.log(this.props)
        this.state = {
            visiable:this.props.visible
        }
    }

    componentWillReceiveProps(nextProps) {
        const visiable = nextProps.visiable;
        console.log(11,visiable)
        this.setState({
            visiable:visiable
        })

    }

    render() {
        return <div>
            {console.log(33,this.state.visiable)}
            <div id="boxweixin" style={this.state.visiable?{display:'block'}:{display:'none'}} className={css.modal_all}>
                {this.props.children}
            </div>
        </div>
    }

}

export default Modal;