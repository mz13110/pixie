class ViewportElement extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({mode: "open"})
        
        this.$sr.innerHTML = `
            <div class="container">
                <div class="menu">
                    <div class="zoom">
                    </div>
                    <div class="reset">
                        <box-icon name="reset" color="#ffffff"></box-icon>
                    </div>
                    <div class="zoom-in">
                        <box-icon name="zoom-in" color="#ffffff"></box-icon>
                    </div>
                    <div class="zoom-out">
                        <box-icon name="zoom-out" color="#ffffff"></box-icon>
                    </div>
                </div>
                <div class="main">
                    <px-canvas></px-canvas>
                </div>
            </div>
        `
        getCSS("base").then((css)=>this.$sr.appendChild(css))
        getCSS("components/viewport").then((css)=>this.$sr.appendChild(css))

        this.$main = this.$sr.querySelector(".main")
        this.$canvas = this.$sr.querySelector("px-canvas")

        this.$menu = this.$sr.querySelector(".menu")
    }

    get $sr() {
        return this.shadowRoot
    }
}
customElements.define("px-viewport", ViewportElement)