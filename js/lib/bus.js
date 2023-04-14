class Bus {
    log = customLogger("Bus")
    pubsub = {}
    calldef = {}

    constructor(namespace) {
        if(typeof namespace === "string") this.log = customLogger(namespace)
    }

    // pub/sub (one to many; read only)
    pub(e, d, o) {
        e = e.toLowerCase()
        o = Object.assign({cancelable: true}, typeof o === "object" ? o : {})

        this.log("pub", e)

        let ev = {event: e, cancelable: o.cancelable}
        if(d !== undefined) ev.data = d
        if(o.cancelable) {
            ev.canceled = false
            ev.cancel = () => {ev.canceled = true}
        }

        if(e in this.pubsub) {
            this.pubsub[e].map((f)=>f(ev))
        }
    }
    sub(e, cb) {
        e = e.toLowerCase()
        if(e in this.pubsub) this.pubsub.push(cb)
        else this.pubsub[e] = [cb]
    }

    // call/response (one to one; can respond with data)
    call(e, d, o) {
        e = e.toLowerCase()
        o = Object.assign({}, typeof o === "object" ? o : {})

        this.log("call", e)

        let ev = {event: e}
        if(d !== undefined) ev.data = d

        if(e in this.calldef) return this.calldef[e](ev)
        else throw `no handler for ${e}`
    }
    def(e, cb) {
        e = e.toLowerCase()
        if(e in this.calldef) throw `handler for ${e} is already defined`

        this.calldef[e] = cb
    }
}