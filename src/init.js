import {initState} from "./state";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;
        vm.$options = options;

        // vue里面核心特征，响应式数据原理
        // 初始化状态
        initState(vm)
    };
}