class CanvasElement extends HTMLElement {
    #width = 32
    #height = 32

    get width() {return this.#width}
    set width(v) {Editor.state.set("canvas.size.width", v)}

    get height() {return this.#height}
    set height(v) {Editor.state.set("canvas.size.height", v)}

    // cache picked color as hex because it is used alot
    #selectedColor = "#ffffff"
    get selectedColor() {return this.#selectedColor}

    constructor() {
        super()

        this.attachShadow({mode: "open"})

        this.$sr.innerHTML = `
        <div class="container">
            <canvas class="display-canvas"></canvas>
            <canvas class="preview-canvas"></canvas>
        </div>`
        getCSS("base").then((css)=>this.$sr.appendChild(css))
        getCSS("components/canvas").then((css)=>this.$sr.appendChild(css))

        Editor.state.sub("canvas.size", (v) => {this.#width = v.width; this.#height = v.height; this.onResized()})
        Editor.state.sub("palettemanager.selection.color", (v) => {this.#selectedColor = hsv2hex(v.hue, v.sat, v.val)})

        this.$canvasContainer = this.$sr.querySelector(".canvas-container")
        this.$canvas = this.$sr.querySelector(".display-canvas")
        this.$preview = this.$sr.querySelector(".preview-canvas")
        this.ctx = this.$canvas.getContext("2d")
        this.previewCtx = this.$preview.getContext("2d")

        let mouse = (e) => {
            return (ev) => {
                if(this.tool) {
                    let {x, y} = this.offsetToXY(ev.offsetX, ev.offsetY)
                    this.tool[e](this, x, y)
                }
            }
        }
        let lastTouch = {x: 0, y: 0}
        let touch = (e) => {
            return (ev) => {
                if(this.tool) {
                    ev.preventDefault()
                    for(let touch of ev.touches) {
                        let {x: ox, y: oy} = this.clientToOffset(touch.clientX, touch.clientY)
                        let {x, y} = this.offsetToXY(ox, oy)
                        lastTouch = {x, y}
                        this.tool[e](this, x, y)
                    }
                }
            }
        }
        this.$canvas.onmousedown = mouse("onDown")
        this.$canvas.onmousemove = mouse("onMove")
        this.$canvas.onmouseup = mouse("onUp")
        this.$canvas.onmouseleave = mouse("onUp")
        
        this.$canvas.ontouchstart = touch("onDown")
        this.$canvas.ontouchmove = touch("onMove")
        this.$canvas.ontouchend = () => {if(this.tool) this.tool.onUp(this, lastTouch.x, lastTouch.y)}

        this.$canvas.oncontextmenu = () => false // disable right click context menu

        this.width = 32
        this.height = 32
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

    clientToOffset(x, y) {
        let rect = this.$canvas.getBoundingClientRect()
        return {
            x: x - rect.left,
            y: y - rect.top
        }
    }
    offsetToXY(x, y) {
        let rect = this.$canvas.getBoundingClientRect()
        return {
            x: Math.floor((this.width / rect.width) * x),
            y: Math.floor((this.height / rect.height) * y)
        }
    }

    onResized() {
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