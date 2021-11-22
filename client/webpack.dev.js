require('dotenv').config(); 
const { merge } = require('webpack-merge'); 
const { EnvironmentPlugin } = require('webpack'); 
const { commonConfig } = require('./webpack.common.js');

const devConfig = {
    mode: 'development',
    devtool: 'inline-source-map',
    plugin: [
        new EnvironmentPlugin({...process.env.development}),
        new Dotenv({
            path: './.env.development',
            safe: true,
            allowEmptyValues: true,
            systemvars: true,
            silent: true,
            defaults: false
        })
    ]
}

module.exports = merge(commonConfig, devConfig);