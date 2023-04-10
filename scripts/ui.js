class UI {
    static #stack = []

    static get stack() {
        return Array.clone(this.#stack)
    }

    static get $() {
        return document.body
    }

    static pushModal(modal) {
        this.$.appendChild(modal)
        this.#stack.push(modal)
    }
}