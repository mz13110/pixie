class ToolboxElement extends HTMLElement {
    #selection = "pencil"

    set selection(v) {GlobalState.set("toolbox.selection", v)}
    get selection() {return this.#selection}

    constructor() {
        super()

        this.attachShadow({mode: "open"})
        this.sr.innerHTML = `
        <link rel="stylesheet" href="/styles/base.css" />
        <link rel="stylesheet" href="/styles/toolbox.css" />

        <div class="container">
            <div class="tools"></div>
        </div>`

        GlobalState.sub("toolbox.selection", (v) => {this.#selection = v; this.onSelectionChanged()})

        this.$tools = this.sr.querySelector(".tools")

        ToolRegistry.sub(this.onToolAdded)
        ToolRegistry.tools.map((t)=>this.onToolAdded(t))
    }

    onToolAdded(tool) {
        let e = document.createElement("div")
        e.classList.add("button", "tool")
        e.dataset.id = tool.id
        e.innerHTML = `
        <box-icon type="${iconClass2Type(tool.icon)}" name="${iconClass2Name(tool.icon)}" color="#ffffff"></box-icon>`
        e.onclick = () => {
            this.selection = e.dataset.id
        }

        this.$tools.appendChild(e)

        this.onSelectionChanged()
    }

    onSelectionChanged() {
        this.$tools.querySelectorAll(`*[data-selected="true"]`).forEach((e) => e.dataset.selected = false)
        this.$tools.querySelectorAll(`*[data-id="${this.selection}"]`).forEach((e) => e.dataset.selected = true)
    }

    get sr() {
        return this.shadowRoot
    }
}

customElements.define("px-toolbox", ToolboxElement)