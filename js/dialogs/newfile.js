class NewFileDialog extends Dialog {
    constructor() {
        super()

        this.icon = "bxs-file-plus"
        this.name = "New File"

        this.addExtensions("closebutton", "configurator", "actions")

        let size = Editor.state.get("canvas.size")
        let keep = {
            colors: File.newDefaults.keep.colors
        }


        this.addSections(
            {id: "size", name: "Image Size", fields: [
                {id: "size.width", name: "Width", field: {type: "number", min: IMAGE_MIN_SIZE, max: IMAGE_MAX_SIZE, step: 1, default: size.width, listeners: {change: [(v)=>size.width = v]}}},
                {id: "size.height", name: "Height", field: {type: "number", min: IMAGE_MIN_SIZE, max: IMAGE_MAX_SIZE, step: 1, default: size.height, listeners: {change: [(v)=>size.height = v]}}}
            ]},
            {id: "advanced", name: "Advanced", fields: [
                {id: "advanced.keepcolors", name: "Keep Current Colors", field: {type: "bool", default: keep.colors, listeners: {change: [(v)=>keep.colors = v]}}}
            ]}
        )

        this.addActions(
            {id: "ok", name: "OK", listeners: [() => {
                Editor.bus.call("file.new", {size, keep})
                this.close()
            }]},
            {id: "cancel", name: "Cancel", listeners: [this.close.bind(this)]}
        )
    }
}
customElements.define("px-newfile-dialog", NewFileDialog)