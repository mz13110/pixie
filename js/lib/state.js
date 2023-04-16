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
            if(typeof o === "object" && dir in o) o = o[dir]
            else o = o = (o[dir] = {})
        }

        if(o[k.split(".").pop()] === v) return

        v = JSON.parse(JSON.stringify(v))
        o[k.split(".").pop()] = v

        for(let [t, cb] of Object.entries(this.listeners)) {
            if(k === t || k.startsWith(t + ".")) cb.map((f)=>f(this.get(t)))
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
            if(dir in o) o = o[dir]
            else o = (o[dir] = {})

            if(typeof od === "object" && !(dir in od)) t = true
        }

        dir = k.split(".").pop()
        if(t === false && typeof od === "object" && !(dir in od)) t = true
        v = JSON.parse(JSON.stringify(v))
        o[dir] = v

        if(t) {
            for(let [t, cb] of Object.entries(this.listeners)) {
                if(k.startsWith(t)) cb.map((f)=>f(this.getDefault(t)))
            }
        }
    }
    get(k) {
        //this.log("get", k)

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
        //this.log("get default", k)

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

        for(let [t, cb] of Object.entries(this.listeners)) cb.map((f)=>f(this.get(t)))
    }
    load(raw) {
        this.data = JSON.parse(raw)

        for(let [t, cb] of Object.entries(this.listeners)) cb.map((f)=>f(this.get(t)))
    }
    export() {
        return JSON.stringify(this.data)
    }
}