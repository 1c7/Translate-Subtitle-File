# 开发者必读
（备注：我知道下面中英文混搭比较奇怪，往读者多多包涵）   

## 贡献代码
如果改动较小，就几行代码，请随意提 PR。   
如果是大功能，几个或十几个文件，代码几百行，还请先开 issue 讨论这个功能是否必要，   
不要静悄悄的自己干活，然后突然提一个很大的 PR，我 merge 也不是，不 merge 也不是，非常为难。   

## 代码解释
`app/src/` 目录是核心代码，文件不多，解释如下：   

  * `ass.js` 处理 ass 字幕
  * `srt.js` 处理 srt 字幕
  * `config.js`  配置文件
  * `common.js`  常用函数
  * `translate_api.js` 翻译 API
  * `index.js` 页面会载入的 js，监听点击事件等

## 技术栈
* Node 12.11.0
* Electron 6.0.10
* jQuery 3.4.1
* Vue 2.6.10

## 本地开发
```
cd app/
yarn install
yarn start
```

## 打包指南 (How to compile new release)
### macOS      
```bash
  npm run dist
```
run this under macOS
output file in `dist/`        

### Windows
```bash
  electron-packager .
```
run this under Windows
because somehow `electron-builder` not working on Windows, so we use `electron-packager`

Note: in `package.json`, some config are for `electron-builder`


## 翻译服务提供商:谷歌 (Translate Service Provider: Google)
Only 3 Translate API: Google/Microsort/Yandex  

## Google doesn't have free quote:
FAQ: https://cloud.google.com/translate/faq?hl=en#pricing
> Is there any free quota?         
> No, the Google Cloud Translation API is only available as a paid service. Please see Pricing for more details.

## 试过 (Tried)
tried `google-translate-api` on Github, it's a node.js module or something, not working.      

## 第三方库 (Third Party Lib)
* eush77/ass-parser    https://github.com/eush77/ass-parser
* eush77/ass-stringify https://github.com/eush77/ass-stringify

### 测试 (Testing)
`test file/` folder have file to test.         
because translation is not the same every time, it can only test by hand         

### 做事哲学
因为这个软件是一个免费小工具，所以一切从简。    
不用什么 Vue 全家桶或者 React+Redux/Angular/Ember 等工具。只有当这个软件进化到需要这些工具的时候才用   
目前仅浅浅的用了 jQuery 和 Vue。    



## 代码里有太多的 type == srt, type == ass，太烦了，看看怎么去掉
转成一个统一的界面，然后代码只需要管翻译，具体什么类型不用在乎





