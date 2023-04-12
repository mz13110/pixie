customLogger = ()=>console.debug
class State {
    log = customLogger("State")
    data = {}
    defaults = {}
    listeners = {}

    constructor(namespace) {
        if(typeof namespace === "string") this.log = customLogger(namespace)
    }

    set(k, v) {
        if(!typeof k === "string") throw `Entry keys must be a string, got ${typeof v}.`
        if(!["object", "number", "string", "boolean"].includes(typeof v)) throw `Entry values must be an object, array, number, string, boolean, or null, got ${typeof v}.`

        this.log("set", k, "=", v)


        k = k.toLowerCase()
        let o = this.data
        for(let dir of k.split(".").slice(0, -1)) {
            if(typeof o === "object" && dir in o) o[dir]
            else o = o = (o[dir] = {})
        }

        v = JSON.parse(JSON.stringify(v))
        o[k.split(".").slice(-1)] = v

        console.log("bruh", this.data)

        for(let [t, cb] of Object.entries(this.listeners)) {
            if(k.startsWith(t)) cb.map((f)=>f(v))
        }
    }
    setDefault(k, v) {
        if(!typeof k === "string") throw `Entry keys must be a string, got ${typeof v}.`
        if(!["object", "number", "string", "boolean"].includes(typeof v)) throw `Entry values must be an object, array, number, string, boolean, or null, got ${typeof v}.`

        this.log("default", k, "=", v)

        let t = false // whether or not to trigger listeners

        k = k.toLowerCase()
        let o = this.defaults
        let od = this.data
        let dir
        for(dir of k.split(".").slice(0, -1)) {
            if(dir in o) {
                o = o[dir]
                if(t === false) od = od[dir]
            }
            else o = (o[dir] = {})

            if(typeof od === "object" && !(dir in od)) t = true
        }

        dir = k.split(".").pop()
        if(t === false && typeof od === "object" && !(dir in od)) t = true
        v = JSON.parse(JSON.stringify(v))
        o[dir] = v

        if(t) {
            for(let [t, cb] of Object.entries(this.listeners)) {
                if(k.startsWith(t)) cb.map((f)=>f(v))
            }
        }
    }
    get(k) {
        this.log("get", k)

        let d = this.getDefault(k)
        k = k.toLowerCase()
        let o = this.data
        for(let dir of k.split(".")) {
            if(dir in o) o = o[dir]
            else return d
        }
        return (typeof d === "object" && typeof o === "object") ? Object.assign(d, JSON.parse(JSON.stringify(o))) : JSON.parse(JSON.stringify(o))
    }
    getDefault(k, d) {
        this.log("get default", k)

        k = k.toLowerCase()
        let o = this.defaults
        for(let dir of k.split(".")) {
            if(dir in o) o = o[dir]
            else return d
        }
        return JSON.parse(JSON.stringify(o))
    }
    has(k) {
        k = k.toLowerCase()
        let o = this.data
        for(let dir of k.split(".")) {
            if(dir in o) o = o[dir]
            else return false
        }
        return true
    }

    sub(k, cb, t) {
        if(this.listeners[k]) this.listeners[k].push(cb)
        else this.listeners[k] = [cb]

        if((t ?? true) === true) cb(this.get(k))
    }

    import(raw) {
        this.data = JSON.parse(raw)
    }
    export() {
        return JSON.stringify(this.data)
    }
}

let s = new State()
s.setDefault("a.b", {a: 1, b: 1, c: 1})
s.set("a.b.a", 2)
console.log("a.b =", s.get("a.b"))