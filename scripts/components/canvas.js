Editor.state.setDefault("canvas.size", { width: IMAGE_DEFAULT_WIDTH, height: IMAGE_DEFAULT_HEIGHT })

class CanvasElement extends HTMLElement {
    #width = IMAGE_DEFAULT_WIDTH
    #height = IMAGE_DEFAULT_HEIGHT

    get width() { return this.#width }
    set width(v) { Editor.state.set("canvas.size.width", v) }

    get height() { return this.#height }
    set height(v) { Editor.state.set("canvas.size.height", v) }

    // cache picked color as hex because it is used alot
    #selectedColor = "#ffffff"
    get selectedColor() { return this.#selectedColor }

    constructor() {
        super()

        this.attachShadow({ mode: "open" })

        this.$sr.innerHTML = `
        <div class="container">
            <canvas class="display-canvas"></canvas>
            <canvas class="preview-canvas"></canvas>
        </div>`
        getCSS("base").then((css) => this.$sr.appendChild(css))
        getCSS("components/canvas").then((css) => this.$sr.appendChild(css))

        this.$canvasContainer = this.$sr.querySelector(".canvas-container")
        this.$canvas = this.$sr.querySelector(".display-canvas")
        this.$preview = this.$sr.querySelector(".preview-canvas")
        this.ctx = this.$canvas.getContext("2d")
        this.previewCtx = this.$preview.getContext("2d")

        let mouse = (e) => {
            return (ev) => {
                if(this.tool) {
                    let { x, y } = this.offsetToXY(ev.offsetX, ev.offsetY)
                    this.tool[e](this, x, y)
                }
            }
        }
        let lastTouch = { x: 0, y: 0 }
        let touch = (e) => {
            return (ev) => {
                if(this.tool) {
                    ev.preventDefault()
                    for (let touch of ev.touches) {
                        let { x: ox, y: oy } = this.clientToOffset(touch.clientX, touch.clientY)
                        let { x, y } = this.offsetToXY(ox, oy)
                        lastTouch = { x, y }
                        this.tool[e](this, x, y)
                    }
                }
            }
        }
        this.onmousedown = mouse("onDown")
        this.onmousemove = mouse("onMove")
        this.onmouseup = mouse("onUp")
        this.onmouseleave = mouse("onUp")

        this.ontouchstart = touch("onDown")
        this.ontouchmove = touch("onMove")
        this.ontouchend = () => { if (this.tool) this.tool.onUp(this, lastTouch.x, lastTouch.y) }

        this.oncontextmenu = () => false // disable right click context menu

        Editor.state.sub("canvas.size", (v) => { this.#width = v.width; this.#height = v.height; this.onResized() })
        Editor.state.sub("palettemanager.selection.color", (v) => { this.#selectedColor = hsv2hex(v.hue, v.sat, v.val) })

        Editor.bus.def("canvas.clear", this.clear.bind(this))
    }

    getRGB(x, y) {
        let c = this.ctx.getImageData(x, y, 1, 1, {
            colorSpace: "srgb"
        }).data
        return { r: c.data[0], g: c.data[1], b: c.data[2], a: c.data[3] }
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

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height)
    }

    clientToOffset(x, y) {
        return {
            x: x - this.$canvas.offsetLeft,
            y: y - this.$canvas.offsetTop
        }
    }
    offsetToXY(x, y) {
        return {
            x: Math.floor((this.width / this.$canvas.offsetWidth) * x),
            y: Math.floor((this.height / this.$canvas.offsetHeight) * y)
        }
    }

    onResized() {
        this.style.setProperty("--width", this.width)
        this.style.setProperty("--height", this.height)

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