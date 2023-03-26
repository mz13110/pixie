let $menubar = document.querySelector(".menubar")

const SEPARATOR = Symbol("separator")

class Menubar {
    static get SEPARATOR() {
        return SEPARATOR
    }

    static items = {}
    static sections = {}

    static browsing = false

    static addSection(id, name, items) {
        if(!(id in this.sections)) {
            let $ = document.createElement("div")
            $.innerText = name
            $.dataset.id = id
            $.classList.add("menubar-section")
            $.onmouseenter = () => {
                if(this.browsing) {
                    this.closeAll()
                    this.open(id)
                }
            }
            $.onclick = (e) => {
                e.stopPropagation()
                this.closeAll()

                if(this.browsing) {
                    this.browsing = false

                    if($.dataset.open === "true") this.close(id)
                    else if(e.pointerType !== "mouse") this.open(id)
                }
                else {
                    this.open(id)
                    this.browsing = true
                }
            }

            let $c = document.createElement("div")
            $c.classList.add("menubar-section-container")
            $.appendChild($c)

            let popper = Popper.createPopper($, $c, {
                placement: "bottom-start",
                modifiers: [
                    {name: "eventListeners", enabled: false} // disable event listeners to save performance (will reenable when opened)
                ]
            })

            $menubar.appendChild($)
            this.sections[id] = {id, name, $, $c, popper}
        }
        this.addItems(...(items ?? []))
    }
    static addItems(...items) {
        for(let item of items) {
            let {name, icon, id: fullId, disabled, listeners} = item
            if(name === SEPARATOR) {
                let $ = document.createElement("div")
                $.classList.add("menubar-separator")

                $.onclick = (e) => e.stopPropagation()

                this.sections[fullId.split(".")[0]].$c.appendChild($)

                continue
            }

            listeners = listeners ?? []
            icon = icon ?? "-"

            let [section, id] = fullId.split(".")

            if(fullId in this.items) throw `item with id ${id} already exists`
            if(!(section in this.sections)) throw `section ${section} doesnt exist`

            let $ = document.createElement("div")
            $.dataset.id = id
            $.dataset.disabled = disabled === true
            $.classList.add("menubar-item")
            $.onclick = (e) => {
                e.stopPropagation()

                if($.dataset.disabled === "true") return

                this.close(section)
                listeners.map((l) => l())
            }
            $.appendChild(window.iconClass2Icon(icon, "#ffffff"))
            $.appendChild(Object.assign(document.createElement("span"), {innerText: name}))
            this.sections[section].$c.appendChild($)

            this.items[fullId] = {name, icon, id: fullId, $, listeners}
            if(disabled === true) this.disableItem(fullId)
        }
    }

    static open(id) {
        let section = this.sections[id]

        if(typeof section !== "object") return
        
        section.$.dataset.open = true
        section.popper.setOptions((options) => ({
            ...options,
            modifiers: [
              ...options.modifiers,
              {name: "eventListeners", enabled: true},
            ],
        }))
    }

    static close(id) {
        let section = this.sections[id]

        if(typeof section !== "object") return

        section.$.dataset.open = false
        section.popper.setOptions((options) => ({
            ...options,
            modifiers: [
              ...options.modifiers,
              {name: "eventListeners", enabled: false},
            ],
        }))
    }
    static closeAll() {
        for(let section of Object.keys(this.sections)) this.close(section)
    }


    static disableItem(id) {
        let $ = this.items[id].$
        $.dataset.disabled = true
        $.querySelector("box-icon").setAttribute("color", getComputedStyle($).getPropertyValue("--text-disabled"))
    }
}

window.addEventListener("click", () => {
    Menubar.closeAll()
    Menubar.browsing = false
})