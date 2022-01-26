import {observe} from "./observer/index";

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

function initMethod(vm) {}

function initData(vm) {
    let data = vm.$options.data
    vm._data = data =  typeof data == 'function' ? data.call(vm) : data;
    // 数据的劫持方案 对象Object.defineProperty
    // 数组 单独处理
    observe(data)
}

function initComputed(vm) {}

function initWatch(vm) {}