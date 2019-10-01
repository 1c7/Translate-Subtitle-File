const { translate, download } = require('./src/translate');
const common = require('./src/common')
const {google, baidu, sogou} = require('./src/translate_api.js');

// 文件状态
var FILE_STATE = {
  waiting: 0, // 等待翻译
  pending: 1, // 正在翻译
  success: 2, // 翻译完成
  error:   3, // 翻译失败
}

new Vue({
  el: '#vue-app',
  data: {
    editing: '', // 要么为空 ""，要么是正在编辑的文件 id
    // 支持什么语言
    supportLang: {
      // 谷歌
      google: {
        'auto': '自动识别',
        'zh-cn': '简体中文',
        'zh-tw': '繁体中文',
        'en': '英语',
        'af': 'Afrikaans',
        'sq': 'Albanian',
        'am': 'Amharic',
        'ar': 'Arabic',
        'hy': 'Armenian',
        'az': 'Azerbaijani',
        'eu': 'Basque',
        'be': 'Belarusian',
        'bn': 'Bengali',
        'bs': 'Bosnian',
        'bg': 'Bulgarian',
        'ca': 'Catalan',
        'ceb': 'Cebuano',
        'ny': 'Chichewa',
        'co': 'Corsican',
        'hr': 'Croatian',
        'cs': 'Czech',
        'da': 'Danish',
        'nl': 'Dutch',
        'eo': 'Esperanto',
        'et': 'Estonian',
        'tl': 'Filipino',
        'fi': 'Finnish',
        'fr': 'French',
        'fy': 'Frisian',
        'gl': 'Galician',
        'ka': 'Georgian',
        'de': 'German',
        'el': 'Greek',
        'gu': 'Gujarati',
        'ht': 'Haitian Creole',
        'ha': 'Hausa',
        'haw': 'Hawaiian',
        'iw': 'Hebrew',
        'hi': 'Hindi',
        'hmn': 'Hmong',
        'hu': 'Hungarian',
        'is': 'Icelandic',
        'ig': 'Igbo',
        'id': 'Indonesian',
        'ga': 'Irish',
        'it': 'Italian',
        'ja': 'Japanese',
        'jw': 'Javanese',
        'kn': 'Kannada',
        'kk': 'Kazakh',
        'km': 'Khmer',
        'ko': 'Korean',
        'ku': 'Kurdish (Kurmanji)',
        'ky': 'Kyrgyz',
        'lo': 'Lao',
        'la': 'Latin',
        'lv': 'Latvian',
        'lt': 'Lithuanian',
        'lb': 'Luxembourgish',
        'mk': 'Macedonian',
        'mg': 'Malagasy',
        'ms': 'Malay',
        'ml': 'Malayalam',
        'mt': 'Maltese',
        'mi': 'Maori',
        'mr': 'Marathi',
        'mn': 'Mongolian',
        'my': 'Myanmar (Burmese)',
        'ne': 'Nepali',
        'no': 'Norwegian',
        'ps': 'Pashto',
        'fa': 'Persian',
        'pl': 'Polish',
        'pt': 'Portuguese',
        'ma': 'Punjabi',
        'ro': 'Romanian',
        'ru': 'Russian',
        'sm': 'Samoan',
        'gd': 'Scots Gaelic',
        'sr': 'Serbian',
        'st': 'Sesotho',
        'sn': 'Shona',
        'sd': 'Sindhi',
        'si': 'Sinhala',
        'sk': 'Slovak',
        'sl': 'Slovenian',
        'so': 'Somali',
        'es': 'Spanish',
        'su': 'Sundanese',
        'sw': 'Swahili',
        'sv': 'Swedish',
        'tg': 'Tajik',
        'ta': 'Tamil',
        'te': 'Telugu',
        'th': 'Thai',
        'tr': 'Turkish',
        'uk': 'Ukrainian',
        'ur': 'Urdu',
        'uz': 'Uzbek',
        'vi': 'Vietnamese',
        'cy': 'Welsh',
        'xh': 'Xhosa',
        'yi': 'Yiddish',
        'yo': 'Yoruba',
        'zu': 'Zulu'
      },
      // 百度
      baidu: {
        zh:  '中文',
        en:  '英语',
        yue: '粤语',
        wyw: '文言文',
        jp:  '日语',
        kor: '韩语',
        fra: '法语',
        spa: '西班牙语',
        th:  '泰语',
        ara: '阿拉伯语',
        ru: '俄语',
        pt: '葡萄牙语',
        de: '德语',
        it: '意大利语',
        el: '希腊语',
        nl: '荷兰语',
        pl: '波兰语',
        bul:'保加利亚语',
        est:'爱沙尼亚语',
        dan:'丹麦语',
        fin:'芬兰语',
        cs: '捷克语',
        rom: '罗马尼亚语',
        slo: '斯洛文尼亚语',
        swe: '瑞典语',
        hu: '匈牙利语',
        cht: '繁体中文',
        vie: '越南语',
      },
      // 搜狗
      sogou: {
        'auto': '自动识别',
        'ar':'阿拉伯语',
        'et': '爱沙尼亚语',
        'bg': '保加利亚语',
        'pl': '波兰语',
        'ko': '韩语',
        'bs-Latn': '波斯尼亚语',
        'fa': '波斯语',
        'mww': '白苗文',
        'da': '丹麦语',
        'de': '德语',
        'ru': '俄语',
        'fr': '法语',
        'fi': '芬兰语',
        'tlh-Qaak': '克林贡语(piqaD)',
        'tlh': '克林贡语',
        'hr': '克罗地亚语',
        'otq': '克雷塔罗奥托米语',
        'ca': '加泰隆语',
        'cs': '捷克语',
        'ro': '罗马尼亚语',
        'lv': '拉脱维亚语',
        'ht': '海地克里奥尔语',
        'lt': '立陶宛语',
        'nl': '荷兰语',
        'ms': '马来语',
        'mt': '马耳他语',
        'pt': '葡萄牙语',
        'ja': '日语',
        'sl': '斯洛文尼亚语',
        'th': '泰语',
        'tr': '土耳其语',
        'sr-Latn': '塞尔维亚语(拉丁文)',
        'sr-Cyrl': '塞尔维亚语(西里尔文)',
        'sk': '斯洛伐克语',
        'sw': '斯瓦希里语',
        'af': '南非荷兰语',
        'no': '挪威语',
        'en': '英语',
        'es': '西班牙语',
        'uk': '乌克兰语',
        'ur': '乌尔都语',
        'el': '希腊语',
        'hu': '匈牙利语',
        'cy': '威尔士语',
        'yua': '尤卡坦玛雅语',
        'he': '希伯来语',
        'zh-CHS': '中文',
        'it': '意大利语',
        'hi': '印地语',
        'id': '印度尼西亚语',
        'zh-CHT': '中文繁体',
        'vi': '越南语',
        'sv': '瑞典语',
        'yue': '粤语(繁体)',
        'fj': '斐济',
        'fil': '菲律宾语',
        'sm': '萨摩亚语',
        'to': '汤加语',
        'ty': '塔希提语',
        'mg': '马尔加什语',
        'bn': '孟加拉语'
      }
    },
    // 支持哪些翻译 API
    supportApi: {
      google: '谷歌',
      baidu: '百度',
      // sogou: '搜狗', // 临时去掉搜狗，等下一版可以设置 API Key 和 Secret 了再开启（让用户用自己的 API key 和 Secret)
    },
    // 状态
    statusText: {
      0: ['waiting', '等待翻译'],
      1: ['pending', '正在翻译'],
      2: ['success', '翻译完成'],
      3: ['error', '翻译失败']
    },
    // 用户拖入或选择的字幕文件
    files: [],
    // 源语言
    srcLang: {
      google: 'en',
      baidu: 'en',
      sogou: 'auto',
    },
    // 目标语言
    distLang: {
      google: 'zh-cn',
      baidu: 'zh',
      sogou: 'zh-CHS',
    },
    // 选中的是哪家 API, selectedAPI
    selApi: 'google',
    editDataRes: ''
  },
  computed: {
    // 是否有文件
    hasFile() {
      return !!this.files.length
    },
    // 正在编辑的文件
    editingFile() {
      if (!this.editing) {
        return null
      }
      const file = this.files.find(f => f.id == this.editing)
      if (!file) {
        return null
      }
      return file
    },
    // TODO: 这是在干嘛？
    editData() {
      if (!this.editing) {
        return null
      }
      const file = this.files.find(f => f.id == this.editing)
      if (!file) {
        return null
      }
      const data = Object.assign({}, file);
      data.list = [];
      if (data.type === 'srt') {
        data.list = data.parse.map((block, index) => {
          let tBlock = data.translateData[index]
          if (tBlock.startTime !== block.startTime || tBlock.endTime != block.endTime) {
            tBlock = data.translateData.find(b => b.startTime == block.startTime && b.endTime == block.endTime)
          }

          return {
            time: `${block.startTime} - ${block.endTime}`,
            id: `${block.id}-${tBlock.id}`,
            items: [{
              id: block.id,
              text: block.text,
              lang: this.srcLang[this.selApi],
              apiShow: false,
              api: ['谷歌','百度','搜狗'],
            }, {
              id: tBlock.id,
              text: tBlock.text,
              lang: this.distLang[this.selApi],
            }],
          }
        })
      } else if (data.type == 'ass') {
        data.list = data.parse[3].body.map(block => {
          const time = `${block.value.Start} - ${block.value.End}`
          const tBlock = data.translateData.find(b => b.key == 'Dialogue' && b.value.Start == block.value.Start && b.value.End == block.value.End)
          if (tBlock) {
            return {
              time: time,
              id: `${block.value.Start}-${block.value.End}`,
              items: [{
                id: '',
                text: block.value.Text,
                lang: this.srcLang[this.selApi],
                apiShow: false,
                api: ['谷歌','百度','搜狗'],
              }, {
                id: '',
                text: tBlock.value.Text,
                lang: this.distLang[this.selApi],
              }]
            }
          }
        }).filter(i => i)
      }
      this.editDataRes = data;
      return data
    }
  },
  mounted() {
    document.getElementById('vue-app').style.display = 'block';
    // 之所以设置为 display:none; 然后现在 display:block 显示;
    // 是因为 vue 的执行需要时间，用户打开 App 时会看到一瞬间的闪烁, 这个体验不好, 所以先隐藏。执行到这里再显示
  },
  methods: {
    // 处理文件，保存到 this.files
    process_file(e) {
      const $input = this.$refs.input
      const files = [
        ...Array.from($input.files),
        ...Array.from(e.dataTransfer && e.dataTransfer.files || []),
      ]
      this.files = files.map(file => {
        const suffix = common.get_suffix(file.name)
        if (~['srt', 'ass'].indexOf(suffix)) {
          // 给文件做了一层包装
          return {
            id: Math.random(), // 如 0.8617322104565146
            name: file.name,   // 文件名
            path: file.path,   // 文件路径
            size: common.properFileSize(file.size), // 文件大小
            type: common.get_suffix(file.name),     // 文件后缀
            origin: file, // 原始 File 对象
            status: FILE_STATE.waiting, // 0 未翻译, 1 正在翻译, 2 翻译完成, 3 翻译失败
            parse: [],         // 字幕文件解析后数据
            translateData: [], // parser 翻译后数据
          }
        }
      }).filter(i => i)
      $input.value = ''
    },
    // 取消文件选择
    removeFile(file) {
      this.files = this.files.filter(f => f.id != file.id)
    },
    // 点击区域选择文件
    toSelect() {
      this.$refs.input.click()
    },
    // 开始翻译
    startTranslate() {
      var that = this;
      // 处理每个文件
      this.files.forEach(file => {
        file.status = FILE_STATE.pending // 文件状态: 翻译中
        try {
          translate(file.origin, this.distLang[this.selApi], this.srcLang[this.selApi], this.selApi).then(res => {
            file.parse = res.parse
            file.translateData = res.translate
            file.status = FILE_STATE.success // 文件状态: 翻译成功
            that.downloadFile(file); // 翻译成功后直接保存
          }).catch(err => {
            console.log(err);
            file.status = FILE_STATE.error
          })
        } catch(e) {
          console.log(e);
          file.status = FILE_STATE.error
        }
      })
    },
    // 下载文件
    downloadFile(file) {
      // [已翻译, 源语言en - 目标语言zh-cn]01 Auto-tracing in Illustrator
      var from = this.srcLang[this.selApi] // en
      var to = this.distLang[this.selApi] // zh
      var from_name = this.supportLang[this.selApi][from] // 英语
      var to_name = this.supportLang[this.selApi][to] // 简体中文
      var file_name_prefix = `[${this.supportApi[this.selApi]}翻译, ${from_name}->${to_name}] ` // [百度翻译, 英语->中文]
      download(file, file_name_prefix).then(res => {
        console.log('下载完成')
      })
    },
    // 正在编辑的文件 id
    editFile(file) {
      this.editing = file.id
    },
    quitEdit() {
      this.editing = ''
    },
    //
    onEditBlock(block, e) {
      const file = this.editingFile
      if (file.type == 'srt') {
        const [, distID] = block.id.split('-')
        const distBlock = file.translateData.find(b => b.id == distID)
        distBlock.text = e.target.value
      } else if (file.type == 'ass') {
        const distBlock = file.translateData.find(b => `${b.value.Start}-${b.value.End}` == block.id)
        distBlock.value.Text = e.target.value
      }
    },
    //
    selectApi(item) {
      item.apiShow = !item.apiShow;
    },
    //
    changeApi(item, num) {
      let temp = item.api[0];
      Vue.set(item.api, 0, item.api[num]);
      Vue.set(item.api, num, temp);
      item.apiShow = !item.apiShow;
    },
    //
    translateSingle(item, result) {
      let api = item.api[0];

      if (api === '谷歌') {
        google(item.text, this.distLang.google, this.srcLang[this.selApi]).then(res => {
          result.text = res.dist;
        })
      } else if (api === '百度') {
        baidu(item.text, this.distLang.baidu, this.srcLang[this.selApi]).then(res => {
          result.text = res.dist;
        })
      } else {
        sogou.translate(item.text, this.srcLang[this.selApi], this.distLang.sogou).then(res => {
          result.text = res;
        })
      }
    }
  }
})