class NewFileDialog extends Dialog {
    constructor() {
        super()

        this.icon = "bxs-file-plus"
        this.name = "New File"

        this.addExtensions("closebutton", "configurator", "actions")

        let {width, height} = Editor.state.get("canvas.size")

        
        this.addSections(
            {id: "size", name: "Image Size", fields: [
                {id: "size.width", name: "Width", field: {type: "number", min: IMAGE_MIN_SIZE, max: IMAGE_MAX_SIZE, step: 1, default: width, listeners: {input: []}}},
                {id: "size.height", name: "Height", field: {type: "number", min: IMAGE_MIN_SIZE, max: IMAGE_MAX_SIZE, step: 1, default: height, listeners: {input: []}}}
            ]}
        )

        this.addActions(
            {id: "ok", name: "OK"},
            {id: "cancel", name: "Cancel"}
        )
    }
}
customElements.define("px-newfile-dialog", NewFileDialog)