class Modal extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({mode: "open"})
        this.$sr.innerHTML = `<div class="container"><div class="content"></div></div><slot name="content"></slot>`
        getCSS("base").then((css)=>this.$sr.appendChild(css))
        getCSS("modal/modal").then((css)=>this.$sr.appendChild(css))

        this.$slot = this.$sr.querySelector("slot")
        this.$container = this.$sr.querySelector(".container")
        this.$content = this.$sr.querySelector(".content")

        this.$content.attachShadow({mode: "open"})
        this.$ = document.createElement("div")
        this.$.classList.add("container")
        this.$content.shadowRoot.appendChild(this.$)

        getCSS("base").then((css)=>this.$content.shadowRoot.appendChild(css))
        getCSS("modal/content").then((css)=>this.$content.shadowRoot.appendChild(css))

        this.$slot.onslotchange = () => {
            for(let $ of this.$slot.assignedElements()) {
                if(!$ instanceof HTMLTemplateElement) throw "only templates allowed"

                this.$.appendChild($.content)
                $.remove()
            }
        }
    }

    get $sr() {
        return this.shadowRoot
    }
}
customElements.define("px-modal", Modal)