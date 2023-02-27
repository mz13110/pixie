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
                    let c = document.createElement("div")
                    c.classList.add("prop")

                    let e = document.createElement("div")
                    e.classList.add("label")
                    e.innerText = i.name
                    c.appendChild(e)

                    e = document.createElement("input", {is: "px-slider"})
                    e.classList.add("slider")
                    e.type = "range"
                    e.min = i.min === -Infinity ? -100 : (i.min ?? -100)
                    e.max = i.max === Infinity ? 100 : (i.max ?? 100)
                    e.step = i.step ?? 1
                    c.appendChild(e)

                    this.$container.appendChild(c)
            }
        }
    }

    get sr() {
        return this.shadowRoot
    }
}
customElements.define("px-tool-info", ToolInfoElement)