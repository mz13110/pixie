let log = customLogger("GlobalState")

class GlobalState {
    static data = {}
    static listeners = {}

    static set(k, v) {
        if(!typeof k === "string") throw `Entry keys must be a string, got ${typeof v}.`
        if(!["object", "number", "string", "boolean"].includes(typeof v)) throw `Entry values must be an object, array, number, string, boolean, or null, got ${typeof v}.`

        log("𝘀𝗲𝘁", k, "=", v)

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
    static get(k, d) {
        log("𝗴𝗲𝘁", k)
        k = k.toLowerCase()
        let o = this.data
        for(let dir of k.split(".").slice(0, -1)) {
            if(typeof o !== "object") return d
            o = o[dir]
        }
        if(typeof o !== "object") return d
        return o[k.split(".").slice(-1)] ?? d
    }

    static sub(k, cb) {
        if(!Array.isArray(k)) k = [k]
        k.map((t) => {
            if(this.listeners[t]) this.listeners[t].push(cb)
            else this.listeners[t] = [cb]
        })
    }

    static import(raw) {
        this.data = JSON.parse(raw)
    }
    static export() {
        return JSON.stringify(this.data)
    }
}