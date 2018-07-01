var path = require('path');

module.exports = {
    mode: 'none',
    entry: {
        index: path.join(__dirname, 'src', 'index.ts'),
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
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'l3-graph.bundle.js',
        chunkFilename: 'l3-graph.chunk.js',
        publicPath: '/',
        library: 'l3-graph',
        libraryTarget: 'umd',
    },
    devtool: 'source-map',
};
