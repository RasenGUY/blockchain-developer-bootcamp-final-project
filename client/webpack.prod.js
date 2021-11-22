require('dotenv').config(); 
const { merge } = require('webpack-merge'); 
const { EnvironmentPlugin } = require('webpack'); 
const { commonConfig } = require('./webpack.common.js');

const prodConfig = {
    mode: 'development',
    devtool: 'source-map',
    plugin: [
        new EnvironmentPlugin({...process.env}), 
        new Dotenv({
            path: './.env',
            safe: true,
            allowEmptyValues: true,
            systemvars: true,
            silent: true,
            defaults: false
        }),
    ]
}
module.exports = merge(commonConfig, prodConfig);