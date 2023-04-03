class Modal extends HTMLElement {
    #title = ""
    get title() {
        return this.#title
    }
    set title(v) {
        this.#title = v
        this.onTitleChanged()
    }

    constructor() {
        super()

        this.attachShadow({mode: "open"})
        this.$sr.innerHTML = `<div class="container"><div class="content"></div></div><slot name="content"></slot>`
        getCSS("base").then((css)=>this.$sr.appendChild(css))
        getCSS("components/modal").then((css)=>this.$sr.appendChild(css))

        this.$slot = this.$sr.querySelector("slot")
        this.$container = this.$sr.querySelector(".container")
        this.$content = this.$sr.querySelector(".content")

        this.$content.attachShadow({mode: "open"})
        this.$ = this.$content.shadowRoot
        getCSS("base").then((css)=>this.$.appendChild(css))

        this.$slot.onslotchange = () => {
            for(let $ of this.$slot.assignedElements()) {
                if(!$ instanceof HTMLTemplateElement) throw "only templates allowed"

                this.$.appendChild($.content)
                $.remove()
            }
        }
    }

    onTitleChanged() {
        
    }

    get $sr() {
        return this.shadowRoot
    }
}
customElements.define("px-modal", Modal)