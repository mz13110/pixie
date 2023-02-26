class Tool {
    #name = ""
    #id = ""
    #icon = "wrench"

    #props = []

    get name() {return this.#name}
    get id() {return this.#id}
    get icon() {return this.#icon}

    get props() {return this.#props}
    set props(v) {GlobalState.set(`tools.${this.id}`, v)}

    constructor(name, id, icon, props) {
        this.#name = name
        this.#id = id
        this.#icon = icon

        this.props = Object.assign(structuredClone(GlobalState.get(`tools.${this.id}`, {})), props)

        GlobalState.sub(`tools.${this.id}`, (v) => {this.#props = v; this.onPropsChanged()})
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