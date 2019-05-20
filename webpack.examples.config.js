var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        example: path.join(__dirname, 'src', 'examples', 'example.tsx'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {test: /\.ts$|\.tsx$/, use: ['ts-loader']},
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader']},
            {
                test: /\.(jpe?g|gif|png|svg)$/,
                use: [{loader: 'url-loader'}],
            },
            {test: /\.obj$/, use: ['raw-loader']},
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            title: 'Graph 3D',
            chunks: ['example'],
            template: path.join(__dirname, 'index.html'),
        }),
    ],
    output: {
        path: path.join(__dirname, 'dist', 'examples'),
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js',
        publicPath: '',
    },
    devtool: 'source-map',
    devServer: {
        contentBase: './dist',
        proxy: {
            '/convertToImage': {
                target: 'http://localhost:5001',
                changeOrigin: true,
                secure: false,
            }
        },
    }
};
