
import cfg from '../../config/app';
// 获取书的图片
export const loadImage = (books_id: string, prefix: string ='cover', postfix: string = '140px', random: boolean = false) => {
    let _url = cfg.imgUrl;

    let PhotoArithmetic = function(input, prefix, postfix, random){
        let id = parseInt(input);

        if (!isNaN(id) && id > 0) {
            let idstr = id.toString();
            // 补位
            let strs = [];
            for (let i = 0; i < 9 - idstr.length; i ++) {
                strs.push('0');
            }

            strs.push(idstr);
            strs = strs.join('');

            let pathes = strs.substring(0, 3) + '/' + strs.substring(3, 6) + '/' + strs.substring(6);
            let url = _url + prefix + '/' + pathes + '.jpg';

            if (postfix) {
                url += '!' + postfix;
            }

            if(random === true){
                url += '?r='+ Math.random();
            }

            return url;
        }
    };

    let id;
    let imageArr = [];

    if(books_id && typeof books_id === 'string'){
        id = books_id.split(",");

        id.map((_id) => {
            let img = PhotoArithmetic(_id, prefix, postfix, random);
            imageArr.push(img);
        });

        return imageArr;
    }

    if(books_id && typeof books_id === 'number'){
        id = books_id;
        let img = PhotoArithmetic(id, prefix, postfix, random);

        return img;
    }
};