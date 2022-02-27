let id = 0;
class Dep { // 收集模板中的{{}}对应的watcher
    constructor() {
        // watcher去重
        this.subs = []
        this.id = id ++
    }

    // 渲染时调用收集依赖，一个渲染位对应一个dep
    depend() {
        // this.subs.push(Dep.target) // 这样出现多个{{name}}时，会保存多次，更新name时会重复渲染多次
        Dep.target.addDep(this)
    }

    addSub(watcher){
        this.subs.push(watcher)
    }

    notify(){
        this.subs.forEach(watcher => watcher.update())
    }
}

// 多对多大关系 一个属性有一个dep是用来收集watcher的
// dep可以存多个watcher vm.$watch('name')
// 一个watcher可以对应多个dep

Dep.target = null;

export function pushTarget(watcher){
    Dep.target = watcher
}

export function popTarget(){
    Dep.target = null // 渲染完成后将target删除
}

export default Dep
