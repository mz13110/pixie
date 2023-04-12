class Dialog extends Modal {
    #name = ""
    get name() {
        return this.#name
    }
    set name(v) {
        this.#name = v
        this.onNameChanged()
    }

    #icon = ""
    get icon() {
        return this.#icon
    }
    set icon(v) {
        this.#icon = v
        this.onIconChanged()
    }

    buttons = {}
    extensions = {}

    constructor() {
        super()

        getCSS("dialog/dialog").then((css)=>this.$sr.appendChild(css))

        this.$dialog = document.createElement("div")
        this.$dialog.classList.add("dialog")
        this.$dialog.innerHTML = `
            <div class="header">
                <div class="title">
                    ${icon("", "title-icon")}
                    <div class="title-text"></div>
                </div>
                <div class="buttons"></div>
            </div>
        `
        this.$dialog.appendChild(this.$content)
        this.$container.appendChild(this.$dialog)

        getCSS("dialog/content").then((css)=>this.$.appendChild(css))

        this.$header = this.$sr.querySelector(".header")
        this.$title = this.$sr.querySelector(".title")
        this.$titleIcon = this.$sr.querySelector(".title-icon")
        this.$titleText = this.$sr.querySelector(".title-text")
        this.$buttons = this.$sr.querySelector(".buttons")


        this.$container.onclick = (e) => {
            if(this.$dialog.contains(e.target)) return

            this.close()
        }
    }

    addButtons(...buttons) {
        for(let {id, icon, listeners} of buttons) {
            if(id in buttons) throw `button with id ${id} already exists`

            let $ = document.createElement("div")
            $.classList.add("button", "no-base-style")
            $.appendChild($icon(icon))
            $.onclick = () => listeners.map(function(l){l()})

            this.$buttons.appendChild($)
            this.buttons[id] = {id, icon, $, listeners}
        }
    }

    onNameChanged() {
        this.$titleText.innerText = this.name
    }
    onIconChanged() {
        if(this.icon === "") this.$titleIcon.hidden = false
        else this.$titleIcon.hidden = true
        this.$titleIcon.replaceWith($icon(this.icon, "title-icon"))
    }

    onClose() {return false}
    close() {
        if(this.onClose()) {
            console.log("dialog close canceled")
            return false
        }

        this.remove()
        return true
    }

    addExtensions(...extensions) {
        for(let e of extensions) {
            if(typeof e === "string") e = DialogExtensionRegistry.get(e)
            if(typeof e !== "object") throw `invalid dialog extension ${e}`

            if(e.id in this.extensions) throw `dialog extension ${e.id} already added`
            e.apply.call(this, this)
        }
    }
}
customElements.define("px-dialog", Dialog)

class DialogExtensionRegistry {
    static extensions = {}

    static add(...extensions) {
        for(let e of extensions) {
            if(e.id in extensions) throw `dialog extension with id ${e.id} already exists`
            if(typeof e.id !== "string") throw "dialog extension id must be string"

            this.extensions[e.id] = e
        }
    }

    static get(id) {
        return this.extensions[id]
    }
}