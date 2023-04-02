class ToolboxElement extends HTMLElement {
    #selection = "pencil"

    set selection(v) {GlobalState.set("toolbox.selection", v)}
    get selection() {return this.#selection}

    constructor() {
        super()

        this.attachShadow({mode: "open"})
        this.$sr.innerHTML = `
        <div class="container">
            <div class="tools"></div>
        </div>`
        getCSS("base").then((css)=>this.$sr.appendChild(css))
        getCSS("components/toolbox").then((css)=>this.$sr.appendChild(css))

        GlobalState.sub("toolbox.selection", (v) => {this.#selection = v; this.onSelectionChanged()})

        this.$tools = this.$sr.querySelector(".tools")

        ToolRegistry.sub(this.onToolAdded)
        ToolRegistry.tools.map((t)=>this.onToolAdded(t))
    }

    onToolAdded(tool) {
        let $ = document.createElement("div")
        $.classList.add("button", "tool")
        $.dataset.id = tool.id
        $.appendChild(iconClass2Icon(tool.icon, "#ffffff"))
        $.onclick = () => {
            this.selection = $.dataset.id
        }

        this.$tools.appendChild($)

        this.onSelectionChanged()
    }

    onSelectionChanged() {
        this.$tools.querySelectorAll(`*[data-selected="true"]`).forEach((e) => e.dataset.selected = false)
        this.$tools.querySelectorAll(`*[data-id="${this.selection}"]`).forEach((e) => e.dataset.selected = true)
    }

    get $sr() {
        return this.shadowRoot
    }
}

customElements.define("px-toolbox", ToolboxElement)