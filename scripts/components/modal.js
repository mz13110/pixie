class ModalContent extends HTMLTemplateElement {
    constructor() {
        super()
    }
}
customElements.define("px-modal-content", ModalContent, {extends: "template"})

class Modal extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({mode: "open"})
        this.$sr.innerHTML = `<div class="container"><div class="content"></div></div><slot name="content"></slot>`
        
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

    get $sr() {
        return this.shadowRoot
    }
}
customElements.define("px-modal", Modal)

class Dialog extends Modal {

}
customElements.define("px-dialog", Dialog)