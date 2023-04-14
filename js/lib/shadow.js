class ShadowDOMElement extends HTMLTemplateElement {

}
customElements.define("shadow-dom", ShadowDOMElement, {extends: "template"})