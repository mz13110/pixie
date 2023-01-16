class PaletteManagerElement extends HTMLElement {
    #colors = []

    #selection = {
        id: 0,
        color: {
            hue: 0,
            sat: 100,
            val: 100
        }
    }

    set colors(v) {GlobalState.set("palettemanager.colors", v)}
    get colors() {return this.#colors} // this.#colors will be a readonly array of readonly colors because it is impossible to watch for changes

    set selectionID(v) {GlobalState.set("palettemanager.selection.id", v)}
    get selectionID() {return this.#selection.id}

    set selectionHue(v) {GlobalState.set("palettemanager.selection.color.hue", v)}
    get selectionHue() {return this.#selection.color.hue}

    set selectionSat(v) {GlobalState.set("palettemanager.selection.color.sat", v)}
    get selectionSat() {return this.#selection.color.sat}

    set selectionVal(v) {GlobalState.set("palettemanager.selection.color.val", v)}
    get selectionVal() {return this.#selection.color.val}

    constructor() {
        super()

        this.attachShadow({mode: "open"})
        this.sr.innerHTML = `
        <link rel="stylesheet" href="/styles/palettemanager.css" />
        <div class="container">
            <div class="colors">
                <div class="add" data-id="-1">
                    <box-icon name="plus"></box-icon>
                </div>
            </div>
        </div>`
        this.$add = this.sr.querySelector(".add")
        this.$colors = this.sr.querySelector(".colors")

        GlobalState.sub("colorpicker.color", ({hue, sat, val}) => this.onPickedColorChanged(hue, sat, val))


        GlobalState.sub("palettemanager.colors", (v) => {this.#colors = Object.freeze(v.map((c) => Object.freeze(Object.assign({}, c)))); this.onPaletteChanged()})
        GlobalState.sub("palettemanager.selection.id", (v) => {this.#selection.id = v; this.onSelectionChanged()})


        this.$add.onclick = () => {
            if(this.selectionID === -1) {// -1 is the color picker
                let c = GlobalState.get("colorpicker.color")
                this.addColor(c.hue, c.sat, c.val)
                this.selectionID = this.indexOfColor(c.hue, c.sat, c.val)
            }
            else this.selectionID = -1
        }


        {(({hue, sat, val}) => this.onPickedColorChanged(hue, sat, val))(GlobalState.get("colorpicker.color"))}
        this.selectionID = -1
    }

    onPickedColorChanged(hue, sat, val) {
        if(this.hasColor(hue, sat, val)) this.selectionID = this.indexOfColor(hue, sat, val)
        else {
            let c = hsv2rgb(hue, sat, val)
            this.$add.style.setProperty("--color", `rgb(${c.r}, ${c.g}, ${c.b})`)

            this.$add.querySelector("box-icon").setAttribute("color", contrastColor(hue, sat, val) === "black" ? "#000000" : "#ffffff")
        }
    }
    onPaletteChanged() {
        this.$colors.querySelectorAll(".color").forEach((e) => e.remove())

        let i = 0
        for(let c of this.colors) {
            let e = document.createElement("div")
            e.classList.add("color")
            e.dataset.id = i++
            e.dataset.hue = c.hue
            e.dataset.sat = c.sat
            e.dataset.val = c.val

            c = hsv2rgb(c.hue, c.sat, c.val)
            e.style.setProperty("--color", `rgb(${c.r}, ${c.g}, ${c.b})`)

            e.onclick = () => this.selectionID = e.dataset.id

            this.$colors.insertBefore(e, this.$add)
        }
    }
    onSelectionChanged() {
        this.$colors.querySelectorAll("div[data-selected=true]").forEach((e) => e.dataset.selected = false)

        if(this.selectionID === -1) this.$add.dataset.selected = true
        else this.$colors.querySelector(`div[data-id="${this.selectionID}"]`).dataset.selected = true

        this.selectionHue = this.getColor(this.selectionID)
    }

    addColor(hue, sat, val) {
        if(this.hasColor(hue, sat, val)) return // return if we already have that color

        this.colors = this.colors.concat([{hue, sat, val}])
    }
    removeColor(hue, sat, val) {
        this.colors = this.colors.filter((c) => c.hue !== hue && e.sat !== sat && e.val !== val)
    }
    hasColor(hue, sat, val) {
        return this.colors.map((c) => c.hue === hue && c.sat === sat && c.val === val).includes(true)
    }
    indexOfColor(hue, sat, val) {
        return this.colors.findIndex((c) => c.hue === hue && c.sat === sat && c.val === val)
    }

    getColor(id) {
        if(id === -1) return GlobalState.get("colorpicker.color")
        return this.colors[id]
    }

    get sr() {
        return this.shadowRoot
    }
}
customElements.define("px-palette-manager", PaletteManagerElement)