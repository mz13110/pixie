class SaveFileDialog extends ExportFileDialog {
    constructor() {
        super()

        this.name = "Save File"
        
        throw new NotImplementedError("dialogs/savefile.js is not done")
    }
}
customElements.define("px-savefile-dialog", SaveFileDialog)