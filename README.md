# 字幕组机翻小助手 (支持.srt/.ass) - 基于谷歌翻译
一句话显示有什么用
[一张 gif 图显示怎么用]

## 如何使用

## 下载地址

## 问题反馈 | 联系方式
新浪微博@糖醋陈皮
邮箱: guokrfans@gmail.com

## 技术
使用 Electron.js 编写(v1.7.9)

## 翻译服务提供商：Google
目前市面上只有三家：Google/Microsort/Yandex

## Google doesn't have free quote:
FAQ: https://cloud.google.com/translate/faq?hl=en#pricing
> Is there any free quota?         
> No, the Google Cloud Translation API is only available as a paid service. Please see Pricing for more details.

### TODO
1. 拖放
2. ASS 支持

解析 ASS 用： eush77/ass-parser   https://github.com/eush77/ass-parser
保存 ASS 文件用： eush77/ass-stringify  同一个人，https://github.com/eush77/ass-stringify

试一下能不能转过来，改一行，然后转回去。
npm install ass-stringify --save
npm install ass-parser --save

3. 只支持特定类型。[x]
4. 文件名截断的问题还没搞好。

5. 提供相关信息，如 Github 地址，修改好名字，左上角不是 you-app。

6. 打包成 dmg。发给别人试试，然后再 exe。

### Improve(改进)

3. 等100%翻译结束了，UI 变化提示。

4. 提供换行选项：\N 还是两行。点击就保存。

5. 可以界面内直接打开文件地址。而不是自己去找。

6. 做"设置"。提供默认选项。没有设计选项。 选项1，选语言（可能默认是英翻中）  选项2，提供换行选择的方式，有的字幕君喜欢 \N 换行，有的就喜欢2行分开。  选项3，保存新文件/替换原文件
