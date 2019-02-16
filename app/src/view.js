const { translate, download } = require('./src/translate');
const common = require('./src/common')

new Vue({
  el: '#vue-app',
  data: {
    editing: '',
    movingenter: false,
    supportLang: {
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
    statusText: {
      0: ['waiting', '等待翻译'],
      1: ['padding', '正在翻译'],
      2: ['success', '翻译完成'],
      3: ['error', '翻译失败']
    },
    files: [],
    srcLang: 'auto',
    distLang: 'zh-cn'
  },
  computed: {
    hasFile() {
      return !!this.files.length
    },
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
    editData() {
      if (!this.editing) {
        return null
      }
      const file = this.files.find(f => f.id == this.editing)
      if (!file) {
        return null
      }
      const data = Object.assign({}, file)
      data.list = []
      if (data.type == 'srt') {
        data.list = data.parse.map((block, index) => {
          let tBlock = data.translateData[index]
          if (tBlock.startTime != block.startTime || tBlock.endTime != block.endTime) {
            tBlock = data.translateData.find(b => b.startTime == block.startTime && b.endTime == block.endTime)
          }

          return {
            time: `${block.startTime} - ${block.endTime}`,
            id: `${block.id}-${tBlock.id}`,
            items: [{
              id: block.id,
              text: block.text,
              lang: this.srcLang,
            }, {
              id: tBlock.id,
              text: tBlock.text,
              lang: this.distLang,
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
                lang: this.srcLang,
              }, {
                id: '',
                text: tBlock.value.Text,
                lang: this.distLang,
              }]
            }
          }
        }).filter(i => i)
      }
      return data
    }
  },
  mounted() {
    document.getElementById('vue-app').style.display = 'block'
  },
  methods: {
    process_file(e) {
      // console.log(e);
      const $input = this.$refs.input
      const files = [
        ...Array.from($input.files),
        ...Array.from(e.dataTransfer && e.dataTransfer.files || []),
      ]
      this.files = files.map(file => {
        const suffix = common.get_suffix(file.name)
        if (~['srt', 'ass'].indexOf(suffix)) {
          return {
            id: Math.random(),
            name: file.name,
            path:file.path,
            size: common.properFileSize(file.size),
            type: common.get_suffix(file.name),
            origin: file, // 原始 File 对象
            status: 0, // 0 未翻译, 1 正在翻译, 2 翻译完成, 3 翻译失败,
            parse: [], // 字幕文件解析后数据
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
      this.files.forEach(file => {
        console.log('处理文件');
        console.log(file);
        file.status = 1
        try {
          console.log('开始翻译');
          translate(file.origin, this.distLang, this.srcLang).then(res => {
            console.log('到这里了吗??-------------------------');
            file.parse = res.parse
            file.translateData = res.translate
            file.status = 2
          }).catch(err => {
            console.log(err);
            file.status = 3
          })
        } catch(e) {
          console.log(e);
          file.status = 3
        }
      })
    },
    downloadFile(file) {
      download(file, `[已翻译${this.srcLang} - ${this.distLang}]`).then(res => {
        console.log('下载完成')
      })
    },
    editFile(file) {
      this.editing = file.id
    },
    quitEdit() {
      this.editing = ''
    },
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
  }
})