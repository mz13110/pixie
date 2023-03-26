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
        this.$sr.innerHTML = `
        <div class="container"></div>`
        getCSS("base").then((css)=>this.$sr.appendChild(css))
        getCSS("toolinfo").then((css)=>this.$sr.appendChild(css))

        this.$container = this.$sr.querySelector(".container")
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
                    let $ = document.createElement("px-slider")
                    $.classList.add("slider")
                    $.name = i.name
                    $.min = i.min ?? 0
                    $.max = i.max ?? 100
                    $.step = i.step ?? 1
                    $.value = this.tool.getProp(k) ?? i.default

                    $.oninput = () => this.tool.setProp(k, $.value)
                    this.$container.appendChild($)
            }
        }
    }

    get $sr() {
        return this.shadowRoot
    }
}
customElements.define("px-tool-info", ToolInfoElement)