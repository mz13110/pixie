class SaveFileDialog extends ExportFileDialog {
    constructor() {
        super(true)

        this.icon = "bxs-save"
        this.name = "Save File"
        this.addActions(
            {id: "ok", name: "Save", listeners: [() => {
                Editor.bus.call("file.save", {name: this.values.name, download: true})
                this.close()
            }]},
            {id: "cancel", name: "Cancel", listeners: [this.close.bind(this)]}
        )
    }
}
customElements.define("px-savefile-dialog", SaveFileDialog)