import {patch} from "./vdom/patch";
import Watcher from "./observer/watcher";

export function lifecycleMixin(Vue){
    Vue.prototype._update = function (vnode){
        const vm = this

        // 用新的创建的元素替换掉原来的元素
        vm.$el = patch(vm.$el, vnode)
    }
}

export function mountComponent(vm, el) {
    vm.$el = el
    // 调用render方法来渲染el属性

    // 先调用render方法创建虚拟节点，再将虚拟节点渲染到页面上
    // _render render => vnode
    // _update vnode render to html

    callHook(vm, 'beforeMount')
    let updateComponent = () => {
        vm._update(vm._render());
    }
    // watcher是用来渲染的
    // true表示渲染watcher
    let watcher = new Watcher(vm, updateComponent, ()=>{
        callHook(vm, 'updated')
    }, true)
    // 将属性和watcher绑定在一起
    callHook(vm, 'mounted')
}

// template -> ast -> render function (transform to vnode) -> vnode -> html
// vue渲染流程: 初始化数据 -> 初始化数据 -> 将模板编译 -> render函数 -> 生成虚拟节点 -> 生成真实dom -> html


export function callHook(vm, hook){
    const handlers = vm.$options[hook]
    if (handlers){
        for (let i = 0; i < handlers.length; i++) {
            // 保证用户生命周期里面的this为当前实例
            handlers[i].call(vm);
        }
    }
}
