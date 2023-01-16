class GlobalState {
    static data = {}
    static listeners = {}

    static set(k, v) {
        k = k.toLowerCase()
        let o = GlobalState.data
        for(let dir of k.split(".").slice(0, -1)) {
            if(!o[dir]) o = (o[dir] = {})
            else o = o[dir]
        }
        o[k.split(".").slice(-1)] = v

        for(let [t, cb] of Object.entries(this.listeners)) {
            if(k.startsWith(t)) {
                v = this.get(t)
                cb.map((f)=>f(v))
            }
        }
    }
    static get(k) {
        k = k.toLowerCase()
        let o = GlobalState.data
        for(let dir of k.split(".").slice(0, -1)) o = o[dir]
        return o[k.split(".").slice(-1)]
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