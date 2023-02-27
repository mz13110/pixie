class ToolInfoElement extends HTMLElement {
    #tool = ""
    get tool() {return this.#tool}
    set tool(v) {this.#tool = v; this.onToolChanged()}

    #$section
    set $section(v) {this.#$section = v; this.onToolChanged()}
    get $section() {return this.#$section}

    get $sectionHeader() {return this.$section.querySelector(".section-header")}
    get $sectionHeaderIcon() {return this.$section.querySelector(".section-header-icon")}
    get $sectionHeaderTitle() {return this.$section.querySelector(".section-header-title")}

    constructor() {
        super()

        this.attachShadow({
            mode: "open"
        })
        this.sr.innerHTML = `
        <link rel="stylesheet" href="/styles/base.css" />
        <link rel="stylesheet" href="/styles/toolinfo.css" />
        <div class="container"></div>`

        this.$container = this.sr.querySelector(".container")
    }

    onToolChanged() {
        if(this.$section) {
            this.$sectionHeaderIcon.className = `section-header-icon bx ${this.tool.icon}`
            this.$sectionHeaderTitle.innerText = this.tool.name
        }

        this.$container.innerHTML = ""
        for(let [k, i] of Object.entries(this.tool.schema)) {
            switch(i.type) {
                case "slider":
                    let e = document.createElement("px-slider")
                    e.classList.add("slider")
                    e.name = i.name
                    e.min = i.min ?? 0
                    e.max = i.max ?? 100
                    e.step = i.step ?? 1
                    e.value = i.default

                    e.oninput = () => this.tool.setProp(k, e.value)
                    this.$container.appendChild(e)
            }
        }
    }

    get sr() {
        return this.shadowRoot
    }
}
customElements.define("px-tool-info", ToolInfoElement)