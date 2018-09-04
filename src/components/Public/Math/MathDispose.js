/**
 * 阿拉伯数字上万后转换 - 简单处理
 * @number
 * @returns {number}
 **/
export function numberConversion(num?: string | number): string | number{
    let res: number = 0;
    let n: string = String(num);

    n = n.replace(/\s+/g, "");

    let m = Number(n);
    //let _m = accounting.toFixed(Number(n) / Math.pow(10, n.length - 1), 1);
    let _m = (Number(n) / Math.pow(10, n.length - 1)).toFixed(0);

    if(n.length === 4){
        res = _m + '千';
    }
    else if(n.length === 5){
        res = _m + '万';
    }
    else if(n.length === 6){
        res = _m + '0万';
    }
    else if(n.length === 7){
        res = _m + '00万';
    }
    else if(n.length === 8){
        res = _m + '000万';
    }
    else if(n.length === 9){
        res = _m + '亿';
    }
    else{
        res = m;
    }

    return res;
}