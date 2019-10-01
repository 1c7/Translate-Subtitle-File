const path = require('path');

module.exports = {
    mode: "development", // "production" | "development" | "none"
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js'
    },
    // resolve: {
    //     modules: ['node_modules'],
    //     descriptionFiles: ['package.json'],
    //     extensions: ['.js', '.json', '.html']
    // },
    // resolve: {
    //     modules: [path.resolve(__dirname, 'src'), 'node_modules']
    // },
    // module: {
    //     rules: [
    //         {
    //             test: /\.js$/,
    //             exclude: /node_modules/,
    //             use: {
    //                 loader: 'babel-loader'
    //             }
    //         }
    //     ]
    // },
    // module: {
    //     rules: [{
    //         test: /\.scss$/,
    //         use: [
    //             "style-loader", // 将 JS 字符串生成为 style 节点
    //             "css-loader", // 将 CSS 转化成 CommonJS 模块
    //             "sass-loader" // 将 Sass 编译成 CSS，默认使用 Node Sass
    //         ]
    //     }]
    // }
};