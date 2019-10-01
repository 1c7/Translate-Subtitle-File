## 版本变化
此处详细记录了每一个版本的变化

## 版本 0.0.3
状态：尚未开始   
* 增加配置功能
* 配置功能可填入 Google, Baidu, Sogou 的 API key 和 secret
* 增加检查网络是否通畅功能（能不能用谷歌翻译），以及速度多快 x ms

## 版本 0.0.2
状态：制作中
* 支持批量翻译
* 支持 vtt 格式

#### 特别感谢
* [PR: 无需翻墙，支持多文件，支持多种语言切换 - by eyasliu](https://github.com/1c7/Translate-Subtitle-File/pull/5)
* [PR: 提供搜狗API，每句话翻译选项，修复 bug - by SFmonkey](https://github.com/1c7/Translate-Subtitle-File/pull/7)

#### 其他改进
* Electron 从 4 升级到 6

## 版本 0.0.1
状态：已发布，发布时间 2018年5月8号    
第一版是最简单的版本，简单到没法再简单了

* 只能英文翻译成中文，不能选择源语言和目标语言
* 只支持一个文件一个文件的翻译 (不支持一次拖入多个文件批量翻译)
* 只有谷歌翻译（无其他翻译提供商）

#### Bug:
* [连续翻译多个文件时，后面翻译的字幕会叠加前面翻译的字幕](https://github.com/1c7/Translate-Subtitle-File/issues/10)

#### 用户建议:
* [批量翻译功能](https://github.com/1c7/Translate-Subtitle-File/issues/6)
* [支持 vtt 格式](https://github.com/1c7/Translate-Subtitle-File/issues/11)