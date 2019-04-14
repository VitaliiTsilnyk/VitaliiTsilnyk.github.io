
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const autoprefixer = require("autoprefixer");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	entry: {
		app: [
            'jquery',
            'popper.js',
            'bootstrap',
            'turbolinks',
            //'bootstrap/dist/css/bootstrap.min.css',
            // '@fortawesome/fontawesome-free/css/fontawesome.min.css',
            // '@fortawesome/fontawesome-free/css/solid.min.css',
            // '@fortawesome/fontawesome-free/css/brands.min.css',

            './_assets/js/main.js',
            './_assets/css/main.scss',
		]
	},
	output: {
		path: path.resolve(__dirname, 'assets'),
		filename: '[name].bundle.js'
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendor",
					chunks: "all"
				}
			}
		}
	},
	performance: {
		hints: false
	},
    module: {
        rules: [
            // {
            //     test: /\.jsx$/,
            //     loader: 'babel-loader',
            //     exclude: [/[\\/]node_modules[\\/]/],
            //     query: {
            //         presets: [
            //             '@babel/preset-react',
            //             ['@babel/preset-env', {
            //                 'targets': {
            //                     'browsers': [
            //                         'last 4 Chrome versions',
            //                         'last 4 Firefox versions',
            //                         'last 4 Edge versions',
            //                         'Safari >= 7',
            //                         'Explorer >= 11',
            //                     ]
            //                 },
            //                 'useBuiltIns': 'usage'
            //             }],
            //         ],
            //         plugins: [
            //             '@babel/plugin-proposal-class-properties',
            //             '@babel/plugin-proposal-object-rest-spread',
            //             '@babel/plugin-transform-async-to-generator',
            //         ]
            //     }
            // },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader',
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    { loader: "url-loader", options: { limit: 8192 } }
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            },
        ]
    },
    plugins: [
        //new CleanWebpackPlugin(),
		new webpack.LoaderOptionsPlugin({
			options: {
				postcss: [
					autoprefixer()
				]
			}
		}),
        new MiniCssExtractPlugin({
            filename: "[name].bundle.css"
        }),
    ]
};
