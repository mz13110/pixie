class FileManagerElement extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({mode: "open"})

        this.$sr.innerHTML = `
        `
    }

    get $sr() {
        return this.shadowRoot
    }
}
customElements.define("px-file-manager", FileManagerElement)