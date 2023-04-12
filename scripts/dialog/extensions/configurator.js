DialogExtensionRegistry.add({
    id: "configurator",
    apply: function(target) {
        if("configuratorTree" in target) throw "unable to apply dialog extension configurator: a property called configuratorTree already exists on the target"
        if("addSections" in target) throw "unable to apply dialog extension configurator: a function called addSections already exists on the target"
        if("addFields" in target) throw "unable to apply dialog extension configurator: a function called addFields already exists on the target"

        getCSS("dialog/extensions/configurator").then((css)=>target.$.appendChild(css))

        target.configuratorTree = {}
        target.getConfiguratorItem = function(id) {
            let o = target.configuratorTree
            for(let k of id.split(".")) {
                if(k in o) o = o[k]
                else o = undefined
            }
            return o
        }
        target.addConfiguratorItems = function(...items) {
            for(let item of items) {
                if(typeof item["id"] !== "string") throw "item is missing string id"
                if(typeof item["_type"] !== "string") throw "item is missing type (section, field, etc.)"
    
                let o = target.configuratorTree
                let parts = item.id.split(".")
                for(let k of parts.slice(0,-1)) {
                    if(k in o) o = o[k]
                    else throw `unable to add configurator item with id ${id} because its requested parent does not exist`
                }
                if(parts[parts.length-1] in o) throw `a configurator item with id ${id} is already registered`
                o[parts[parts.length-1]] = item
            }
        }
        target.addSections = function(...sections) {
            for(let {id, name, fields} of sections) {
                if(target.getConfiguratorItem(id) !== undefined) throw `a configurator item with id ${id} is already registered`

                fields = fields ?? []

                let $header = document.createElement("div")
                $header.classList.add("configurator-header")
                $header.innerText = name
                target.$.appendChild($header)

                let $ = document.createElement("div")
                $.classList.add("configurator-section", "configurator-item")
                $.dataset.id = id.split(".").shift()
                $.dataset.fullId = id
                target.$.appendChild($)

                target.addConfiguratorItems({id, name, $, $header, fields, _type: "section"})
                target.addFields(...fields)
            }
        }
        target.addFields = function(...fields) {
            for(let {id, name, field} of fields) {
                if(target.getConfiguratorItem(id) !== undefined) throw `a configurator item with id ${id} is already registered`
                let parent = target.getConfiguratorItem(id.split(".").slice(0,-1).join("."))

                let $ = document.createElement("div")
                $.classList.add("configurator-field", "configurator-item")
                $.dataset.id = id.split(".").shift()
                $.dataset.fullId = id

                switch(field.type) {
                    case "slider": {
                        field = Object.assign({min: 0, max: 100, step: 1, input: true}, field)
                        field.default = field.default ?? field.min
                        field.listeners = Object.assign({change: []}, field.listeners ?? {})

                        $.dataset.type = "slider"
                        $.dataset.input = field.input

                        let $s = document.createElement("input")
                        let $i
                        $s.type = "range"
                        $s.min = field.min
                        $s.max = field.max
                        $.appendChild($s)

                        function setValue(v) {
                            $s.value = v
                            if(field.input) $i.value = v
                            value = v
                            field.listeners.change.map((f)=>f(v))
                        }

                        $s.setValue = setValue
                        $s.oninput = (e) => setValue(Math.clamp($s.value, field.min, field.max))

                        if(field.input) {
                            $i = document.createElement("input")
                            $i.type = "number"
                            $.min = field.min
                            $.max = field.max

                            let value = field.default

                            $i.setValue = setValue
                            $i.oninput = () => {
                                let n
                                if(!Number.isNaN((n = parseFloat($i.value)))) setValue(n)
                            }
                            $i.onchange = (e) => setValue(Math.clamp(value, field.min, field.max))

                            $.appendChild($i)
                        }
                        setValue(field.default)
                        break
                    }
                    case "number": {
                        field = Object.assign({min: 0, max: Infinity, step: 1}, field)
                        field.default = field.default ?? (field.min === -Infinity ? 0 : field.min)
                        field.listeners = Object.assign({input: []}, field.listeners ?? {})

                        $.dataset.type = "number"

                        let $i = document.createElement("input")
                        $i.type = "number"
                        $.min = field.min
                        $.max = field.max

                        let value = field.default
                        function setValue(v) {
                            $i.value = v
                            value = v
                            field.listeners.change.map((f)=>f(v))
                        }
                        setValue(field.default)

                        $i.oninput = () => {
                            let n
                            if(!Number.isNaN((n = parseFloat($i.value)))) setValue(n)
                        }
                        $i.onchange = (e) => setValue(Math.clamp(Math.round(value / field.step) * field.step, field.min, field.max))

                        $.appendChild($i)
                        break
                    }
                    case "bool": {
                        field = Object.assign({default: false}, field)
                        field.listeners = Object.assign({input: []}, field.listeners ?? {})

                        $.dataset.type = "bool"

                        let $i = document.createElement("input")
                        $i.type = "checkbox"
                        $i.checked = !!field.default

                        $i.onchange = (e) => field.listeners.change.map((f)=>f($i.checked))

                        $.appendChild($i)
                        break
                    }
                    default: {
                        throw `unknown configurator field type "${field.type}"`
                    }
                }

                let $name = document.createElement("div")
                $name.classList.add("configurator-name")
                $name.innerText = name
                
                parent.$.appendChild($name)
                parent.$.appendChild($)

                target.addConfiguratorItems({id, name, $, field, _type: "field"})
            }
        }
    }
})