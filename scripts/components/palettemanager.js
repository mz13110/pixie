// https://lospec.com/palette-list/proportion-32
Editor.state.setDefault("palettemanager.colors", [{hue:54.83443708609271,sat:59.21568627450981,val:100},{hue:46.53658536585366,sat:82.66129032258065,val:97.25490196078431},{hue:33.40909090909091,sat:74.26160337552743,val:92.94117647058823},{hue:19.141104294478527,sat:72.44444444444444,val:88.23529411764706},{hue:354.1353383458647,sat:68.55670103092784,val:76.07843137254902},{hue:347.14285714285717,sat:81.75182481751825,val:53.72549019607843},{hue:336.2637362637363,sat:100,val:35.68627450980392},{hue:347.7669902912621,sat:40.87301587301587,val:98.82352941176471},{hue:341.19402985074623,sat:57.5107296137339,val:91.37254901960785},{hue:304.71910112359546,sat:50.857142857142854,val:68.62745098039215},{hue:280.5194805194805,sat:54.60992907801418,val:55.294117647058826},{hue:262.15384615384613,sat:64.35643564356435,val:39.6078431372549},{hue:206.66666666666666,sat:39.75903614457831,val:97.6470588235294},{hue:219.84,sat:55.80357142857143,val:87.84313725490196},{hue:237.98319327731093,sat:62.96296296296296,val:74.11764705882354},{hue:192.5581395348837,sat:46.48648648648649,val:72.54901960784314},{hue:183,sat:56.73758865248227,val:55.294117647058826},{hue:171.29032258064518,sat:66.66666666666666,val:36.470588235294116},{hue:157.71428571428572,sat:100,val:13.725490196078432},{hue:153.44262295081967,sat:100,val:23.92156862745098},{hue:115.66265060240964,sat:88.29787234042553,val:36.86274509803922},{hue:103.46938775510203,sat:77.77777777777779,val:49.411764705882355},{hue:86.89655172413794,sat:72.95597484276729,val:62.35294117647059},{hue:79.61538461538461,sat:53.608247422680414,val:76.07843137254902},{hue:247.5,sat:3.1372549019607843,val:100},{hue:255.78947368421052,sat:10.052910052910052,val:74.11764705882354},{hue:276,sat:12.096774193548388,val:48.627450980392155},{hue:251.99999999999997,sat:23.076923076923077,val:25.49019607843137},{hue:240,sat:23.076923076923077,val:5.098039215686274},{hue:346,sat:34.090909090909086,val:34.509803921568626},{hue:14.814814814814815,sat:44.505494505494504,val:71.37254901960785},{hue:31.80722891566265,sat:35.16949152542373,val:92.54901960784314}])
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