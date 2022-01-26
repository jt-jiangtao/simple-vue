import {arrayMethods} from "./array";


class Observer {
    constructor(data) {
        // 判断一个对象是否被观测过: 是否含有__ob__属性
        Object.defineProperty(data, '__ob__',{
            enumerable: false, // 不能被枚举，不能被循环出来 for...in
            configurable: false, // delete
            value: this,
            writable: false
        })

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
    observe(value)
    Object.defineProperty(data, key, {
        get(){
            console.log("get---> ", key)
            return value
        },
        set(newValue){
            console.log("set---> ", key, newValue)
            if (newValue === value) return;
            observe(newValue)
            value = newValue;
        }
    })
}

export function observe(data) {
    // typeof null 也是object

    // 不能不是对象，并且不是null
    if (typeof data !== 'object' || data === null) {
        return;
    }
    if (data.__ob__) return data;
    return new Observer(data);
}