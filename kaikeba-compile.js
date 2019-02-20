class Compile{
    constructor(el, vm){
        this.$el = document.querySelector(el)
        this.$vm = vm
        this.$fragment = this.nodeToFragment(this.$el)
        this.compileElement(this.$fragment)
        this.$el.appendChild(this.$fragment)
    }
    nodeToFragment(el){
        let fragment = document.createDocumentFragment()
        let child
        while (child = el.firstChild) {
            fragment.appendChild(child)
        }
        return fragment
    }
    compileElement(el){
        let childNodes = el.childNodes
        Array.from(childNodes).forEach(node=>{
            let text = node.textContent
            let reg = /\{\{(.*)\}\}/
            if (this.isElementNode(node)) {
                this.compile(node)
            }else if(this.isTextNode(node) && reg.test(text)){
                this.compileText(node,RegExp.$1)
            }
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node)
            }
        })
    }
    compile(node){
        let attrs = node.attributes
        Array.from(attrs).forEach(attr=>{
            const attrName = attr.name
            const key = attr.value
            if (this.isVueDirective(attrName)) {
                console.log('vue的变量',attrName)
                const dir = attrName.slice(2)
                if(this[dir]){
                    this[dir](node,this.$vm,key)
                }
            }
            if (this.isVueEvent(attrName)) {
                console.log('vue的事件',attrName)
                let actin = attrName.substring(1)
                this.eventHander(node,this.$vm,key,actin)
            }
        })
    }
    eventHander(node,vm,key,action){
        const fn = vm.$options.methods && vm.$options.methods[key]
        node.addEventListener(action,fn.bind(vm),false)
    }
    text(node,vm,key){
        this.update(node,vm,key,'text')
    }
    model(node,vm,key){
        this.update(node,vm,key,'model')
        node.addEventListener('input',e=>{
            const newValue = e.target.value
            vm[key] = newValue
        })
    }
    html(node,vm,key){
        this.update(node,vm,key,'html')
    }
    update(node,vm,key,dir){
        const fn = this[dir+'Updater']
        fn && fn(node,vm[key])
        new Watcher(vm,key,value=>{
            fn && fn(node,value)
        })
    }
    textUpdater(node,value){
        node.textContent= value
    }
    htmlUpdater(node,value){
        node.innerHTML= value
    }
    modelUpdater(node,value){
        node.value= value
    }
    isVueDirective(name){
        return name.indexOf('k-') == 0
    }
    isVueEvent(name){
        return name.indexOf('@') == 0
    }
    compileText(node,key){
        this.text(node,this.$vm,key)
    }
    isElementNode(node){
        return node.nodeType == 1
    }
    isTextNode(node){
        return node.nodeType == 3
    }
}