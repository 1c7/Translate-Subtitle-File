const assParser = require('ass-parser'); // for ASS
const assStringify = require('ass-stringify'); // for ASS
const common = require('./common.js');
const config = require('./config.js');

exports.translate = function (raw_content, to, from, selApi) {
  const parse = assParser(raw_content);
  const data = parse[3]['body'];

  // 翻译分组批量翻译，快凑齐了 config.LENGTH_LIMIT_PER_REQUEST: 5000 字符数时一起翻译
  const batchs = data.reduce((batch, block, idx) => {
    if (block.key !== 'Dialogue') {
      return batch
    }
    let bat
    if (batch.length) {
      bat = batch.pop()
    } else {
      bat = {
        content: '',
        includes: []
      }
    }
    const text = common.remove_tag_keep_text(block.value.Text)
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

  console.log('一批');
  console.log(batchs);

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

      const items = bat.includes.map((block, index) => {
        const item = {
          key: block.key,
          value: JSON.parse(JSON.stringify(block.value)),
        }
        item.value.Text = (strs[index] || block.value.Text).trim()
        return item
      })
      return list.concat(items)
    }, [])
    return {
      parse: parse,
      translate: res
    }
  })
}

exports.exportContent = function(data) {
  const origin = common.deepClone(data.parse)
  origin[3].body = origin[3].body.concat(data.translateData)
  const content = assStringify(origin)

  return content
}
