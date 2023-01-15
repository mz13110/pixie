class ColorPickerElement extends HTMLElement {
    constructor() {
        super()

        this.hue = 0
        this.sat = 100
        this.val = 100

        this.attachShadow({
            mode: "open"
        })
        this.sr.innerHTML = `
        <link rel="stylesheet" href="styles/colorpicker.css" />
        <div class="container">
            <div class="wheel-container">
                <div class="wheel"></div>
                <div class="wheel-pointer">
                    <div></div>
                </div>

                <div class="wheel-inner-container">
                    <div class="wheel-inner">
                        <div class="wheel-satv">
                            <canvas class="wheel-satv-canvas"></canvas>
                            <div class="wheel-satv-handle">
                                <div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bottom-container">
                <div class="preview"></div>
                <div class="slider-container">
                    <span class="slider-label">H</span>
                    <input type="range" class="slider slider-hue" min="0" max="360" />
                    <input type="number" class="input input-hue" min="0" max="360" />
                </div>
                <div class="slider-container">
                    <span class="slider-label">S</span>
                    <input type="range" class="slider slider-sat" min="0" max="100" />
                    <input type="number" class="input input-sat" min="0" max="100" />
                </div>
                <div class="slider-container">
                    <span class="slider-label">V</span>
                    <input type="range" class="slider slider-val" min="0" max="100" />
                    <input type="number" class="input input-val" min="0" max="100" />
                </div>
            </div>
        </div>`

        this.$container = this.sr.querySelector(".container")
        this.$wheelPointer = this.sr.querySelector(".wheel-pointer")
        this.$wheelContainer = this.sr.querySelector(".wheel-container")
        
        this.$wheelInnerContainer = this.sr.querySelector(".wheel-inner-container")
        this.$wheelInner = this.sr.querySelector(".wheel-inner")
        this.$wheelSatV = this.sr.querySelector(".wheel-satv")
        this.$wheelSatVCanvas = this.sr.querySelector(".wheel-satv-canvas")
        this.$wheelSatVHandle = this.sr.querySelector(".wheel-satv-handle")

        this.outerDiameter = this.$wheelContainer.getBoundingClientRect().width
        this.innerDiameter = this.$wheelInnerContainer.getBoundingClientRect().width
        let resizeObserver = new ResizeObserver(() => {
            this.outerDiameter = this.$wheelContainer.getBoundingClientRect().width
            this.innerDiameter = this.$wheelInnerContainer.getBoundingClientRect().width

            let size = Math.sqrt((this.innerDiameter**2)/2)
            this.$wheelInner.style.width = size + "px"
            this.$wheelInner.style.height = size + "px"

            this.redraw()
        })
        resizeObserver.observe(this.$wheelContainer)

        this.changingWheelHue = false
        this.changingWheelSatV = false

        this.satVSize = 256
        this.$wheelSatVCanvas.width = this.satVSize
        this.$wheelSatVCanvas.height = this.satVSize
        this.satVCtx = this.$wheelSatVCanvas.getContext("2d")

        this.redrawSatV()


        window.onmousemove = (e) => {
            if(this.changingWheelHue) this.updateHue(e.pageX, e.pageY)
            else if(this.changingWheelSatV) this.updateSatV(e.pageX, e.pageY)
        }
        window.onmouseup = (e) => {this.changingWheelHue = false; this.changingWheelSatV = false}
        window.onmouseleave = (e) => {this.changingWheelHue = false; this.changingWheelSatV = false}
        this.$wheelContainer.onmousedown = (e) => this.updateHue(e.pageX, e.pageY)
        this.$wheelInner.onmousedown = (e) => {
            this.changingWheelSatV = true
            this.updateSatV(e.pageX, e.pageY)
        }
        this.sr.querySelectorAll(".input").forEach(fixInputClamping)
        for(let bruh of ["hue", "sat", "val"]) {
            linkSliderToInput(this.sr.querySelector(".slider-" + bruh), this.sr.querySelector(".input-" + bruh))
        }
    }

    // note: coordinates are relative to page
    updateHue(x, y) {
        let rect = this.$wheelContainer.getBoundingClientRect()
        let centerX = rect.left + rect.width/2
        let centerY = rect.top + rect.height/2

        // Check if the mouse is in the inner area or actual ring
        let d = distanceTo(centerX, centerY, x, y)
        if(!this.changingWheelHue && (d <= this.innerDiameter/2 || d >= this.outerDiameter/2)) return
        this.changingWheelHue = true

        this.hue = Math.clamp(Math.round((Math.rad2deg(Math.atan2(y-centerY, x-centerX)) + 360) % 360), 0, 360)

        this.redraw()
    }
    // note: coordinates are relative to page
    updateSatV(x_, y_) {
        if(!this.changingWheelSatV) return

        let size = window.getComputedStyle(this.$wheelInner).width.slice(0, -2)
        let rect = this.$wheelInnerContainer.getBoundingClientRect()

        // pre-transform
        let left = rect.left + this.$wheelInner.offsetLeft
        let top = rect.top + this.$wheelInner.offsetTop

        let {x, y} = Math.rotate(x_, y_, -this.hue + 45, left+size/2, top+size/2)
        x-=left
        y-=top

        this.sat = x/size*100
        this.val = y/size*100

        this.redraw()
    }
    
    redraw() {
        this.$wheelPointer.style.transform = `rotate(${this.hue}deg)`
        this.$wheelInner.style.transform = `rotate(${this.hue - 45}deg)`

        this.redrawSatV()
    }

    redrawSatV() {
        let size = window.getComputedStyle(this.$wheelSatV).width.slice(0, -2)

        this.$wheelSatVHandle.style.left = (this.sat/100*size) + "px"
        this.$wheelSatVHandle.style.top = (this.val/100*size) + "px"

        const s = this.satVSize
        let img = this.satVCtx.createImageData(s, s)

        for(let x = 0; x < s; x++) {
            for(let y = 0; y < s; y++) {
                let color = hsv2rgb(this.hue, x/s*100, y/s*100)

                img.data[(s*y+x)*4] = color.r
                img.data[(s*y+x)*4+1] = color.g
                img.data[(s*y+x)*4+2] = color.b
                img.data[(s*y+x)*4+3] = 255
                
            }
        }
        this.satVCtx.putImageData(img, 0, 0)
    }

    redrawSliders() {

    }

    get sr() {
        return this.shadowRoot
    }
}
customElements.define("px-color-picker", ColorPickerElement)