import {initMixin} from "./init";
import {lifecycleMixin} from "./lifecycle";
import {renderMixin} from "./vdom/index";
import {initGlobalAPI} from "./initGlobalAPI/index";
import {stateMixin} from "./state";

function Vue(options) {
    this._init(options); //入口方法，做初始化操作
}

// 写成一个个插件进行原型扩展

initMixin(Vue)
lifecycleMixin(Vue) // 混合生命周期
renderMixin(Vue)
stateMixin(Vue)

// 初始化全局API
initGlobalAPI(Vue)



// differ算法测试
// import {compilerToFunctions} from "./compiler/index";
// import {createElm, patch} from "./vdom/patch"
// let vm1 = new Vue({
//     data: {
//         name: "vm1---"
//     }
// })
// let render1 = compilerToFunctions(`<div>
//     <li key="C" style="background-color: aquamarine">C</li>
//     <li key="E" style="background-color: red">E</li>
//     <li key="D" style="background-color: blue">D</li>
// </div>`)
// let vnode1 = render1.call(vm1)
// document.body.appendChild(createElm(vnode1))
//
// let vm2 = new Vue({
//     data: {
//         name: "vm2---"
//     }
// })
// let render2 = compilerToFunctions(`<div>
//     <li key="A" style="background-color: yellow">A</li>
//     <li key="D" style="background-color: red">D</li>
//     <li key="E" style="background-color: blue">E</li>
//     <li key="F" style="background-color: blue">F</li>
// </div>`)
// let vnode2 = render2.call(vm2)
//
// setTimeout(()=>{
//     patch(vnode1, vnode2)
// }, 3000)

export default Vue
