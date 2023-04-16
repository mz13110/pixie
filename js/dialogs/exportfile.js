class ExportFileDialog extends Dialog {
    constructor(skipActions) {
        super()

        this.icon = "bxs-file-export"
        this.name = "Export File"

        this.addExtensions("closebutton", "configurator", "actions")

        this.values = {
            name: Editor.filename
        }

        this.addSections(
            {id: "options", name: "Options", fields: [
                {id: "options.filename", name: "Name", field: {type: "text", variant: "s", after: "."+IMAGE_EXTENSION, align: "left", default: this.values.name, validate: (s)=>true, listeners: {change: [(v)=>this.values.name = v]}}},
            ]}
        )

        if(!skipActions) {
            this.addActions(
                {id: "ok", name: "Export", listeners: [() => {
                    Editor.bus.call("file.export", {name: this.values.name, download: true})
                    this.close()
                }]},
                {id: "cancel", name: "Cancel", listeners: [this.close.bind(this)]}
            )
        }
    }
}
customElements.define("px-exportfile-dialog", ExportFileDialog)