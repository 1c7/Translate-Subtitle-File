const parser = require('subtitles-parser'); // for SRT, support 'fromSrt' and 'toSrt'
const common = require('./common.js');
const config = require('./config.js');

function translate(content, to, from, selApi) {
  const data = parser.fromSrt(content);
  const lastID = data[data.length - 1].id // 最后一个 id

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
    return common.translateApi(selApi, bat, to, from);
  })
  return Promise.all(translateProcess).then(bats => {
    const res = bats.reduce((list, bat) => {
      let strs;
      if (selApi === 'google' || selApi === 'baidu') {
        strs = bat.result.split(/[％|\%]?0A/)
      } else {
        strs = bat.result.replace(/%0A|%\s0A/g, '').split(/\n/)
      }
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

// 导出翻译结果
function exportContent(data) {
  const origin = common.deepClone(data.parse)
  const srtData = origin.concat(data.translateData)
  const content = parser.toSrt(srtData)
  return content
}

exports.translate = translate;
exports.exportContent = exportContent;