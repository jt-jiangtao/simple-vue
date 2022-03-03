import {popTarget, pushTarget} from "./dep";
import {nextTick} from "../utils";

let id = 0

// watcher负责渲染
class Watcher {
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm;
        this.exprOrFn = exprOrFn;
        this.cb = cb;
        this.options = options
        this.user = options.user // 这是一个用户watcher
        this.isWatcher = typeof options === 'boolean'
        this.id = id++ // watcher的唯一标识
        this.deps = []
        this.depsId = new Set()
        this.lazy = options.lazy // lazy不可变
        this.dirty = this.lazy // dirty可变

        // 如果是渲染watcher那么exprOrFn为重新渲染函数
        // 用户watcher的话为key即属性名称
        if (typeof exprOrFn == 'function') {
            this.getter = exprOrFn
        }else {
            this.getter = function (){ // 可能传递过来的是一个字符串w
                // 当去当前示例上取值时 才会触发依赖收集
                let path = exprOrFn.split('.')
                let obj = vm
                for (let i = 0; i < path.length; i++) {
                    obj = obj[path[i]]
                }
                // obj为old value
                return obj
            }
        }

        // 默认先调用一次get方法 进行取值 将结果保留
        this.value = this.lazy ? void 0 : this.get()
    }

    get() {
        pushTarget(this)
        let result = this.getter.call(this.vm) // 渲染页面要取值，get方法
        popTarget()
        return result
    }

    update() {

        if (this.lazy){
            this.dirty = true // 页面重新渲染为空
        }else {
            // 不要每次都调用get方法，get方法会非常消耗性能
            queueWatcher(this);
            // this.get() // 重新渲染
        }
    }

    run() {
        // 再一次取值，为修改之后的
        let newValue = this.get();
        // 第一次取值之后保留的
        let oldValue = this.value;
        this.value = newValue
        if (this.user){
            this.cb.call(this.vm, newValue, oldValue)
        }
    }

    addDep(dep) {
        let id = dep.id
        if (!this.depsId.has(id)) {
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addSub(this)
        }
    }

    evaluate(){
        this.value = this.get()
        this.dirty = false
    }

    depend(){
        // 计算属性watcher会存储dep
        // 通过watcher找到对应的所有Dep
        let i = this.deps.length
        while(i --){
            this.deps[i].depend()
        }
    }
}

// 将需要批量更新的watcher放到一个队列中，稍后watcher执行
let queue = []
let has = {};
let pending = false

function flushSchedulerQueue() {
    queue.forEach(watcher => {
        watcher.run();
        if (!watcher.user){
            watcher.cb()
        }
    })
    queue = []
    has = {}
    pending = false
}

function queueWatcher(watcher) {
    const id = watcher.id
    if (has[id] == null) {
        queue.push(watcher)
        has[id] = true

        // 等待所有代码同步完毕后执行
        if (!pending) { // 防抖处理
            nextTick(flushSchedulerQueue)
            pending = true
        }
    }
}

export default Watcher
