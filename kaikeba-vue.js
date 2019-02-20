
class Dep{
    constructor(){
        this.deps = []
    }
    addDep(dep){
        this.deps.push(dep)
    }
    notify(){
        this.deps.forEach(dep=>{
            dep.update()
        })
    }
}

Dep.target = null

class Watcher{
    constructor(vm,key,cb){
        this.vm = vm
        this.cb =cb
        this.key = key
        this.value = this.get()
    }
    get(){
        Dep.target = this
        let value =this.vm[this.key]
        Dep.target = null
        return value
    }
    update(){
        this.value = this.get()
        this.cb.call(this.vm, this.value)
        console.log('试图更新--监听器收到')
    }
}

class KVue{
    constructor(options){
        this.$options = options
        this.$data = options.data
        this.observer(this.$data)
       // new Watcher()
        console.log("触发get name",this,name)
        this.$compile = new Compile(options.el,this)
    }
    observer(data){
        Object.keys(data).forEach(key=>{
            this.proxyData(key)
            this.defineReactive(data,key,data[key])
        })
    }
    defineReactive(obj,key,val){
        const dep = new Dep();
        Object.defineProperty(obj,key,{
            get(){
                Dep.target && dep.addDep(Dep.target)
                console.log('get 收集依赖')
                return val
            },
            set(newVal){
                val = newVal
                dep.notify()
                console.log('set 通知依赖更新')
            }
        })
    }
    proxyData(key){
        Object.defineProperty(this,key,{
            get(){
                console.log("proxy")

                return this.$data[key]
            },
            set(val){
                this.$data[key] = val
            }
        })
    }
}

