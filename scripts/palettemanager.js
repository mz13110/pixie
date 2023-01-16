class PaletteManagerElement extends HTMLElement {
    #colors = []
    #selection = -1

    set colors(v) {GlobalState.set("palettemanager.colors", v)}
    get colors() {return this.#colors} // this.#colors will be a readonly array of readonly colors because it is impossible to watch for changes

    set selection(v) {GlobalState.set("palettemanager.selection", v)}
    get selection() {return this.#selection}

    constructor() {
        super()

        this.attachShadow({mode: "open"})
        this.sr.innerHTML = `
        <link rel="stylesheet" href="/styles/palettemanager.css" />
        <div class="container">
            <div class="colors">
                <div class="color"></div>
                <div class="add" data-id="-1">
                    <box-icon name="plus"></box-icon>
                </div>
            </div>
        </div>`
        this.$add = this.sr.querySelector(".add")
        this.$colors = this.sr.querySelector(".colors")
        
        GlobalState.sub("colorpicker.color", ({hue, sat, val}) => this.onPickedColorChanged(hue, sat, val))
        

        GlobalState.sub("palettemanager.colors", (v) => this.#colors = Object.freeze(v.map((c) => Object.freeze(Object.assign({}, c)))), this.onPaletteChanged())
        GlobalState.sub("palettemanager.selection", (v) => this.#selection = v, this.onSelectionChanged())


        this.$add.onclick = () => {
            console.log(this.selection)
            if(this.selection === -1) {// -1 is the color picker
                let c = GlobalState.get("colorpicker.color")
                this.add(c.hue, c.sat, c.val)
            }
            else this.selection = -1
        }
        
        
        {(({hue, sat, val}) => this.onPickedColorChanged(hue, sat, val))(GlobalState.get("colorpicker.color"))}
    }

    onPickedColorChanged(h, s, v) {
        if(this.includes(h, s, v)) this.selection = this.indexOf(h, s, v)
        else {
            let c = hsv2rgb(h, s, v)
            this.$add.style.backgroundColor = `rgb(${c.r}, ${c.g}, ${c.b})`

            this.$add.querySelector("box-icon").setAttribute("color", contrastColor(h, s, v) === "black" ? "#000000" : "#ffffff")
        }
    }
    onPaletteChanged() {
        this.$colors.querySelectorAll(".color").forEach((e) => e.remove())

        let i = 0
        for(let c of this.colors) {
            let e = document.createElement("div")
            e.classList.add("color")
            e.dataset.id = i++

            this.$colors.appendChild(e)
        }
    }
    onSelectionChanged() {
        this.$colors.querySelectorAll("div[data-selected=true]").forEach((e) => e.dataset.selected = false)
        this.$colors.querySelector(`div[data-id="${this.selection}"]`).dataset.selected = true
    }

    add(hue, sat, val) {
        if(this.includes(hue, sat, val)) return // return if we already have that color

        this.colors = this.colors.concat([{hue, sat, val}])
    }
    remove(h, s, v) {
        this.colors = this.colors.filter((c) => c.hue !== h && e.sat !== s && e.val !== v)
    }
    includes(h, s, v) {
        return this.colors.map((c) => c.hue === h && c.sat === s && c.val === v).includes(true)
    }
    indexOf(h, s, v) {
        return this.colors.findIndex((c) => c.hue === h && c.sat === s && c.val === v)
    }

    get sr() {
        return this.shadowRoot
    }
}
customElements.define("px-palette-manager", PaletteManagerElement)