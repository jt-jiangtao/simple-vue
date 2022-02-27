export function patch(oldVnode, vnode){
    // 默认初始化时 直接用虚拟节点创建出真实节点 替换掉老节点
    if (oldVnode.nodeType === 1){
        // 将虚拟节点转化为真实节点
        console.log(oldVnode, vnode)
        let el = createElm(vnode) // #app
        let parentElm = oldVnode.parentNode;
        // nextSibling下一个兄弟节点
        parentElm.insertBefore(el, oldVnode.nextSibling) // 将当前真实元素插入到app后面
        parentElm.removeChild(oldVnode)

        return el
    }else {
        // 在更新时 拿老虚拟节点和新的虚拟节点做对比 将不同的地方更新真实的dom
        // 既有渲染功能 也有更新功能

        // 1. 比较两个元素的标签 标签不一样直接替换掉即可
        if (oldVnode.tag !== vnode.tag) {
            return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
        }
        // 2. 标签一样，文本节点的虚拟节点tag都为undefined
        // 文本对比
        if (!oldVnode.tag) {
            if (oldVnode.text !== vnode.text) {
                return oldVnode.el.textContent = vnode.text
            }
        }
        // 3. 标签相同并且必须开始比对标签的属性和儿子
        // 标签相同最好直接复用
        let el = vnode.el = oldVnode.el // 复用老节点
        // 更新属性: 用新的虚拟节点的属性和老的比较
        updateProperties(vnode, oldVnode.data);

        // 比较孩子
        let oldChildren = oldVnode.children || [];
        let newChildren = vnode.children || []
        // 老的有孩子节点 新的也有孩子节点 diff算法
        if (oldChildren.length > 0 && newChildren.length > 0){
            updateChildren(oldChildren, newChildren, el)
        }else if (oldChildren.length > 0 ){ // 老的有孩子节点 新的没有孩子节点
            el.innerHTML = ''
        }else if (newChildren.length > 0){  // 老的没有孩子节点 新的有孩子节点
            for (let i = 0; i < newChildren.length; i++) {
                let child = newChildren[i]
                // 浏览器存在性能优化，不需要处理文档碎片
                el.appendChild(createElm(child))
            }
        }
        return el
    }
}

// 儿子间的比较
function updateChildren(oldChildren, newChildren, parent){
    // vue中的diff算法做了很多优化
    // dom中操作有很多常见的逻辑 将节点插入到孩子的头部、尾部、儿子倒叙正序
    // vue2中采用的是双指针的方式

    // 在尾部添加
    // 4指针 比较
    let oldStartIndex = 0
    let oldStartVnode = oldChildren[oldStartIndex]
    let oldEndIndex = oldChildren.length - 1
    let oldEndVnode = oldChildren[oldEndIndex]

    let newStartIndex = 0
    let newStartVnode = newChildren[newStartIndex]
    let newEndIndex = newChildren.length - 1
    let newEndVnode = newChildren[newEndIndex]

    // 比较谁先循环完毕 停止
    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex){
        // oldStartIndex newStartIndex 如果两个是相同元素 对比孩子节点
        if(isSameVnode(oldStartVnode, newStartVnode)){
            patch(oldStartVnode, newStartVnode) // 更新属性 递归更新子节点
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        }else if (isSameVnode(oldEndVnode, newEndVnode)){
            patch(oldEndVnode, newEndVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        }
        // 反转节点
    }
    if (newStartIndex <= newEndIndex){
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            // parent.appendChild(createElm(newChildren[i]))
            // 向后插入ele为null
            // 向前插入ele为当前向谁的前面插入
            let ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
            parent.insertBefore(createElm(newChildren[i]), ele)
        }
    }
}

// 标签相同 key相同 但是属性不相同是有可能的 这种情况只需要更新属性即可
function isSameVnode(oldVnode, newVnode){
    return (oldVnode.tag === newVnode.tag) && (oldVnode.key === newVnode.key)
}

export function createElm(vnode){
    let {tag, children, key, data, text} = vnode
    if (typeof tag == 'string'){
        // vnode.el可以用来更新
        vnode.el = document.createElement(tag)
        // 只有元素才有属性
        updateProperties(vnode)
        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        })
    }else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

function updateProperties(vnode, oldProps = {}) {
    let newProps = vnode.data || {}
    let el = vnode.el
    // 老的有 新的没有 删除属性
    for (let key in oldProps) {
        if (!newProps[key]) {
            el.removeAttribute(key)
        }
    }
    // 新的有 直接用新的来更新

    // 样式处理 style={color: red} => style={background: red}
    let newStyle = newProps.style || {}
    let oldStyle = oldProps.style || {}
    for (let key in  oldStyle){
        if (!newStyle[key]){
            el.style[key] = ''
        }
    }
    // 没有的属性直接删除
    // 有的属性直接替换或增加

    for (let key in newProps) {
        if (key === 'style') {
            for (let styleName in newProps.style) {
                el.style[styleName] = newProps.style[styleName];
            }
        } else if (key === 'class') {
            el.className = newProps.class;
        } else {
            el.setAttribute(key, newProps[key]);
        }
    }
}
