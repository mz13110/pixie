class ColorPickerElement extends HTMLElement {
    #hue = 0
    #sat = 100
    #val = 100

    set hue(v) {GlobalState.set("colorpicker.color.hue", v)}
    get hue() {return this.#hue}
    set sat(v) {GlobalState.set("colorpicker.color.sat", v)}
    get sat() {return this.#sat}
    set val(v) {GlobalState.set("colorpicker.color.val", v)}
    get val() {return this.#val}

    constructor() {
        super()

        GlobalState.sub("colorpicker.color.hue", (v) => (this.#hue = v, this.onChanged()))
        GlobalState.sub("colorpicker.color.sat", (v) => (this.#sat = v, this.onChanged()))
        GlobalState.sub("colorpicker.color.val", (v) => (this.#val = v, this.onChanged()))        

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
                <div class="hex-container">
                    <input type="text" class="hex" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false" value="#ff0000"></input>
                    <!--
                    <button type="button" class="eyedropper">
                        <box-icon type="solid" name="eyedropper"></box-icon>
                    </button>
                    -->
                </div>
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
        
        this.$hexContainer = this.sr.querySelector(".hex-container")
        this.$hex = this.sr.querySelector(".hex")
        this.$sliderHue = this.sr.querySelector(".slider-hue")
        this.$inputHue = this.sr.querySelector(".input-hue")
        this.$sliderSat = this.sr.querySelector(".slider-sat")
        this.$inputSat = this.sr.querySelector(".input-sat")
        this.$sliderVal = this.sr.querySelector(".slider-val")
        this.$inputVal = this.sr.querySelector(".input-val")

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
        this.satVDragOrigin = null

        this.satVSize = 256
        this.$wheelSatVCanvas.width = this.satVSize
        this.$wheelSatVCanvas.height = this.satVSize
        this.satVCtx = this.$wheelSatVCanvas.getContext("2d")


        window.onmousemove = (e) => {
            if(this.changingWheelHue) this.updateHue(e.pageX, e.pageY)
            else if(this.changingWheelSatV) this.updateSatV(e.pageX, e.pageY)
        }
        window.onmouseup = (e) => {this.changingWheelHue = false; this.changingWheelSatV = false}
        window.onmouseleave = (e) => {this.changingWheelHue = false; this.changingWheelSatV = false}
        this.$wheelContainer.onmousedown = (e) => this.updateHue(e.pageX, e.pageY)
        this.$wheelInner.onmousedown = (e) => {
            this.changingWheelSatV = true
            this.updateSatV(e.pageX, e.pageY, true)
        }
        
        fixInputClamping(this.$inputHue)
        fixInputClamping(this.$inputSat)
        fixInputClamping(this.$inputVal)
        linkInputToSlider(this.$sliderHue, this.$inputHue)
        linkInputToSlider(this.$sliderSat, this.$inputSat)
        linkInputToSlider(this.$sliderVal, this.$inputVal)
        
        this.$sliderHue.oninput = () => {this.hue = this.$sliderHue.value; this.redraw()}
        this.$sliderSat.oninput = () => {this.sat = this.$sliderSat.value; this.redraw()}
        this.$sliderVal.oninput = () => {this.val = this.$sliderVal.value; this.redraw()}

        this.$hex.onchange = () => {
            let hex = this.$hex.value.trim()
            if(hex.startsWith("#")) hex = hex.slice(1)

            hex = hex.match(/^#?([a-fA-F0-9]{6})$/)
            if(hex === null) return this.redrawHex() // redrawHex() changes the text back
            hex = hex[0]
            
            let c = rgb2hsv(
                parseInt(hex.slice(0, 2), 16),
                parseInt(hex.slice(2, 4), 16),
                parseInt(hex.slice(4, 6), 16)
            )
            this.hue = c.h
            this.sat = c.s
            this.val = c.v
            this.redrawHex()
        }

        this.hue = 0
        this.sat = 100
        this.val = 100
        this.redraw()
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

        this.hue = Math.clamp(Math.round(Math.angleAround(x, y, centerX, centerY)), 0, 360)

        this.redraw()
    }
    // note: coordinates are relative to page
    updateSatV(x_, y_, isStart) {
        if(!this.changingWheelSatV) return

        let size = window.getComputedStyle(this.$wheelInner).width.slice(0, -2)
        let rect = this.$wheelInnerContainer.getBoundingClientRect()

        // pre-transform
        let left = rect.left + this.$wheelInner.offsetLeft
        let top = rect.top + this.$wheelInner.offsetTop

        let {x, y} = Math.rotate(x_, y_, -this.hue + 45, left+size/2, top+size/2)
        x-=left
        y-=top

        if(isStart) this.satVDragOrigin = {x, y}
        if(x > size || y > size || x < 0 || y < 0) {
            let s = size

            let f = y > x
            let g = y > (s-x)

            let ox = s/2
            let oy = s/2

            // make corners minmax values
            let a = Math.angleAround(x, y, ox, oy)
            let m = 6 // minmax within 6 degrees
            if(a <= 45+m/2 && a >= 45-m/2) x = size, y = size // bottom right
            if(a <= 135+m/2 && a >= 135-m/2) x = 0, y = size // bottom left
            if(a <= 225+m/2 && a >= 225-m/2) x = 0, y = 0 // top left
            if(a <= 315+m/2 && a >= 315-m/2) x = size, y = 0 // top right

            if(f) {
                if(g) x = ((x-ox)/(y-oy)) * (s-oy) + ox, y = s
                else y = ((y-oy)/(x-ox)) * (-ox) + oy, x = 0
            }
            else {
                if(g) y = ((y-oy)/(x-ox)) * (s-ox) + oy, x = s
                else x = ((x-ox)/(y-oy)) * (-oy) + ox, y = 0
            }
        }

        this.sat = Math.clamp(Math.round(x/size*100), 0, 100)
        this.val = Math.clamp(Math.round(y/size*100), 0, 100)

        this.redraw()
    }
    
    redraw() {
        this.redrawHue()
        this.redrawSatV()
        this.redrawSliders()
        this.redrawHex()
    }

    redrawHue() {
        this.$wheelPointer.style.transform = `rotate(${this.hue}deg)`

        this.$wheelPointer.style.setProperty("--color", contrastColor(this.hue, 100, 100) === "black" ? "#000000" : "#ffffff")
    }

    redrawSatV() {
        this.$wheelInner.style.transform = `rotate(${this.hue - 45}deg)`

        let size = window.getComputedStyle(this.$wheelSatV).width.slice(0, -2)

        this.$wheelSatVHandle.style.left = (this.sat/100*size) + "px"
        this.$wheelSatVHandle.style.top = (this.val/100*size) + "px"

        this.$wheelSatVHandle.style.setProperty("--color", contrastColor(this.hue, this.sat, this.val) === "black" ? "#000000" : "#ffffff")

        // background
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
        this.$sliderHue.value = this.hue
        this.$inputHue.value = this.hue
        this.$sliderHue.style.setProperty("--color", contrastColor(this.hue, 100, 100) === "black" ? "#000000" : "#ffffff")

        let contrast = contrastColor(this.hue, this.sat, this.val) === "black" ? "#000000" : "#ffffff"

        this.$sliderSat.value = this.sat
        this.$inputSat.value = this.sat
        let c1 = hsv2rgb(this.hue, 0, this.val)
        let c2 = hsv2rgb(this.hue, 100, this.val)
        this.$sliderSat.style.backgroundImage
            = `linear-gradient(90deg, rgb(${c1.r}, ${c1.g}, ${c1.b}), rgb(${c2.r}, ${c2.g}, ${c2.b}))`
        this.$sliderSat.style.setProperty("--color", (this.sat===0 || this.sat===100) ? "#ffffff" : contrast)

        this.$sliderVal.value = this.val
        this.$inputVal.value = this.val
        c1 = hsv2rgb(this.hue, this.sat, 0)
        c2 = hsv2rgb(this.hue, this.sat, 100)
        this.$sliderVal.style.backgroundImage
            = `linear-gradient(90deg, rgb(${c1.r}, ${c1.g}, ${c1.b}), rgb(${c2.r}, ${c2.g}, ${c2.b}))`
        this.$sliderVal.style.setProperty("--color", (this.val===0 || this.val===100) ? "#ffffff" : contrast)
    }

    redrawHex() {
        let c = hsv2rgb(this.hue, this.sat, this.val)

        this.$hex.style.backgroundColor = `rgb(${c.r}, ${c.g}, ${c.b})`
        this.$hexContainer.style.setProperty("--color", contrastColor(this.hue, this.sat, this.val) === "black" ? "#000000" : "#ffffff")
        //this.$hexContainer.querySelector("button>box-icon").setAttribute("color", contrastColor(this.hue, this.sat, this.val) === "black" ? "#000000" : "#ffffff")

        this.$hex.value = "#"
            + (c.r<16?"0":"") + c.r.toString(16)
            + (c.g<16?"0":"") + c.g.toString(16)
            + (c.b<16?"0":"") + c.b.toString(16)
    }

    onChanged() {
        this.redraw()
    }

    get sr() {
        return this.shadowRoot
    }
}
customElements.define("px-color-picker", ColorPickerElement)