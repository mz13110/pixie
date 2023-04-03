class Dialog extends Modal {
    constructor() {
        super()

        getCSS("components/dialog").then((css)=>this.$sr.appendChild(css))

        this.$dialog = document.createElement("div")
        this.$dialog.classList.add("dialog")
        this.$dialog.innerHTML = `
            <div class="header">
                <div class="title"></div>
                <div class="close"><box-icon name="x"></box-icon></div>
            </div>
        `
        this.$dialog.appendChild(this.$content)
        this.$container.appendChild(this.$dialog)
    }
}
customElements.define("px-dialog", Dialog)