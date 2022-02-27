(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }

    return target;
  }

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

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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

      // 当调用劫持后的方法 页面应该更新
      console.log("array-->"); // this谁调用该方法this为谁
      // this为Observer中的data

      var result = oldArrayMethods[method].apply(this, arguments);
      var inserted;
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
      ob.dep.notify();
      return result;
    };
  });

  function proxy(vm, data, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[data][key];
      },
      set: function set(newValue) {
        vm[data][key] = newValue;
      }
    });
  }
  function defineProperty(data, key, value) {
    Object.defineProperty(data, key, {
      enumerable: false,
      // 不能被枚举，不能被循环出来 for...in
      configurable: false,
      // delete
      value: value,
      writable: false
    });
  }
  var LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed'];
  var strats = {};

  function mergeHook(parentVal, childVal) {
    if (childVal) {
      if (parentVal) {
        return parentVal.concat(childVal);
      } else {
        return [childVal];
      }
    } else {
      return parentVal;
    }
  }

  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });
  function mergeOptions(parent, child) {
    var options = {};

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    } // 浅合并


    function mergeField(key) {
      if (strats[key]) {
        return options[key] = strats[key](parent[key], child[key]);
      }

      if (_typeof(parent[key]) === 'object' && _typeof(child[key]) === 'object') {
        options[key] = _objectSpread2(_objectSpread2({}, parent[key]), child[key]);
      } else if (child[key] == null) {
        options[key] = parent[key];
      } else {
        options[key] = child[key];
      }
    }

    return options;
  }
  var callbacks = [];

  function flushCallbacks() {
    while (callbacks.length) {
      var cb = callbacks.pop();
      cb();
    }

    pending$1 = false;
  }

  var timerFunc;

  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    // 可以监控dom变化，监控完毕后异步更新
    var observe$1 = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(1);
    observe$1.observe(textNode, {
      characterData: true
    });

    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks);
    };
  }

  var pending$1 = false; // 核心为异步方法

  function nextTick(cb) {
    callbacks.push(cb);

    if (!pending$1) {
      timerFunc();
      pending$1 = true;
    }
  }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    // 收集模板中的{{}}对应的watcher
    function Dep() {
      _classCallCheck(this, Dep);

      // watcher去重
      this.subs = [];
      this.id = id$1++;
    } // 渲染时调用收集依赖，一个渲染位对应一个dep


    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // this.subs.push(Dep.target) // 这样出现多个{{name}}时，会保存多次，更新name时会重复渲染多次
        Dep.target.addDep(this);
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }(); // 多对多大关系 一个属性有一个dep是用来收集watcher的
  // dep可以存多个watcher vm.$watch('name')
  // 一个watcher可以对应多个dep


  Dep.target = null;
  function pushTarget(watcher) {
    Dep.target = watcher;
  }
  function popTarget() {
    Dep.target = null; // 渲染完成后将target删除
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      this.dep = new Dep(); // 判断一个对象是否被观测过: 是否含有__ob__属性

      defineProperty(data, '__ob__', this); // data.__ob__ = this
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
    // 获取到数组对应的dep
    var childDep = observe(value);
    var dep = new Dep(); // 每个属性都有dep

    Object.defineProperty(data, key, {
      get: function get() {
        // 依赖收集
        console.log("get---> ", key);

        if (Dep.target) {
          dep.depend();

          if (childDep) {
            // 默认给数组和对象增加了dep属性
            childDep.dep.depend();
          }
        } // 注意引用


        return value;
      },
      set: function set(newValue) {
        // 依赖更新
        console.log("set---> ", key, newValue);
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
        dep.notify();
      }
    });
  } // 只观测原来存在的数据


  function observe(data) {
    // typeof null 也是object
    // 不能不是对象，并且不是null
    if (_typeof(data) !== 'object' || data === null) {
      return;
    }

    if (data.__ob__) return data;
    return new Observer(data);
  }

  var id = 0; // watcher负责渲染

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.exprOrFn = exprOrFn;
      this.cb = cb;
      this.options = options;
      this.user = options.user; // 这是一个用户watcher

      this.isWatcher = typeof options === 'boolean';
      this.id = id++; // watcher的唯一标识

      this.deps = [];
      this.depsId = new Set(); // 如果是渲染watcher那么exprOrFn为重新渲染函数
      // 用户watcher的话为key即属性名称

      if (typeof exprOrFn == 'function') {
        this.getter = exprOrFn;
      } else {
        this.getter = function () {
          // 可能传递过来的是一个字符串w
          // 当去当前示例上取值时 才会触发依赖收集
          var path = exprOrFn.split('.');
          var obj = vm;

          for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]];
          } // obj为old value


          return obj;
        };
      } // 默认先调用一次get方法 进行取值 将结果保留


      this.value = this.get();
    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        pushTarget(this);
        var result = this.getter(); // 渲染页面要取值，get方法

        popTarget();
        return result;
      }
    }, {
      key: "update",
      value: function update() {
        // 不要每次都调用get方法，get方法会非常消耗性能
        queueWatcher(this); // this.get() // 重新渲染
      }
    }, {
      key: "run",
      value: function run() {
        // 再一次取值，为修改之后的
        var newValue = this.get(); // 第一次取值之后保留的

        var oldValue = this.value;
        this.value = newValue;

        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this);
        }
      }
    }]);

    return Watcher;
  }(); // 将需要批量更新的watcher放到一个队列中，稍后watcher执行


  var queue = [];
  var has = {};
  var pending = false;

  function flushSchedulerQueue() {
    queue.forEach(function (watcher) {
      watcher.run();

      if (!watcher.user) {
        watcher.cb();
      }
    });
    queue = [];
    has = {};
    pending = false;
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (has[id] == null) {
      queue.push(watcher);
      has[id] = true; // 等待所有代码同步完毕后执行

      if (!pending) {
        // 防抖处理
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) {
      initWatch(vm);
    }
  }

  function initData(vm) {
    var data = vm.$options.data;
    vm._data = data = typeof data == 'function' ? data.call(vm) : data; // 数据的劫持方案 对象Object.defineProperty
    // 数组 单独处理
    // 当从vm上取值时，将属性代理到vm._data上面
    // 对vm做代理

    for (var key in data) {
      proxy(vm, '_data', key);
    }

    observe(data);
  }

  function initWatch(vm) {
    var watch = vm.$options.watch;

    var _loop = function _loop(key) {
      var handler = watch[key];

      if (Array.isArray(handler)) {
        handler.forEach(function (handle) {
          createWatcher(vm, key, handle);
        });
      } else {
        createWatcher(vm, key, handler); // 对象 字符串 函数
      }
    };

    for (var key in watch) {
      _loop(key);
    }
  }

  function createWatcher(vm, exprOrFn, handler, options) {
    // options可以用来标识用户watcher
    if (_typeof(handler) == 'object') {
      options = handler;
      handler = handler.handler;
    }

    if (typeof handler == 'string') {
      handler = vm.$options.methods[handler];
    } // key handler options


    return vm.$watch(exprOrFn, handler, options);
  }

  function stateMixin(Vue) {
    Vue.prototype.$nextTick = function (cb) {
      nextTick(cb);
    };

    Vue.prototype.$watch = function (exprOrFn, cb, options) {
      // 数据应该依赖这个watcher 数据变化后应该让这个watcher重新执行
      new Watcher(this, exprOrFn, cb, _objectSpread2(_objectSpread2({}, options), {}, {
        user: true
      }));

      if (options && options.immediate) {
        cb();
      }
    };
  }

  // let ast = {
  //     tag: "div",
  //     parent: null,
  //     type: 1,
  //     attrs: [],
  //     children: [{
  //         tag: null,
  //         parent: "parent div",
  //         attrs: [],
  //         text: "hello {{name}}"
  //     },{
  //
  //     }]
  // }
  // <div id="app">hello {{name}} <span>world</span></div>
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // abc-aaa 匹配标签名
  // ?:匹配不捕获

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // <aaa:asdads>

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >  <div>
  // 通过树和栈

  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      // 标签名
      type: 1,
      // 元素类型
      children: [],
      // 孩子列表
      attrs: attrs,
      // 属性集合
      parent: null // 父元素

    };
  } // 因为效率很低， 所以在开发部署的时候打包为最终的代码


  function parseHTML(html) {
    var root;
    var currentParent;
    var stack = []; // 检验标签是否符合规则

    function start(tagName, attrs) {
      var element = createASTElement(tagName, attrs);

      if (!root) {
        root = element;
      }

      currentParent = element;
      stack.push(element);
    }

    function end(tagName) {
      // 结尾标签处创建父子关系
      var element = stack.pop();
      currentParent = stack[stack.length - 1];

      if (currentParent) {
        // 在闭合时可以知道这个标签的父标签
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    }

    function chars(text) {
      text = text.trim();

      if (text) {
        currentParent.children.push({
          type: 3,
          text: text
        });
      }
    }

    while (html) {
      var textEnd = html.indexOf('<');

      if (textEnd === 0) {
        // this is a tag, not a text
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        } //TODO: v-bind ... <!DOCTYPE <!---> <br/>

      } // text


      var text = void 0;

      if (textEnd > 0) {
        text = html.substring(0, textEnd);
        advance(text.length);
        chars(text);
      }
    }

    function advance(n) {
      // sub string
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); // delete start tag
        // is end tag

        var _end;

        var attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length);
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }
    }

    return root;
  }

  // <div id="app" style="color: red"> hello {{name}} <span>hello</span></div>
  // render(){
  //  return _c('div', {id: 'app', style: {color: 'red'}}, _v('hello' + _s(name)), _c('span', null, _v('hello')))
  // }
  // 元素 _c(tagName, attrs, element...)
  // 文本 _v(text)
  // 变量 _s(valueName)
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{}}
  // name: "id"
  // value: "app"

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          var obj = {};
          attr.value.replace(/\s/g, '').split(";").forEach(function (item) {
            var _item$split = item.split(":"),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(node) {
    if (node.type === 1) return generate(node);else {
      var text = node.text; // normal text
      // _v("hello {{name}}") => _v('hello ' + _s(name))

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")"); // 需要对{{}}处理
      }

      var tokens = []; // 存放每一段代码

      var lasIndex = defaultTagRE.lastIndex = 0; // 如果正则是全局模式，需要每次使用前置为0

      var match, index; // 每次匹配到的结果

      while (match = defaultTagRE.exec(text)) {
        index = match.index; // 保存匹配到的索引

        if (index > lasIndex) {
          tokens.push(JSON.stringify(text.slice(lasIndex, index)));
        }

        tokens.push("_s(".concat(match[1].trim(), ")"));
        lasIndex = index + match[0].length;
      }

      if (lasIndex < text.length) tokens.push(JSON.stringify(text.slice(lasIndex)));
      return "_v(".concat(tokens.join('+'), ")");
    }
  }

  function getChildren(el) {
    var children = el.children;

    if (children) {
      // 将所有转化后的child用,拼接
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }

  function generate(el) {
    var children = getChildren(el);
    var code = "_c('".concat(el.tag, "', ").concat(el.attrs.length ? "".concat(genProps(el.attrs)) : 'undefined').concat(children ? ",".concat(children) : '', ")");
    return code;
  }

  function compilerToFunctions(template) {
    // html template => render
    // use ast to describe language, use ast product code
    // virtual dom can describe grammar, but ast describe structure
    // html -> ast -> render
    // 1. html -> ats
    var ast = parseHTML(template);
    console.log(ast); // 2. 优化静态节点
    // 3. 通过这棵树，重新生成代码 -> render

    var code = generate(ast); // 4. 将字符串变为函数
    // 通过with来限制取值范围，当调用时，能保证取到值

    var render = new Function("with(this){return ".concat(code, "}"));
    return render;
  }

  function patch(oldVnode, vnode) {
    // 默认初始化时 直接用虚拟节点创建出真实节点 替换掉老节点
    if (oldVnode.nodeType === 1) {
      // 将虚拟节点转化为真实节点
      console.log(oldVnode, vnode);
      var el = createElm(vnode); // #app

      var parentElm = oldVnode.parentNode; // nextSibling下一个兄弟节点

      parentElm.insertBefore(el, oldVnode.nextSibling); // 将当前真实元素插入到app后面

      parentElm.removeChild(oldVnode);
      return el;
    } else {
      // 在更新时 拿老虚拟节点和新的虚拟节点做对比 将不同的地方更新真实的dom
      // 既有渲染功能 也有更新功能
      // 1. 比较两个元素的标签 标签不一样直接替换掉即可
      if (oldVnode.tag !== vnode.tag) {
        return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
      } // 2. 标签一样，文本节点的虚拟节点tag都为undefined
      // 文本对比


      if (!oldVnode.tag) {
        if (oldVnode.text !== vnode.text) {
          return oldVnode.el.textContent = vnode.text;
        }
      } // 3. 标签相同并且必须开始比对标签的属性和儿子
      // 标签相同最好直接复用


      var _el = vnode.el = oldVnode.el; // 复用老节点
      // 更新属性: 用新的虚拟节点的属性和老的比较


      updateProperties(vnode, oldVnode.data); // 比较孩子

      var oldChildren = oldVnode.children || [];
      var newChildren = vnode.children || []; // 老的有孩子节点 新的也有孩子节点 diff算法

      if (oldChildren.length > 0 && newChildren.length > 0) {
        updateChildren(oldChildren, newChildren, _el);
      } else if (oldChildren.length > 0) {
        // 老的有孩子节点 新的没有孩子节点
        _el.innerHTML = '';
      } else if (newChildren.length > 0) {
        // 老的没有孩子节点 新的有孩子节点
        for (var i = 0; i < newChildren.length; i++) {
          var child = newChildren[i]; // 浏览器存在性能优化，不需要处理文档碎片

          _el.appendChild(createElm(child));
        }
      }

      return _el;
    }
  } // 儿子间的比较

  function updateChildren(oldChildren, newChildren, parent) {
    // vue中的diff算法做了很多优化
    // dom中操作有很多常见的逻辑 将节点插入到孩子的头部、尾部、儿子倒叙正序
    // vue2中采用的是双指针的方式
    // 在尾部添加
    // 4指针 比较
    var oldStartIndex = 0;
    var oldStartVnode = oldChildren[oldStartIndex];
    var oldEndIndex = oldChildren.length - 1;
    var oldEndVnode = oldChildren[oldEndIndex];
    var newStartIndex = 0;
    var newStartVnode = newChildren[newStartIndex];
    var newEndIndex = newChildren.length - 1;
    var newEndVnode = newChildren[newEndIndex]; // 比较谁先循环完毕 停止

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // oldStartIndex newStartIndex 如果两个是相同元素 对比孩子节点
      if (isSameVnode(oldStartVnode, newStartVnode)) {
        patch(oldStartVnode, newStartVnode); // 更新属性 递归更新子节点

        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        patch(oldEndVnode, newEndVnode);
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
      } // 反转节点

    }

    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        // parent.appendChild(createElm(newChildren[i]))
        // 向后插入ele为null
        // 向前插入ele为当前向谁的前面插入
        var ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
        parent.insertBefore(createElm(newChildren[i]), ele);
      }
    }
  } // 标签相同 key相同 但是属性不相同是有可能的 这种情况只需要更新属性即可


  function isSameVnode(oldVnode, newVnode) {
    return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        children = vnode.children;
        vnode.key;
        vnode.data;
        var text = vnode.text;

    if (typeof tag == 'string') {
      // vnode.el可以用来更新
      vnode.el = document.createElement(tag); // 只有元素才有属性

      updateProperties(vnode);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function updateProperties(vnode) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var newProps = vnode.data || {};
    var el = vnode.el; // 老的有 新的没有 删除属性

    for (var key in oldProps) {
      if (!newProps[key]) {
        el.removeAttribute(key);
      }
    } // 新的有 直接用新的来更新
    // 样式处理 style={color: red} => style={background: red}


    var newStyle = newProps.style || {};
    var oldStyle = oldProps.style || {};

    for (var _key in oldStyle) {
      if (!newStyle[_key]) {
        el.style[_key] = '';
      }
    } // 没有的属性直接删除
    // 有的属性直接替换或增加


    for (var _key2 in newProps) {
      if (_key2 === 'style') {
        for (var styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName];
        }
      } else if (_key2 === 'class') {
        el.className = newProps["class"];
      } else {
        el.setAttribute(_key2, newProps[_key2]);
      }
    }
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this; // 用新的创建的元素替换掉原来的元素

      vm.$el = patch(vm.$el, vnode);
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el; // 调用render方法来渲染el属性
    // 先调用render方法创建虚拟节点，再将虚拟节点渲染到页面上
    // _render render => vnode
    // _update vnode render to html

    callHook(vm, 'beforeMount');

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    }; // watcher是用来渲染的
    // true表示渲染watcher


    new Watcher(vm, updateComponent, function () {
      callHook(vm, 'updated');
    }, true); // 将属性和watcher绑定在一起

    callHook(vm, 'mounted');
  } // template -> ast -> render function (transform to vnode) -> vnode -> html
  // vue渲染流程: 初始化数据 -> 初始化数据 -> 将模板编译 -> render函数 -> 生成虚拟节点 -> 生成真实dom -> html

  function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        // 保证用户生命周期里面的this为当前实例
        handlers[i].call(vm);
      }
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this; // 将用户传递的和全局的合并
      // 这个方法可能会被子组件来调用, 子组件来调用Vue不为全局，而为继承之后的

      vm.$options = mergeOptions(vm.constructor.options, options);
      callHook(vm, 'beforeCreate'); // vue里面核心特征，响应式数据原理
      // 初始化状态

      initState(vm);
      callHook(vm, 'created'); // 渲染逻辑 el === vm.$mount() 最终$mount来挂载

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var options = vm.$options;

      if (!options.render) {
        // no render, template to render
        var template = options.template; // no render and has el, use el

        if (!template && el) {
          template = el.outerHTML;
        } // compile template (from origin template or el)


        var render = compilerToFunctions(template); // finally use render

        options.render = render;
      } // has render
      // 需要挂载组件


      mountComponent(vm, el);
    };
  }

  function renderMixin(Vue) {
    // 虚拟节点，用对象来描述dom
    Vue.prototype._c = function () {
      // 创建元素
      return createElement.apply(void 0, arguments);
    };

    Vue.prototype._s = function (val) {
      // stringify
      // JSON.stringify(val)会导致所有元素节点进行依赖收集
      return val == null ? '' : _typeof(val) === 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._v = function (text) {
      // 创建文本元素
      return createTextVnode(text);
    };

    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm);
      return vnode;
    };
  } //  return _c('div', {id: 'app', style: {color: 'red'}}, _v('hello' + _s(name)), _c('span', null, _v('hello')))

  function createElement(tag) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    return vnode(tag, data, data.key, children, undefined);
  }

  function createTextVnode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
  } // 操作正式dom消耗性能，vnode可以只更新不同，复用相同


  function vnode(tag, data, key, children, text) {
    // ast不用自定义属性
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text // componentsInstance: ''
      // 可以自定义描述对象

    };
  }

  function initGlobalAPI(Vue) {
    Vue.options = {};

    Vue.mixin = function (mixin) {
      // 如何实现两个对象的合并
      this.options = mergeOptions(this.options, mixin);
    }; // 生命周期的合并策略
    // 生命周期必须合并为一个数组，而不是覆盖

  }

  function Vue(options) {
    this._init(options); //入口方法，做初始化操作

  } // 写成一个个插件进行原型扩展


  initMixin(Vue);
  lifecycleMixin(Vue); // 混合生命周期

  renderMixin(Vue);
  stateMixin(Vue); // 初始化全局API

  initGlobalAPI(Vue); // differ算法测试
  var vm1 = new Vue({
    data: {
      name: "vm1---"
    }
  });
  var render1 = compilerToFunctions("<div>\n    <li key=\"A\" style=\"background-color: aquamarine\">A</li>\n    <li key=\"B\" style=\"background-color: red\">B</li>\n    <li key=\"C\" style=\"background-color: blue\">C</li>\n</div>");
  var vnode1 = render1.call(vm1);
  document.body.appendChild(createElm(vnode1));
  var vm2 = new Vue({
    data: {
      name: "vm2---"
    }
  });
  var render2 = compilerToFunctions("<div>\n    <li key=\"E\" style=\"background-color: green\">D</li>\n    <li key=\"A\" style=\"background-color: yellow\">F</li>\n    <li key=\"B\" style=\"background-color: red\">B</li>\n    <li key=\"C\" style=\"background-color: blue\">C</li>\n</div>");
  var vnode2 = render2.call(vm2);
  setTimeout(function () {
    patch(vnode1, vnode2);
  }, 3000);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
