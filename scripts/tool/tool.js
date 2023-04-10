class Tool {
    #name = ""
    #id = ""
    #icon = "wrench"

    #props = []

    get name() {return this.#name}
    get id() {return this.#id}
    get icon() {return this.#icon}

    get props() {return this.#props}
    set props(v) {Editor.state.set(`tools.${this.id}`, v)}

    constructor(name, id, icon, schema) {
        this.#name = name ?? "untitled tool"
        this.#id = id ?? [...Array(16)].map(()=>Math.floor(Math.random()*16).toString(16)).join("")
        this.#icon = icon ?? "bxs-wrench"

        this.schema = schema ?? {}
        for(let [k, i] of Object.entries(this.schema)) {
            this.setProp(`tools.${this.id}.${k}`, Editor.state.get(`tools.${this.id}.${k}`) ?? i.default)
        }

        Editor.state.sub(`tools.${this.id}`, (v) => {this.#props = v; this.onPropsChanged()})
    }

    setProp(k, v) {
        Editor.state.set(`tools.${this.id}.${k}`, v)
    }
    getProp(k) {
        return this.props[k]
    }

    onPropsChanged() {}

    onDown(c, x, y) {}
    onMove(c, x, y) {}
    onUp(c, x, y) {}
}

class ToolRegistry {
    static listeners = []
    static tools = []

    static add(...tools) {
        this.tools.push(...tools)
        for(let l of this.listeners) {
            tools.map((t)=>l(t))
        }
    }

    static sub(listener) {
        this.listeners.push(listener)
    }

    static get(id) {
        return this.tools.find((tool) => tool.id === id)
    }
}