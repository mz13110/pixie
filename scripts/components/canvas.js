class CanvasElement extends HTMLElement {
    #width = 32
    #height = 32

    get width() {return this.#width}
    set width(v) {GlobalState.set("canvas.size.w", v)}

    get height() {return this.#height}
    set height(v) {GlobalState.set("canvas.size.h", v)}

    // cache picked color as hex because it is used alot
    #selectedColor = "#ffffff"
    get selectedColor() {return this.#selectedColor}

    constructor() {
        super()

        this.attachShadow({mode: "open"})

        this.$sr.innerHTML = `
        <div class="container">
            <div class="canvas-container">
                <canvas class="display-canvas"></canvas>
                <canvas class="preview-canvas"></canvas>
            </div>
        </div>`
        getCSS("base").then((css)=>this.$sr.appendChild(css))
        getCSS("components/canvas").then((css)=>this.$sr.appendChild(css))

        GlobalState.sub("canvas.size", (v) => {this.#width = v.w; this.#height = v.h; this.onResized()})
        GlobalState.sub("palettemanager.selection.color", (v) => {this.#selectedColor = hsv2hex(v.hue, v.sat, v.val)})

        this.$canvasContainer = this.$sr.querySelector(".canvas-container")
        this.$canvas = this.$sr.querySelector(".display-canvas")
        this.$preview = this.$sr.querySelector(".preview-canvas")
        this.ctx = this.$canvas.getContext("2d")
        this.previewCtx = this.$preview.getContext("2d")

        this.$canvas.onmousedown = (ev) => {
            let {x, y} = this.offsetToXY(ev.offsetX, ev.offsetY)
            if(this.tool) this.tool.onDown(this, x, y)
        }
        this.$canvas.onmousemove = (ev) => {
            let {x, y} = this.offsetToXY(ev.offsetX, ev.offsetY)
            if(this.tool) this.tool.onMove(this, x, y)
        }
        this.$canvas.onmouseup = (ev) => {
            let {x, y} = this.offsetToXY(ev.offsetX, ev.offsetY)
            if(this.tool) this.tool.onUp(this, x, y)
        }
        this.$canvas.onmouseleave = (ev) => {
            let {x, y} = this.offsetToXY(ev.offsetX, ev.offsetY)
            if(this.tool) this.tool.onUp(this, x, y)
        }

        this.$canvas.oncontextmenu = () => false // disable right click context menu

        this.width = 32
        this.height = 64
    }

    getRGB(x, y) {
        let c = this.ctx.getImageData(x, y, 1, 1, {
            colorSpace: "srgb"
        }).data
        return {r: c.data[0], g: c.data[1], b: c.data[2], a: c.data[3]}
    }
    set(x, y, c) {
        this.ctx.fillStyle = c ?? this.selectedColor
        this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1)
    }
    del(x, y) {
        this.ctx.clearRect(Math.floor(x), Math.floor(y), 1, 1)
    }
    rset(x, y, w, h, c) {
        this.ctx.fillStyle = c ?? this.selectedColor
        this.ctx.fillRect(Math.floor(x), Math.floor(y), w, h)
    }
    rdel(x, y, w, h) {
        this.ctx.clearRect(Math.floor(x), Math.floor(y), w, h)
    }

    offsetToXY(x, y) {
        let rect = this.$canvas.getBoundingClientRect()
        return {
            x: Math.floor((this.width / rect.width) * x),
            y: Math.floor((this.height / rect.height) * y)
        }
    }

    onResized() {
        this.$canvasContainer.style.aspectRatio = `${this.width} / ${this.height}`

        this.$canvas.width = this.width
        this.$canvas.height = this.height

        this.$preview.width = this.width
        this.$preview.height = this.height
    }

    get $sr() {
        return this.shadowRoot
    }
}

customElements.define("px-canvas", CanvasElement)