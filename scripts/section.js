class SectionElement extends HTMLElement {
    static get observedAttributes() {
        return ["data-name", "data-icon"]
    }
}
customElements.define("px-section", SectionElement)

class SectionActionElement extends HTMLElement {
    static get observedAttributes() {
        return ["data-icon", "data-active"]
    }
}
customElements.define("px-section-action", SectionActionElement)