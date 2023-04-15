class ExportFileDialog extends Dialog {
    constructor() {
        super()

        this.icon = "bxs-file-export"
        this.name = "Export File"

        this.addExtensions("closebutton", "configurator", "actions")

        let name = Editor.filename


        this.addSections(
            {id: "options", name: "Options", fields: [
                {id: "options.filename", name: "Name", field: {type: "text", variant: "s", after: "."+IMAGE_EXTENSION, align: "left", default: name, validate: (s)=>true, listeners: {change: [(v)=>name = v]}}},
            ]}
        )

        this.addActions(
            {id: "ok", name: "Export", listeners: [() => {
                Editor.bus.call("file.export", {name, download: true})
                this.close()
            }]},
            {id: "cancel", name: "Cancel", listeners: [this.close.bind(this)]}
        )
    }
}
customElements.define("px-exportfile-dialog", ExportFileDialog)