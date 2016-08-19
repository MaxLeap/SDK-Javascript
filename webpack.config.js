'use strict';

var path = require('path');
var webpack = require('webpack');


const PATHS = {
    app: path.join(__dirname, './lib'),
    build: path.join(__dirname, './dist')
};

let devtool = 'source-map';

if(process.env.NODE_ENV === 'production'){
    devtool = '';
}

let getEntry =()=>{
    let modules = ['Timeline'];
    let entry = {};
    modules.forEach((key)=>{
        entry[key] = ['babel-polyfill', `${PATHS.app}/${key}.js`];
    });
    return entry;
};

module.exports = {
    devtool: devtool,
    entry: getEntry(),
    output: {
        path: PATHS.build,
        filename: `[name].js`,
        libraryTarget: 'var',
        library: ['ML',`[name]`]
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