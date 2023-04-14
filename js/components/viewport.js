class ViewportElement extends HTMLElement {
    #canvasSize = Editor.state.get("canvas.size")
    
    get canvasWidth() {return this.#canvasSize.width}
    set canvasWidth(v) {Editor.state.set("canvas.size.width", v)}

    get canvasHeight() {return this.#canvasSize.height}
    set canvasHeight(v) {Editor.state.set("canvas.size.height", v)}

    #locked = false
    get locked() {return this.#locked}
    set locked(v) {this.#locked = v; this.onLockChanged()}


    constructor() {
        super()

        this.attachShadow({mode: "open"})
        
        this.$sr.innerHTML = `
            <div class="container" data-locked="${this.locked}">
                <div class="menu">
                    <div class="lock button no-base-styling">
                        <div data-locked="true">${icon("bxs-lock-alt")}</div>
                        <div data-locked="false">${icon("bxs-lock-open-alt")}</div>
                    </div>
                    <div class="reset button no-base-styling">
                        ${icon("bx-reset")}
                    </div>
                    <div class="zoom-in button no-base-styling">
                        ${icon("bx-zoom-in")}
                    </div>
                    <div class="zoom button no-base-styling">
                        <input type="number"></input>
                    </div>
                    <div class="zoom-out button no-base-styling">
                        ${icon("bx-zoom-out")}
                    </div>
                </div>
                <div class="main">
                    <pinch-zoom>
                        <div class="content">
                            <px-canvas></px-canvas>
                        </div>
                    </pinch-zoom>
                </div>
            </div>
        `
        getCSS("base").then((css)=>this.$sr.appendChild(css))
        getCSS("components/viewport").then((css)=>this.$sr.appendChild(css))

        this.$container = this.$sr.querySelector(".container")
        this.$main = this.$sr.querySelector(".main")
        this.$pinchZoom = this.$sr.querySelector("pinch-zoom")
        this.$content = this.$sr.querySelector(".content")
        this.$canvas = this.$sr.querySelector("px-canvas")
        this.$menu = this.$sr.querySelector(".menu")

        this.$lock = this.$sr.querySelector(".lock")
        this.$reset = this.$sr.querySelector(".reset")
        this.$zoomIn = this.$sr.querySelector(".zoom-in")
        this.$zoomOut = this.$sr.querySelector(".zoom-out")

        // prevent pinch-zoom from recieving pointerdown (skip it) from $content because otherwise, drawing on the canvas would just pan
        const skip = (e) => {
            e.stopPropagation()
            this.$main.dispatchEvent(cloneEvent(e))
        }
        this.$content.onpointerdown = skip
        this.$content.onmousedown = skip
        this.$content.touchstart = skip

        this.$lock.onclick = () => this.locked = !this.locked
        this.$reset.onclick = () => this.recenter()

        this.$pinchZoom.onresize = () => this.recenter()
        this.$pinchZoom.addEventListener("change", () => this.onPinchZoom())
        this.pzResizeObserver = new ResizeObserver((entries) => {
            this.recenter()
        })
        //window.loaded.then(this.recenter.bind(this))


        Editor.state.sub("canvas.size", (v) => {this.#canvasSize = v; this.recenter()})
    }

    recenter() {
        if(!this.isConnected) return

        const h2w = this.canvasWidth / this.canvasHeight
        const w2h = this.canvasHeight / this.canvasWidth

        // what percentage of width/height should be filled
        // **width and height will be swapped if width is greater than height**
        let pw = 0.8
        let ph = 0.8
        if(pw>ph) [pw, ph] = [ph, pw]

        let cont = this.$pinchZoom.getBoundingClientRect()

        let w = Math.min(pw*cont.width, ph*cont.height*h2w)
        let h = w*w2h

        let s = getComputedStyle(this.$content)
        let rect = {w: parseFloat(s.width.slice(0,-2)), h: parseFloat(s.height.slice(0,-2)), x: parseFloat(s.x.slice(0,-2)), y: parseFloat(s.y.slice(0,-2))}

        this.$pinchZoom.setTransform({
            scale: w/rect.w,
            x: (cont.width - w) / 2,
            y: (cont.height - h) / 2,

            allowChangeEvent: false
        })
    }

    onPinchZoom() {
    }
    onLockChanged() {
        this.$container.dataset.locked = this.locked
        if(this.locked) this.$pinchZoom.disable()
        else this.$pinchZoom.enable()
    }

    connectedCallback() {
        setTimeout(this.recenter.bind(this), 100)

    }

    get $sr() {
        return this.shadowRoot
    }
}
customElements.define("px-viewport", ViewportElement)