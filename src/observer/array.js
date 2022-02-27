// 我要重写数组的那些方法 7个 push shift unshift pop reverse sort splice 会导致数组本身发生变化
// slice()

// 拿到数组原型上的方法（原来的方法）
let oldArrayMethods = Array.prototype;
// value.__proto__ = arrayMethods 原型链查找的问题， 会向上查找，先查找我重写的，重写的没有会继续向上查找
// arrayMethods.__proto__ = oldArrayMethods
// Object.create 创建新对象，并使用原有的对象来提供新创建的对象的__proto__
export const arrayMethods = Object.create(oldArrayMethods);

const methods = [
    'push',
    'shift',
    'unshift',
    'pop',
    'sort',
    'splice',
    'reverse'
]

methods.forEach(method => {
    arrayMethods[method] = function (...args){
        // 当调用劫持后的方法 页面应该更新


        console.log("array-->")
        // this谁调用该方法this为谁
        // this为Observer中的data
        const result = oldArrayMethods[method].apply(this, arguments);
        let inserted;

        let ob = this.__ob__
        switch (method) {
            // 新增时可能会存在Object
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice': // vue.$set原理
                args.slice(2); // arr.splice(0, 1, {a: 1})
                break;
            default:
                break;
        }
        if (inserted) ob.observeArray(inserted);
        ob.dep.notify()
        return result;
    }
})