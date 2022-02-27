import {initState} from "./state";
import {compilerToFunctions} from "./compiler/index";
import {callHook, mountComponent} from "./lifecycle";
import {mergeOptions} from "./utils";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;

        // 将用户传递的和全局的合并
        // 这个方法可能会被子组件来调用, 子组件来调用Vue不为全局，而为继承之后的
        vm.$options = mergeOptions(vm.constructor.options, options);

        callHook(vm, 'beforeCreate')

        // vue里面核心特征，响应式数据原理
        // 初始化状态
        initState(vm)

        callHook(vm, 'created')

        // 渲染逻辑 el === vm.$mount() 最终$mount来挂载
        if (vm.$options.el){
            vm.$mount(vm.$options.el)
        }
    };

    Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el);

        const options = vm.$options;
        if (!options.render){
            // no render, template to render
            let template = options.template;
            // no render and has el, use el
            if (!template && el){
                template = el.outerHTML;
            }
            // compile template (from origin template or el)
            const render = compilerToFunctions(template);
            // finally use render
            options.render = render
        }
        // has render

        // 需要挂载组件
        mountComponent(vm, el);
    }
}