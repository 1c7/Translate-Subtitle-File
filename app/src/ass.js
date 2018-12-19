const assParser = require('ass-parser'); // for ASS
const assStringify = require('ass-stringify'); // for ASS

const {translate: translateAPI} = require('./translate_api.js');
const common = require('./common.js');
const config = require('./config.js');

exports.translate = function (raw_content, to, from) {
  const parse = assParser(raw_content);
  const data = parse[3]['body'];


  // 翻译分组批量翻译，快凑齐了 config.LENGTH_LIMIT_PER_REQUEST: 5000 字符数时一起翻译
  const batchs = data.reduce((batch, block) => {
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

  console.log(batchs)

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
  data.parse[3].body = data.parse[3].body.concat(data.translateData)
  const assData = JSON.parse(JSON.stringify(data.parse))
  const content = assStringify(assData)
  // console.log(content)
  return content
}
