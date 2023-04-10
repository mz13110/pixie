DialogExtensionRegistry.add({
    id: "actions",
    apply: function(target) {
        if("actions" in target) throw "unable to apply dialog extension actions: a property called actions already exists on the target"
        if("$actions" in target) throw "unable to apply dialog extension actions: a property called $actions already exists on the target"
        if("addActions" in target) throw "unable to apply dialog extension actions: a function called addActions already exists on the target"

        getCSS("dialog/extensions/actions").then((css)=>target.$.appendChild(css))

        target.$actions = document.createElement("div")
        target.$actions.classList.add("dialog-actions")
        target.$.appendChild(target.$actions)

        // make sure the $actions is always last child
        let forceLastObserver = new MutationObserver(function() {
            if(target.$.lastChild !== target.$actions) target.$.appendChild(target.$actions)
        })
        forceLastObserver.observe(target.$, {attributes: false, childList: true, subtree: false})

        target.actions = {}
        target.addActions = function(...actions) {
            for(let {id, name, listeners} of actions) {
                if(id in target.actions) throw `an action with id ${id} already exists`

                name = name ?? "untitled"
                listeners = listeners ?? []

                let $ = document.createElement("div")
                $.classList.add("dialog-action", "button")
                $.dataset.id = id
                $.innerText = name
                $.onclick = () => listeners.map((f)=>f())
                target.$actions.appendChild($)

                target.actions[id] = {id, name, listeners}
            }
        }
    }
})