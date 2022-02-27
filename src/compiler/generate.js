// <div id="app" style="color: red"> hello {{name}} <span>hello</span></div>
// render(){
//  return _c('div', {id: 'app', style: {color: 'red'}}, _v('hello' + _s(name)), _c('span', null, _v('hello')))
// }
// 元素 _c(tagName, attrs, element...)
// 文本 _v(text)
// 变量 _s(valueName)

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g  // {{}}

// name: "id"
// value: "app"
function genProps(attrs) {
    let str = ''
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name === 'style'){
            let obj = {}
            attr.value.replace(/\s/g, '').split(";").forEach(item => {
                let [key, value] = item.split(":")
                obj[key] = value
            })
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
}

function gen(node) {
    if (node.type === 1) return generate(node)
    else {
        let text = node.text;
        // normal text
        // _v("hello {{name}}") => _v('hello ' + _s(name))
        if (! defaultTagRE.test(text)){
            return `_v(${JSON.stringify(text)})` // 需要对{{}}处理
        }
        let tokens = [] // 存放每一段代码
        let lasIndex = defaultTagRE.lastIndex = 0; // 如果正则是全局模式，需要每次使用前置为0
        let match, index; // 每次匹配到的结果
        while(match = defaultTagRE.exec(text)){
            index = match.index // 保存匹配到的索引
            if (index > lasIndex){
                tokens.push(JSON.stringify(text.slice(lasIndex, index)))
            }
            tokens.push(`_s(${match[1].trim()})`);
            lasIndex = index + match[0].length
        }
        if (lasIndex < text.length) tokens.push(JSON.stringify(text.slice(lasIndex)));
        return `_v(${tokens.join('+')})`
    }
}

function getChildren(el) {
    const children = el.children
    if (children){ // 将所有转化后的child用,拼接
        return children.map(child => gen(child)).join(',')
    }
}

export function generate(el) {
    let children = getChildren(el)
    let code = `_c('${el.tag}', ${
        el.attrs.length ? `${genProps(el.attrs)}` : 'undefined'
    }${
        children? `,${children}` : ''
    })`

    return code
}