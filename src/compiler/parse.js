// let ast = {
//     tag: "div",
//     parent: null,
//     type: 1,
//     attrs: [],
//     children: [{
//         tag: null,
//         parent: "parent div",
//         attrs: [],
//         text: "hello {{name}}"
//     },{
//
//     }]
// }
// <div id="app">hello {{name}} <span>world</span></div>

const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // abc-aaa 匹配标签名
// ?:匹配不捕获
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // <aaa:asdads>
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >  <div>
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g  // {{}}

// 通过树和栈
function createASTElement(tagName, attrs){
    return {
        tag: tagName, // 标签名
        type: 1, // 元素类型
        children: [], // 孩子列表
        attrs,  // 属性集合
        parent: null  // 父元素
    }
}

// 因为效率很低， 所以在开发部署的时候打包为最终的代码
export function parseHTML(html) {
    let root;
    let currentParent;
    let stack = []
    // 检验标签是否符合规则
    function start(tagName, attrs){
        let element = createASTElement(tagName, attrs)
        if (!root){
            root = element;
        }
        currentParent = element;
        stack.push(element)
    }

    function end(tagName){ // 结尾标签处创建父子关系
        let element = stack.pop()
        currentParent = stack[stack.length - 1]
        if (currentParent){ // 在闭合时可以知道这个标签的父标签
            element.parent = currentParent
            currentParent.children.push(element)
        }
    }
    function chars(text){
        text = text.trim()
        if (text){
            currentParent.children.push({
                type: 3,
                text
            })
        }
    }


    while (html){
        let textEnd = html.indexOf('<');
        if (textEnd === 0) {
            // this is a tag, not a text
            const startTagMatch = parseStartTag();
            if (startTagMatch){
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            const endTagMatch = html.match(endTag);
            if (endTagMatch){
                advance(endTagMatch[0].length)
                end(endTagMatch[1]);
                continue
            }

            //TODO: v-bind ... <!DOCTYPE <!---> <br/>
        }
        // text
        let text;
        if (textEnd > 0){
            text = html.substring(0, textEnd)
            advance(text.length)
            chars(text)
        }
    }

    function advance(n){ // sub string
        html = html.substring(n)
    }

    function parseStartTag(){
        const start = html.match(startTagOpen);
        if (start) {
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length) // delete start tag
            // is end tag
            let end;
            let attr;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
                advance(attr[0].length)
            }
            if (end){
                advance(end[0].length)
            }
            return match
        }
    }

    return root
}