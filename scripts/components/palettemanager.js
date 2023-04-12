Editor.state.setDefault("palettemanager.colors", [])
Editor.state.setDefault("palettemanager.selection", {
    id: -1,
    color: Editor.state.getDefault("colorpicker.color")
})

class PaletteManagerElement extends HTMLElement {
    #colors = []

    #selection = -1

    #mode = "normal" // "normal", "deleting", "editing", or "rearranging"

    set colors(v) {Editor.state.set("palettemanager.colors", v)}
    get colors() {return this.#colors} // this.#colors will be a readonly array of readonly colors because it is impossible to watch for changes

    set selection(v) {Editor.state.set("palettemanager.selection.id", v)}
    get selection() {return this.#selection}

    set selectionColor(v) {Editor.state.set("palettemanager.selection.color", v)}

    set mode(v) {Editor.state.set("palettemanager.mode", v)}
    get mode() {return this.#mode}


    #$section
    set $section(v) {this.#$section = v; this.onModeChanged()}
    get $section() {return this.#$section}

    get $sectionHeader() {return this.$section.querySelector(".section-header")}
    get $sectionHeaderButtons() {return this.$section.querySelector(".section-header-buttons")}

    constructor() {
        super()

        this.attachShadow({mode: "open"})
        this.$sr.innerHTML = `
        <div class="container">
            <div class="colors">
                <div class="add" data-id="-1">
                    ${icon("bx-plus")}
                </div>
            </div>
        </div>`
        getCSS("base").then((css)=>this.$sr.appendChild(css))
        getCSS("components/palettemanager").then((css)=>this.$sr.appendChild(css))

        this.$add = this.$sr.querySelector(".add")
        this.$colors = this.$sr.querySelector(".colors")

        this.sortable = new Sortable(this.$colors, {
            animation: 100,
            disabled: true,
            ghostClass: "sort-ghost" // disable sorting by default
        })


        this.$add.onmousedown = () => {
            if(this.selection === -1) {// -1 is the color picker
                let c = Editor.state.get("colorpicker.color")
                this.addColor(c.hue, c.sat, c.val)
                this.selection = this.indexOfColor(c.hue, c.sat, c.val)
            }
            else this.selection = -1
        }

        this.mode = "normal"

        Editor.state.sub("palettemanager.selection.id", (v) => {this.#selection = v; this.onSelectionChanged()})
        Editor.state.sub("palettemanager.colors", (v) => {this.#colors = v; this.onPaletteChanged()})
        Editor.state.sub("palettemanager.mode", (v) => {this.#mode = v; this.onModeChanged()})

        Editor.state.sub("colorpicker.color", ({hue, sat, val}) => this.onPickedColorChanged(hue, sat, val))
    }

    onPickedColorChanged(hue, sat, val) {
        if(this.hasColor(hue, sat, val)) this.selection = this.indexOfColor(hue, sat, val)
        else {
            let c = hsv2rgb(hue, sat, val)
            this.$add.style.setProperty("--color", `rgb(${c.r}, ${c.g}, ${c.b})`)

            c = contrastColor(hue, sat, val) === "black" ? "#000000" : "#ffffff"
            this.$add.style.color = c
            this.$add.style.setProperty("--contrast", c)
        }

        if(this.mode === "editing" && this.selection !== -1) {
            if(this.hasColor(hue, sat, val) && this.selection !== this.indexOfColor(hue, sat, val)) {
                this.removeColor(hue, sat, val)
                this.selection = -1
            }
            else {
                this.setColor(this.selection, hue, sat, val)
                this.selection = this.indexOfColor(hue, sat, val)
            }
        }
        else this.selection = -1
    }
    onPaletteChanged() {
        this.$colors.querySelectorAll(".color").forEach((e) => e.remove())

        let i = 0
        for(let c of this.colors) {
            let $ = document.createElement("div")
            $.classList.add("color")
            $.dataset.id = i++
            $.dataset.hue = c.hue
            $.dataset.sat = c.sat
            $.dataset.val = c.val

            $.innerHTML = `
            <div class="delete-button">${icon("bxs-trash")}</div>
            <div class="move-button">${icon("bx-move")}</div>
            <div class="edit-button">${icon("bxs-edit-alt")}</div>`

            c = Object.assign(hsv2rgb(c.hue, c.sat, c.val), c) // make both RGB and HSV available
            $.style.setProperty("--color", `rgb(${c.r}, ${c.g}, ${c.b})`)

            c = contrastColor(c.hue, c.sat, c.val) === "black" ? "#000000" : "#ffffff"
            $.style.color = c
            $.style.setProperty("--contrast", c)

            $.onmousedown = () => {
                if(this.mode === "deleting") {
                    this.removeColorByID(parseInt($.dataset.id))
                    this.selection = -1
                    if(this.colors.length === 0) this.mode = "normal"
                }
                else if(this.mode === "rearranging") {}
                else this.selection = parseInt($.dataset.id)
            }

            this.$colors.insertBefore($, this.$add)
        }
    }
    onSelectionChanged() {
        this.$colors.querySelectorAll("div[data-selected=true]").forEach((e) => e.dataset.selected = false)

        if(this.selection === -1) this.$add.dataset.selected = true
        else this.$colors.querySelector(`div[data-id="${this.selection}"]`).dataset.selected = true

        this.selectionColor = this.getColor(this.selection)
    }
    onModeChanged() {
        if(this.$section) {
            let c = window.getComputedStyle(this.$sectionHeaderButtons).getPropertyValue("--selected");
            this.$sectionHeaderButtons.innerHTML = `
            <div class="section-header-button palette-manager-header-delete-button" data-selected="${this.mode === "deleting"}">
                ${icon("bxs-trash")}
            </div>
            <div class="section-header-button palette-manager-header-move-button" data-selected="${this.mode === "rearranging"}">
                ${icon("bx-move")}
            </div>
            <div class="section-header-button palette-manager-header-edit-button" data-selected="${this.mode === "editing"}">
                ${icon("bxs-edit-alt")}
            </div>`
            this.$sectionHeaderButtons.querySelector(".palette-manager-header-delete-button").onclick = () => this.mode = this.mode === "deleting" ? "normal" : "deleting"
            this.$sectionHeaderButtons.querySelector(".palette-manager-header-move-button").onclick = () => this.mode = this.mode === "rearranging" ? "normal" : "rearranging"
            this.$sectionHeaderButtons.querySelector(".palette-manager-header-edit-button").onclick = () => this.mode = this.mode === "editing" ? "normal" : "editing"
        }
        this.$colors.dataset.mode = this.mode

        // make sure $add is last child
        this.$add.remove()
        this.$colors.appendChild(this.$add)

        if(this.mode === "rearranging") this.sortable.option("disabled", false)
        else this.sortable.option("disabled", true)
    }

    addColor(hue, sat, val) {
        if(this.hasColor(hue, sat, val)) return // return if we already have that color

        this.colors = this.colors.concat([{hue, sat, val}])
    }
    setColor(id, hue, sat, val) {
        if(this.hasColor(hue, sat, val)) this.removeColorByID(id)
        this.colors = this.colors.slice(0, id).concat({hue, sat, val}, this.colors.slice(id+1))
    }
    removeColor(hue, sat, val) {
        this.colors = this.colors.filter((c) => c.hue !== hue && e.sat !== sat && e.val !== val)
    }
    removeColorByID(id) {
        this.colors = this.colors.filter((_,i) => i !== id)
    }
    hasColor(hue, sat, val) {
        return this.colors.map((c) => c.hue === hue && c.sat === sat && c.val === val).includes(true)
    }
    indexOfColor(hue, sat, val) {
        return this.colors.findIndex((c) => c.hue === hue && c.sat === sat && c.val === val)
    }

    getColor(id) {
        if(id === -1) return Editor.state.get("colorpicker.color")
        return this.colors[id]
    }

    get $sr() {
        return this.shadowRoot
    }
}
customElements.define("px-palette-manager", PaletteManagerElement)