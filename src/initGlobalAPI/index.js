import {mergeOptions} from "../utils";

export function initGlobalAPI(Vue){
    Vue.options = {}

    Vue.mixin = function (mixin){
        // 如何实现两个对象的合并
        this.options = mergeOptions(this.options, mixin)
    }
    // 生命周期的合并策略
    // 生命周期必须合并为一个数组，而不是覆盖
}