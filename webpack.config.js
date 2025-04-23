const HtmlWebpackPlugin     = require('html-webpack-plugin')
const MiniCssExtractPlugin  = require('mini-css-extract-plugin')
const BundleAnalyzerPlugin  = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CopyWebpackPlugin     = require('copy-webpack-plugin')
const TerserWebpackPlugin   = require('terser-webpack-plugin')
const webpack               = require('webpack')
const path                  = require('path')
require('dotenv').config()

const envKeys = Object.keys(process.env)
    .filter(key => key.startsWith('APP_'))
    .reduce((acc, atual) => {
        acc[`process.env.${atual}`] = JSON.stringify(process.env[atual])
        return acc
    }
, {})

module.exports = {
    mode: process.env.APP_NODE_ENV || 'development',
    optimization: {
        minimize: true,
        minimizer: [new TerserWebpackPlugin()]
    },
    entry: {
        bundle: path.resolve(__dirname, 'src/script.js'),
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename:'[name][contenthash].js',
        clean: true,
        assetModuleFilename:'[name][ext]'
    },
    devtool: 'source-map',
    module: {
        rules:[
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.js$/,
                exclude:/node_modules/,
                use: {
                    loader: 'babel-loader',
                    options:{
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.( png|jpe?g|gif|svg)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.(mp3|ogg|wav)$/i,
                type:'asset/resource'
            }
        ],
       
    },
    plugins:[
            new HtmlWebpackPlugin({
                title: 'Tesouros Históricos',
                filename: 'index.html',
                template: path.resolve(__dirname, 'src/index.html'),
                chunks: ['bundle'],
                inject: 'body',
                scriptLoading: 'defer'
            }),
            new MiniCssExtractPlugin({
                filename: 'game3.css'
            }),
            new CopyWebpackPlugin({
                patterns:[
                    {from: path.resolve(__dirname, 'src/Assets'), to: './Assets'}
                ]
            }),
            new webpack.DefinePlugin(envKeys),
            new BundleAnalyzerPlugin()
        ]
}