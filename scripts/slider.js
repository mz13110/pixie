const INFINITY_EQUIVALENT = 10000
const SLIDER_INFINITY_EQUIVALENT = 1000

class SliderElement extends HTMLElement {
    set min(v) {this.setAttribute("min", v)}
    get min() {return this.getAttribute("min")}

    set max(v) {this.setAttribute("max", v)}
    get max() {return this.getAttribute("max")}

    set step(v) {this.setAttribute("step", v)}
    get step() {return this.getAttribute("step")}

    set value(v) {this.setAttribute("value", v)}
    get value() {return this.getAttribute("value")}

    set name(v) {this.setAttribute("name", v)}
    get name() {return this.getAttribute("name")}

    constructor() {
        super()

        this.type = "range"

        this.attachShadow({
            mode: "open"
        })
        this.sr.innerHTML = `
        <link rel="stylesheet" href="/styles/base.css" />
        <link rel="stylesheet" href="/styles/slider.css" />
        <div class="container">
            <input class="slider no-base-style" type="range">
            <div class="slider-bg">
                <div></div>
            </div>

            <div class="text">
                <div class="label"></div>
                <input type="number" class="number no-base-style">
            </div>
        </div>
        `

        this.$container = this.sr.querySelector(".container")
        this.$slider = this.sr.querySelector(".slider")
        this.$label = this.sr.querySelector(".label")
        this.$number = this.sr.querySelector(".number")

        this.$slider.oninput = (e) => {
            e.stopPropagation() // the event might bubble out shadow root
            this.value = this.$slider.value
        }
        this.$slider.onchange = (e) => {
            e.stopPropagation() // the event might bubble out shadow root
            this.dispatchEvent(new Event("change"))
        }

        this.$number.oninput = (e) => {
            e.stopPropagation() // the event might bubble out shadow root
            console.log(this.$number.value)
            let n = this.$number.value
            this.value = this.$number.value
            if(this.value !== n) {// change was reverted
                console.log("reverted")
                this.$number.value = n // revert the reversion because techinically we are still editing
            }
        }
        this.$number.onchange = (e) => {
            e.stopPropagation() // the event might bubble out shadow root

            this.value = Math.clamp(
                this.value,
                this.min == Infinity ? INFINITY_EQUIVALENT : this.min,
                this.max == Infinity ? INFINITY_EQUIVALENT : this.max) // use == instead of === because this.max might be a string
            this.dispatchEvent(new Event("change"))
        }

        linkEventAttr(this, "input", "oninput")
        linkEventAttr(this, "change", "onchange")
    }
    connectedCallback() {
        this.min = 0
        this.max = Infinity
        this.step = 1
        this.value = 50
    }

    attributeChangedCallback(k, old, v) {
        if(k === "name") {
            this.$label.innerText = v
            return
        }
        switch(k) {
            case "min":
            case "max":
            case "step":
            case "value":
                if(Number.isNaN(v = parseFloat(v))) {
                    if(v == Infinity) v = Infinity
                    else if(v == -Infinity) v = -Infinity
                    else {
                        this.setAttribute(k, old)
                        throw TypeError(`cannot parse ${v} as a number or infinity`)
                    }
                }
                break
        }

        switch(k) {
            case "min":
            case "max":
                // slider ranges cannot be infinity
                if(v === -Infinity) {
                    this.$slider[k] = -SLIDER_INFINITY_EQUIVALENT
                    break
                }
                else if(v === Infinity) {
                    this.$slider[k] = SLIDER_INFINITY_EQUIVALENT
                    break
                }

                this.$slider[k] = v
                break
            case "value":
                if(v !== parseFloat(old)) this.dispatchEvent(new Event("input"))

                // resize the number input because they wont do it for me
                let e = document.createElement("div") // measure the needed size
                e.innerText = v
                e.style.visibility = "hidden"
                e.style.pointerEvents = "none"
                e.style.position = "absolute"
                e.style.overflow = "hidden"
                e.classList.add("number")
                this.$container.appendChild(e)
                this.$number.style.width = (e.getBoundingClientRect().width)+"px" // apply the size
                e.remove() // clean up

                this.$number.value = v

                let p
                if(v <= this.$slider.min) p = 0
                if(v >= this.$slider.max) p = 100
                else p = (this.$slider.value-this.$slider.min) / (this.$slider.max-this.$slider.min) * 100
                this.$container.style.setProperty("--percent",  p+"%")
                break
        }
    }

    static get observedAttributes() {
        return ["min", "max", "step", "value", "name"]
    }

    get sr() {
        return this.shadowRoot
    }
}
customElements.define("px-slider", SliderElement)