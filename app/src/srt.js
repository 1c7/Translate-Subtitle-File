const parser = require('subtitles-parser'); // for SRT, support 'fromSrt' and 'toSrt'
const common = require('./common.js');
const config = require('./config.js');
const {translate: translateAPI} = require('./translate_api.js');

function translate(content, to, from) {
  const data = parser.fromSrt(content);
  const lastID = data[data.length - 1].id

  // 翻译分组批量翻译，快凑齐了 config.LENGTH_LIMIT_PER_REQUEST: 5000 字符数时一起翻译
  const batchs = data.reduce((batch, block) => {
    let bat
    if (batch.length) {
      bat = batch.pop()
    } else {
      bat = {
        content: '',
        includes: []
      }
    }
    const text = common.remove_tag_keep_text(block.text)
    const nextContent = bat.content + text + config.LINE_BREAK
    const nextLength = encodeURIComponent(nextContent).length
    if (nextLength < config.LENGTH_LIMIT_PER_REQUEST && bat.includes.length < 100) {
      bat.content = nextContent
      bat.includes.push(block)
    } else {
      batch.push(bat)
      bat = {
        content: text + config.LINE_BREAK,
        includes: [block]
      }
    }
    batch.push(bat)
    return batch
  }, [])

  const translateProcess = batchs.map(bat => {
    return translateAPI(bat.content, to, from).then(res => {
      bat.result = res.dist
      return bat
    }).catch(err => {
      console.log('有一批翻译失败', err, bat.content)
      bat.result = ''
      return bat
    })
  })
  return Promise.all(translateProcess).then(bats => {
    const res = bats.reduce((list, bat) => {
      const strs = bat.result.split(/[％|\%]?0A/)
      console.log(strs.length, bat.includes.length)
      const items = bat.includes.map((block, index) => ({
        endTime: block.endTime,
        startTime: block.startTime,
        id: String(Number(lastID) + Number(block.id)),
        text: (strs[index] || block.text).trim(),
      }))
      
      return list.concat(items)
    }, [])
    return {
      parse: data,
      translate: res
    }
  })
}

function exportContent(data) {
  const origin = common.deepClone(data.parse)
  const srtData = origin.concat(data.translateData)
  const content = parser.toSrt(srtData)
  // console.log(content)
  return content
}

exports.translate = translate;
exports.exportContent = exportContent;