DialogExtensionRegistry.add({
    id: "closebutton",
    apply: (target) => {
        if("close" in target.buttons) throw "unable to apply closebutton dialog extension: a button with id close is already registered"
        target.addButtons({id: "close", icon: "bx-x", listeners: [target.close.bind(target)]})
    }
})