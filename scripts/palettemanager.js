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

    #mode = "normal" // "normal", "deleting", "editing", or "rearranging"

    set colors(v) {GlobalState.set("palettemanager.colors", v)}
    get colors() {return this.#colors} // this.#colors will be a readonly array of readonly colors because it is impossible to watch for changes

    set selectionID(v) {GlobalState.set("palettemanager.selection.id", v)}
    get selectionID() {return this.#selection.id}

    set selectionColor(v) {GlobalState.set("palettemanager.selection.color", v)}
    get selectionColor() {return this.#selection.color}

    set selectionHue(v) {GlobalState.set("palettemanager.selection.color.hue", v)}
    get selectionHue() {return this.#selection.color.hue}

    set selectionSat(v) {GlobalState.set("palettemanager.selection.color.sat", v)}
    get selectionSat() {return this.#selection.color.sat}

    set selectionVal(v) {GlobalState.set("palettemanager.selection.color.val", v)}
    get selectionVal() {return this.#selection.color.val}


    set mode(v) {GlobalState.set("palettemanager.mode", v)}
    get mode() {return this.#mode}


    #$section
    set $section(v) {this.#$section = v; this.onModeChanged()}
    get $section() {return this.#$section}

    get $sectionHeader() {return this.$section.querySelector(".section-header")}
    get $sectionHeaderButtons() {return this.$section.querySelector(".section-header-buttons")}

    constructor() {
        super()

        this.attachShadow({mode: "open"})
        this.sr.innerHTML = `
        <link rel="stylesheet" href="/styles/base.css" />
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

        this.sortable = new Sortable(this.$colors, {
            animation: 100,
            disabled: true,
            ghostClass: "sort-ghost" // disable sorting by default
        })

        GlobalState.sub("colorpicker.color", ({hue, sat, val}) => this.onPickedColorChanged(hue, sat, val))


        GlobalState.sub("palettemanager.colors", (v) => {this.#colors = v; this.onPaletteChanged()})
        GlobalState.sub("palettemanager.selection.id", (v) => {this.#selection.id = v; this.onSelectionChanged()})
        GlobalState.sub("palettemanager.mode", (v) => {this.#mode = v; this.onModeChanged()})


        this.$add.onmousedown = () => {
            if(this.selectionID === -1) {// -1 is the color picker
                let c = GlobalState.get("colorpicker.color")
                this.addColor(c.hue, c.sat, c.val)
                this.selectionID = this.indexOfColor(c.hue, c.sat, c.val)
            }
            else this.selectionID = -1
        }


        {(({hue, sat, val}) => this.onPickedColorChanged(hue, sat, val))(GlobalState.get("colorpicker.color"))}

        this.mode = "normal"
    }

    onPickedColorChanged(hue, sat, val) {
        if(this.hasColor(hue, sat, val)) this.selectionID = this.indexOfColor(hue, sat, val)
        else {
            let c = hsv2rgb(hue, sat, val)
            this.$add.style.setProperty("--color", `rgb(${c.r}, ${c.g}, ${c.b})`)

            c = contrastColor(hue, sat, val) === "black" ? "#000000" : "#ffffff"
            this.$add.querySelector("box-icon").setAttribute("color", c)
            this.$add.style.setProperty("--contrast", c)
        }

        if(this.mode === "editing" && this.selectionID !== -1) {
            if(this.hasColor(hue, sat, val) && this.selectionID !== this.indexOfColor(hue, sat, val)) {
                this.removeColor(hue, sat, val)
                this.selectionID = -1
            }
            else {
                this.setColor(this.selectionID, hue, sat, val)
                this.selectionID = this.indexOfColor(hue, sat, val)
            }
        }
        else this.selectionID = -1
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

            e.innerHTML = `
            <div class="delete-button"><box-icon name="trash" type="solid"></box-icon></div>
            <div class="move-button"><box-icon name="move"></box-icon></div>
            <div class="edit-button"><box-icon name="edit-alt" type="solid"></box-icon></div>`

            c = Object.assign(hsv2rgb(c.hue, c.sat, c.val), c) // make both RGB and HSV available
            e.style.setProperty("--color", `rgb(${c.r}, ${c.g}, ${c.b})`)

            c = contrastColor(c.hue, c.sat, c.val) === "black" ? "#000000" : "#ffffff"
            e.querySelectorAll("box-icon").forEach((e) => e.setAttribute("color", c))
            e.style.setProperty("--contrast", c)

            e.onmousedown = () => {
                if(this.mode === "deleting") {
                    this.removeColorByID(e.dataset.id)
                    this.selectionID = -1
                    if(this.colors.length === 0) this.mode = "normal"
                }
                else if(this.mode === "rearranging") {}
                else this.selectionID = e.dataset.id
            }

            this.$colors.insertBefore(e, this.$add)
        }
    }
    onSelectionChanged() {
        this.$colors.querySelectorAll("div[data-selected=true]").forEach((e) => e.dataset.selected = false)

        if(this.selectionID === -1) this.$add.dataset.selected = true
        else this.$colors.querySelector(`div[data-id="${this.selectionID}"]`).dataset.selected = true

        this.selectionColor = this.getColor(this.selectionID)
    }
    onModeChanged() {
        if(this.$section) {
            this.$sectionHeaderButtons.innerHTML = `
            <div class="section-header-button palette-manager-header-delete-button"${this.mode === "deleting" ? 'data-active="true"' : ""}>
                <i class="bx bxs-trash"></i>
            </div>
            <div class="section-header-button palette-manager-header-move-button"${this.mode === "rearranging" ? 'data-active="true"' : ""}>
                <i class="bx bx-move"></i>
            </div>
            <div class="section-header-button palette-manager-header-edit-button"${this.mode === "editing" ? 'data-active="true"' : ""}>
                <i class="bx bxs-edit-alt"></i>
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
        this.colors = this.colors.filter((_,i) => i === id)
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