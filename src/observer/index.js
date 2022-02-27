import {arrayMethods} from "./array";
import {defineProperty} from "../utils";
import Dep from "./dep";


class Observer {
    constructor(data) {
        this.dep = new Dep()

        // 判断一个对象是否被观测过: 是否含有__ob__属性

        defineProperty(data, '__ob__' , this);

        // data.__ob__ = this

        // 使用defineProperty重新定义属性
        if (Array.isArray(data)) {
            // push shift unshift splice sort reverse pop
            // 函数劫持 切片编程
            data.__proto__ = arrayMethods;
            // 观测数组中的对象类型
            this.observeArray(data)
        }else {
            this.walk(data);
        }
    }

    walk(data) {
        let keys = Object.keys(data);
        keys.forEach(key=>{
            defineReactive(data, key, data[key]); // 将数据定义为响应式数据
        })
    }

    observeArray(data) {
        data.forEach(item => {
            observe(item)
        })
    }

}

function defineReactive(data, key, value) {
    // 获取到数组对应的dep
    let childDep = observe(value)

    let dep = new Dep() // 每个属性都有dep

    Object.defineProperty(data, key, {
        get(){ // 依赖收集
            console.log("get---> ", key)
            if (Dep.target){
                dep.depend()
                if (childDep){
                    // 默认给数组和对象增加了dep属性
                    childDep.dep.depend()
                }
            }
            // 注意引用
            return value
        },
        set(newValue){ // 依赖更新
            console.log("set---> ", key, newValue)
            if (newValue === value) return;
            observe(newValue)
            value = newValue;

            dep.notify()
        }
    })
}

// 只观测原来存在的数据
export function observe(data) {
    // typeof null 也是object

    // 不能不是对象，并且不是null
    if (typeof data !== 'object' || data === null) {
        return;
    }
    if (data.__ob__) return data;
    return new Observer(data);
}