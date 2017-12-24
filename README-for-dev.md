# 字幕组机翻小助手 (支持.srt/.ass) - 基于谷歌翻译
Electron v1.7.9

## How to run
```
cd [into project dir]
electron .
```

## Translate Service Provider: Google
Translate API there are only Google/Microsort/Yandex

## Google doesn't have free quote:
FAQ: https://cloud.google.com/translate/faq?hl=en#pricing
> Is there any free quota?         
> No, the Google Cloud Translation API is only available as a paid service. Please see Pricing for more details.

### TODO
接下来处理翻译
1. 发请求尽量高效，一次性发大块一点的数据。
换行在 URL 里是 %0A
返回的结果会用数组存不同行。很方便。

2. 拿到结果了，保持结构。和原文的对象放一起。

3. 等100%翻译结束了，UI 变化提示。

4. 提供换行选项：\N 还是两行。点击就保存。

5. 可以界面内直接打开文件地址。而不是自己去找。

4. 拖放还没做。

5. ASS 的支持还没做。

6. 做"设置"。提供默认选项。没有设计选项。 选项1，选语言（可能默认是英翻中）  选项2，提供换行选择的方式，有的字幕君喜欢 \N 换行，有的就喜欢2行分开。  选项3，保存新文件/替换原文件


### Tried
tried google-translate-api,
not working.