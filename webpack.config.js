'use strict';

var path = require('path');
var webpack = require('webpack');


const PATHS = {
    app: path.join(__dirname, './lib'),
    build: path.join(__dirname, './dist')
};

let devtool = 'source-map';
let min = '';

if(process.env.NODE_ENV === 'production'){
    //发布产品时不使用devtool
    devtool = '';
    //发布产品时文件名带.min后缀
    min = '.min';
}

let getEntry =()=>{
    let modules = ['MLTimeline'];
    let entry = {};
    modules.forEach((key)=>{
        entry[key] = [`${PATHS.app}/${key}.js`];
    });
    return entry;
};

module.exports = {
    devtool: devtool,
    entry: getEntry(),
    output: {
        path: PATHS.build,
        filename: `[name]${min}.js`,
        libraryTarget: 'var',
        library: ['ML',`Timeline`]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production") //webpack的环境变量需要插件传入, 否则压缩代码后会warning
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.NoErrorsPlugin()
    ],
    module: {
        loaders: [
            {
                test: /\.js[x]?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    plugins: ['add-module-exports'],
                    presets: ['es2015', 'stage-0']
                }
            }
        ]
    }
};