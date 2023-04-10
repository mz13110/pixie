class State {
    log = customLogger("State")
    data = {}
    listeners = {}

    constructor(namespace) {
        if(typeof namespace === "string") this.log = customLogger(namespace)
    }

    set(k, v) {
        if(!typeof k === "string") throw `Entry keys must be a string, got ${typeof v}.`
        if(!["object", "number", "string", "boolean"].includes(typeof v)) throw `Entry values must be an object, array, number, string, boolean, or null, got ${typeof v}.`

        this.log("𝘀𝗲𝘁", k, "=", v)

        k = k.toLowerCase()
        let o = this.data
        for(let dir of k.split(".").slice(0, -1)) {
            if(!o[dir]) o = (o[dir] = {})
            else o = o[dir]
        }

        o[k.split(".").slice(-1)] = Object.freeze(JSON.parse(JSON.stringify(v)))

        for(let [t, cb] of Object.entries(this.listeners)) {
            if(k.startsWith(t)) {
                v = this.get(t)
                cb.map((f)=>f(v))
            }
        }
    }
    get(k, d) {
        this.log("𝗴𝗲𝘁", k)
        k = k.toLowerCase()
        let o = this.data
        for(let dir of k.split(".").slice(0, -1)) {
            if(typeof o !== "object") return d
            o = o[dir]
        }
        if(typeof o !== "object") return d
        return o[k.split(".").slice(-1)] ?? d
    }

    sub(k, cb) {
        if(!Array.isArray(k)) k = [k]
        k.map((t) => {
            if(this.listeners[t]) this.listeners[t].push(cb)
            else this.listeners[t] = [cb]
        })
    }

    import(raw) {
        this.data = JSON.parse(raw)
    }
    export() {
        return JSON.stringify(this.data)
    }
}