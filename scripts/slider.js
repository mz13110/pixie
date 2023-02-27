class SliderElement extends HTMLElement {
    set min(v) {this.setAttribute("min", v)}
    get min() {return this.getAttribute("min")}

    set max(v) {this.setAttribute("max", v)}
    get max() {return this.getAttribute("max")}

    set step(v) {this.setAttribute("step", v)}
    get step() {return this.getAttribute("step")}

    set value(v) {this.setAttribute("value", v)}
    get value() {return this.getAttribute("value")}

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

            <div class="label">Threshold</div>
            <div class="number">234243243</div>
        </div>
        `

        this.$container = this.sr.querySelector(".container")
        this.$slider = this.sr.querySelector(".slider")
        this.$label = this.sr.querySelector(".label")
        this.$number = this.sr.querySelector(".number")

        this.$slider.oninput = (e) => {
            this.value = this.$slider.value
        }

        this.min = 0
        this.max = Infinity
        this.step = 1
        this.value = 0
    }
    connectedCallback() {
        this.min = 0
        this.max = Infinity
        this.step = 1
        this.value = 50
    }

    attributeChangedCallback(k, old, v) {
        switch(k) {
            case "min":
            case "max":
            case "step":
            case "value":
                try {
                    v = parseFloat(v)
                }
                catch {
                    if(v == Infinity) v = Infinity
                    else if(v == -Infinity) v = -Infinity
                    else throw TypeError(`cannot parse ${v} as a number or infinity`)
                }
                break
        }

        switch(k) {
            case "min":
            case "max":
                if(typeof v !== "number") {
                    this[k] = Infinity
                    break
                }
                if(Number.isNaN(v)) throw new TypeError("cannot be NaN")
                // slider ranges cannot be infinity
                if(v === -Infinity) {
                    this.$slider.min = -100
                    break
                }
                else if(v === Infinity) {
                    this.$slider.max = 100
                    break
                }

                this.$slider[k] = v
                break
            case "value":
                console.log(v)
                let p
                if(v <= this.$slider.min) p = 0
                if(v >= this.$slider.max) p = 100
                else p = (this.$slider.value-this.$slider.min) / (this.$slider.max-this.$slider.min) * 100
                this.$container.style.setProperty("--percent",  p+"%")
                break
        }
    }

    static get observedAttributes() {
        return ["min", "max", "step", "value"]
    }

    get sr() {
        return this.shadowRoot
    }
}
customElements.define("px-slider", SliderElement)