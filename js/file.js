class File {
    static newDefaults = {
        size: {width: IMAGE_DEFAULT_WIDTH, height: IMAGE_DEFAULT_HEIGHT},
        keep: {colors: true}
    }
    static keeps = {
        colors: ["colorpicker", "palettemanager"]
    }
    static new(size, keep) {
        size = Object.assign(this.newDefaults.size, size)
        keep = Object.assign(this.newDefaults.keep, keep)

        let def = {}
        for(let [n, v] of Object.entries(keep)) {
            if(v) {
                for(let k of this.keeps[n] ?? []) {
                    let o = def
                    for(let dir of k.split(".").slice(0, -1)) {
                        if(dir in o) o = o[dir]
                        else o = (o[dir] = {})
                    }

                    o[k.split(".").pop()] = Editor.state.get(k)
                }
            }
        }

        Editor.hasSavedOrExported = false
        Editor.bus.call("canvas.clear")
        Editor.state.load(JSON.stringify(Object.assign(def, {
            canvas: {
                size: {
                    width: size.width,
                    height: size.height
                }
            }
        })))
    }


    static export(name, download) {
        name = name ?? Editor.filename
        Editor.hasSavedOrExported = true
        
        let buf = Buffer.from(Editor.layers[0])
        for(let layer of Editor.layers.slice(1)) {
            throw new NotImplementedLayer("squashing all layers together is not implemented in File.export() (only one layer is supported at time of writing this)")
        }

        let {width, height} = Editor.state.get("canvas.size")
        let img = new PNGImage(width, height)

        img.png.data.set(buf)
        buf = PNG.sync.write(img.png)

        if(download) window.download(buf, name, IMAGE_MIME_TYPE)
        return buf
    }

    static save(name, download) {
        Editor.filename = name ?? Editor.filename
        let blob = PNGImage.injectInfo(this.export(name, false), {state: Editor.state.export()})
        if(download) window.download(blob, name ?? Editor.filename, IMAGE_MIME_TYPE)

        return blob
    }
}
Editor.bus.def("file.new", (ev) => File.new(ev.data.size, ev.data.keep))
Editor.bus.def("file.export", (ev) => File.export(ev.data.name, ev.data.download))
Editor.bus.def("file.save", (ev) => File.save(ev.data.name, ev.data.download))

// menubar
Menubar.addSection("file", "File")
Menubar.addItems(
    {name: "New", icon: "bxs-file-plus",       id: "file.new",         listeners: [()=>UI.pushModal(new NewFileDialog())]},
    {name: "Open", icon: "bxs-file-import",    id: "file.open",        disabled: true},
    {name: Menubar.SEPARATOR,                  id: "file"},
    {name: "Save", icon: "bxs-save",           id: "file.save",        listeners: [()=>Editor.hasSavedOrExported ? Editor.bus.call("file.save", {name: Editor.filename, download: true}) : UI.pushModal(new SaveFileDialog())]},
    {name: "Save As",                          id: "file.saveas",      listeners: [()=>UI.pushModal(new SaveFileDialog())]},
    {name: "Export", icon: "bxs-file-export",  id: "file.export",      listeners: [()=>Editor.hasSavedOrExported ? Editor.bus.call("file.export", {name: Editor.filename, download: true}) : UI.pushModal(new ExportFileDialog())]},
    {name: "Export As",                        id: "file.exportas",    listeners: [()=>UI.pushModal(new ExportFileDialog())]},
    {name: Menubar.SEPARATOR,                  id: "file"},
    {name: "Image Options", icon: "bxs-image", id: "file.fileoptions", disabled: true},
)