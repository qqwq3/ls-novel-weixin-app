var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var extractTextPlugin = require('extract-text-webpack-plugin');


module.exports = {
	devtool: 'eval-source-map',
	entry: {
		bundle: path.resolve(__dirname,'src/main.js')
	},
	output: {
		path: __dirname+'/dist',
		publicPath: "/",
		filename: 'js/bundle.js'
	},
	resolve: {
		extensions: ['.js','.jsx','.json','.coffee']
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
					      plugins: [
					        ['import', { libraryName: 'antd-mobile', style: 'css' }],
					      ],
					      compact: true,
					    },
					}
				]
			},
			 /*css处理不进行分离
            { test: /\.css$/, use: ['style-loader', 'css-loader', "postcss-loader"] },
            css编译 单独分离出css文件*/
			{
				test:/\.css$/,
				use: extractTextPlugin.extract({
					fallback: 'style-loader',
					use: ["css-loader","postcss-loader"]
				})
			},
			/*图片处理*/
			{
				test: /\.(png|jpg|jpeg|gif|webp|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        'limit': 500,
                        outputPath: '/images/',
                    }
                }]
			},
			{
				test: /\.less$/,
                /*不分离编译的css文件*/
                use:[
                    'style-loader',
                    { loader: 'css-loader', options: {modules: true} },
                    'less-loader'
                ]
                /*use: ['style-loader', 'css-loader', "postcss-loader", 'less-loader']
                分离css文件*/
                 /*use: extractTextPlugin.extract({
                     fallback: "style-loader",
                     use: [
                        {loader:'css-loader',options:{sourceMap:true,modules:true,localIdentName:'[local]_[hash:base64:5]'}},{loader:"postcss-loader"}, {loader:'less-loader'}]
                 })*/
			},
			{
				test: /\.scss$/,
                // 编译scss 不分离文件
                //use: ['style-loader', 'css-loader', "postcss-loader", 'sass-loader']
                // 分离css文件
                 use:extractTextPlugin.extract({
                     fallback:'style-loader',
                     use:['css-loader',"postcss-loader",'sass-loader']
                 })
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'webpack-three-react',
			template: 'src/index.html'
		}),
		// 将css抽离成单个文件
		new extractTextPlugin('css/[name].css'),
	],
	devServer: {
		historyApiFallback: true,
		contentBase: './',
		//设置基本目录结构
        //服务器的IP地址，
        host: '0.0.0.0',
        //服务端压缩是否开启
        compress: true,
        //配置服务端口号
        port: 80,
        // 实时刷新
        inline: true,
        //设置启动项目
        open: 'http://127.0.0.1',
		disableHostCheck: true,
	}
};