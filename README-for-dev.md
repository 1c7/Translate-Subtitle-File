# Readme for developer who trying to improve this
字幕组机翻小助手 (支持.srt/.ass) - 基于谷歌翻译

## Tech Stack
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


## Third Party Lib

### Tried
tried google-translate-api,
not working.

解析 ASS 用： eush77/ass-parser    https://github.com/eush77/ass-parser
保存 ASS 用： eush77/ass-stringify https://github.com/eush77/ass-stringify
npm install ass-stringify --save
npm install ass-parser --save