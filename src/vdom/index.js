
export function renderMixin(Vue){
    // 虚拟节点，用对象来描述dom
    Vue.prototype._c = function () { // 创建元素
        return createElement(...arguments)
    }

    Vue.prototype._s = function (val) { // stringify
        // JSON.stringify(val)会导致所有元素节点进行依赖收集
        return val == null ? '' : (typeof val === 'object') ? JSON.stringify(val) : val;
    }

    Vue.prototype._v = function (text) { // 创建文本元素
        return createTextVnode(text)
    }

    Vue.prototype._render = function (){
        const vm = this
        const render = vm.$options.render
        let vnode = render.call(vm)
        return vnode
    }
}

//  return _c('div', {id: 'app', style: {color: 'red'}}, _v('hello' + _s(name)), _c('span', null, _v('hello')))

function createElement(tag, data = {}, ...children) {
    return vnode(tag, data, data.key, children, undefined)
}

function createTextVnode(text){
    return vnode(undefined, undefined, undefined, undefined,text)
}

// 操作正式dom消耗性能，vnode可以只更新不同，复用相同
function vnode(tag, data, key, children, text){
    // ast不用自定义属性
    return {
        tag,
        data,
        key,
        children,
        text,
        // componentsInstance: ''
        // 可以自定义描述对象
    };
}