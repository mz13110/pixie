class MainModal extends Modal {
    constructor() {
        super()

        this.$.innerHTML = `
            <px-menubar></px-menubar>

            <div class="main-container">
                <div class="lmenu sidebar">
                    <div class="section">
                        <div class="section-header">
                            ${icon("bxs-color", "section-header-icon")}
                            <span class="section-header-title">Color Picker</span>
                            <div class="section-header-line"></div>
                            <div class="section-header-buttons"></div>
                        </div>
                        <px-color-picker></px-color-picker>
                    </div>
                    <div class="section">
                        <div class="section-header">
                            ${icon("bxs-palette", "section-header-icon")}
                            <span class="section-header-title">Palette Manager</span>
                            <div class="section-header-line"></div>
                            <div class="section-header-buttons"></div>
                        </div>
                        <px-palette-manager></px-palette-manager>
                    </div>
                </div>

                <div class="main">
                    <px-viewport></px-viewport>
                </div>

                <div class="rmenu sidebar">
                    <div class="section">
                        <div class="section-header">
                            ${icon("bxs-briefcase", "section-header-icon")}
                            <span class="section-header-title">Toolbox</span>
                            <div class="section-header-line"></div>
                            <div class="section-header-buttons"></div>
                        </div>
                        <px-toolbox></px-toolbox>
                    </div>
                    <div class="section">
                        <div class="section-header">
                            ${icon("bxs-wrench", "section-header-icon")}
                            <span class="section-header-title">Tool Info</span>
                            <div class="section-header-line"></div>
                            <div class="section-header-buttons"></div>
                        </div>
                        <px-tool-info></px-tool-info>
                    </div>
                </div>
            </div>
        `
        getCSS("modals/main").then((css)=>this.$.appendChild(css))


        Editor.state.sub("toolbox.selection", (v) => {
            this.$.querySelector("px-tool-info").tool = ToolRegistry.get(v)

            this.$.querySelector("px-viewport").$canvas.tool = ToolRegistry.get(v)
        })
        if(!Editor.state.get("toolbox.selection")) Editor.state.set("toolbox.selection", "pencil")

        this.$.querySelector("px-palette-manager").$section = this.$.querySelector("px-palette-manager").parentElement
        this.$.querySelector("px-tool-info").$section = this.$.querySelector("px-tool-info").parentElement
    }
}
customElements.define("px-main-modal", MainModal)