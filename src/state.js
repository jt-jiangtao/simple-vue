import {observe} from "./observer/index";
import {nextTick, proxy} from "./utils";
import Watcher from "./observer/watcher";

export function initState(vm) {
    const  opts = vm.$options;

    if (opts.props) {
        initProps(vm);
    }
    if (opts.methods) {
        initMethod(vm);
    }
    if (opts.data) {
        initData(vm);
    }
    if (opts.computed) {
        initComputed(vm);
    }
    if (opts.watch) {
        initWatch(vm);
    }
}

function initProps(vm) {

}

function initMethod(vm) {

}

function initData(vm) {
    let data = vm.$options.data
    vm._data = data =  typeof data == 'function' ? data.call(vm) : data;
    // 数据的劫持方案 对象Object.defineProperty
    // 数组 单独处理

    // 当从vm上取值时，将属性代理到vm._data上面
    // 对vm做代理
    for (let key in data) {
        proxy(vm, '_data', key);
    }
    observe(data)
}

function initComputed(vm) {}

function initWatch(vm) {
    let watch = vm.$options.watch
    for (let key in watch){
        const handler = watch[key]
        if (Array.isArray(handler)){
            handler.forEach(handle => {
                createWatcher(vm, key, handle)
            })
        }else {
            createWatcher(vm, key, handler) // 对象 字符串 函数
        }
    }
}

function createWatcher(vm, exprOrFn, handler, options){ // options可以用来标识用户watcher
    if (typeof handler == 'object'){
        options = handler
        handler = handler.handler
    }
    if (typeof handler == 'string'){
        handler = vm.$options.methods[handler]
    }
    // key handler options
    return vm.$watch(exprOrFn, handler, options)
}

export function stateMixin(Vue){
    Vue.prototype.$nextTick = function (cb) {
        nextTick(cb)
    }
    Vue.prototype.$watch = function (exprOrFn, cb, options) {
        // 数据应该依赖这个watcher 数据变化后应该让这个watcher重新执行
        let watcher = new Watcher(this, exprOrFn, cb, {...options, user: true});
        if (options && options.immediate){
            cb()
        }
    }
}
