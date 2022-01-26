(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  // 我要重写数组的那些方法 7个 push shift unshift pop reverse sort splice 会导致数组本身发生变化
  // slice()
  // 拿到数组原型上的方法（原来的方法）
  var oldArrayMethods = Array.prototype; // value.__proto__ = arrayMethods 原型链查找的问题， 会向上查找，先查找我重写的，重写的没有会继续向上查找
  // arrayMethods.__proto__ = oldArrayMethods
  // Object.create 创建新对象，并使用原有的对象来提供新创建的对象的__proto__

  var arrayMethods = Object.create(oldArrayMethods);
  var methods = ['push', 'shift', 'unshift', 'pop', 'sort', 'splice', 'reverse'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      console.log("array-->"); // this谁调用该方法this为谁
      // this为Observer中的data

      var result = oldArrayMethods[method].apply(this, arguments);
      var inserted;
      debugger;
      var ob = this.__ob__;

      switch (method) {
        // 新增时可能会存在Object
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          // vue.$set原理
          args.slice(2); // arr.splice(0, 1, {a: 1})

          break;
      }

      if (inserted) ob.observeArray(inserted);
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 判断一个对象是否被观测过: 是否含有__ob__属性
      Object.defineProperty(data, '__ob__', {
        enumerable: false,
        // 不能被枚举，不能被循环出来 for...in
        configurable: false,
        // delete
        value: this,
        writable: false
      }); // data.__ob__ = this
      // 使用defineProperty重新定义属性

      if (Array.isArray(data)) {
        // push shift unshift splice sort reverse pop
        // 函数劫持 切片编程
        data.__proto__ = arrayMethods; // 观测数组中的对象类型

        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data);
        keys.forEach(function (key) {
          defineReactive(data, key, data[key]); // 将数据定义为响应式数据
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          observe(item);
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        console.log("get---> ", key);
        return value;
      },
      set: function set(newValue) {
        console.log("set---> ", key, newValue);
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
      }
    });
  }

  function observe(data) {
    // typeof null 也是object
    // 不能不是对象，并且不是null
    if (_typeof(data) !== 'object' || data === null) {
      return;
    }

    if (data.__ob__) return data;
    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function initData(vm) {
    var data = vm.$options.data;
    vm._data = data = typeof data == 'function' ? data.call(vm) : data; // 数据的劫持方案 对象Object.defineProperty
    // 数组 单独处理

    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // vue里面核心特征，响应式数据原理
      // 初始化状态

      initState(vm);
    };
  }

  function Vue(options) {
    this._init(options); //入口方法，做初始化操作

  } // 写成一个个插件进行原型扩展


  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
