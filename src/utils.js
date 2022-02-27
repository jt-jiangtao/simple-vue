export function proxy(vm, data, key) {
    Object.defineProperty(vm, key, {
        get(){
            return vm[data][key]
        },
        set(newValue){
            vm[data][key] = newValue
        }
    })
}

export function defineProperty(data, key, value){
    Object.defineProperty(data, key,{
        enumerable: false, // 不能被枚举，不能被循环出来 for...in
        configurable: false, // delete
        value,
        writable: false
    })
}

const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed'
]

let strats = {}

function mergeHook(parentVal, childVal){
    if(childVal){
        if(parentVal){
            return parentVal.concat(childVal);
        }else{
            return [childVal];
        }
    }else{
        return parentVal;
    }
}

LIFECYCLE_HOOKS.forEach(hook=>{
    strats[hook] = mergeHook
})

export function mergeOptions(parent, child){
    const options = {}
    for(let key in parent){
        mergeField(key)
    }
    for (let key in child){
        if (!parent.hasOwnProperty(key)){
            mergeField(key)
        }
    }
    // 浅合并
    function mergeField(key){
        if (strats[key]){
            return options[key] = strats[key](parent[key], child[key])
        }
        if (typeof parent[key] === 'object' && typeof  child[key] === 'object'){
            options[key] = {
                ...parent[key],
                ...child[key]
            }
        }else if (child[key] == null){
            options[key] = parent[key]
        }else {
            options[key] = child[key]
        }
    }
    return options
}

let callbacks = []

function flushCallbacks() {
    while (callbacks.length){
        let cb = callbacks.pop()
        cb()
    }
    pending = false
}
let timerFunc;
if (Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks)
    };
} else if (MutationObserver) { // 可以监控dom变化，监控完毕后异步更新
    let observe = new MutationObserver(flushCallbacks)
    let textNode = document.createTextNode(1)
    observe.observe(textNode, {characterData: true})
    timerFunc = () => {
        textNode.textContent = 2
    }
}else if (setImmediate){
    timerFunc = ()=>{
        setImmediate(flushCallbacks)
    }
}else {
    timerFunc = ()=>{
        setTimeout(flushCallbacks)
    }
}
let pending = false
// 核心为异步方法
export function nextTick(cb){
    callbacks.push(cb)
    if (!pending){
        timerFunc();
        pending = true
    }
}
