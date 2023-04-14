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


    static export() {

    }

    static save() {
        
    }
}
Editor.bus.def("file.new", (ev) => File.new(ev.data.size, ev.data.keep))

// menubar
Menubar.addSection("file", "File")
Menubar.addItems(
    {name: "New", icon: "bxs-file-plus", id: "file.new", listeners: [()=>UI.pushModal(new NewFileDialog())]},
    {name: "Open", icon: "bxs-file-import", id: "file.open", disabled: true},
    {name: Menubar.SEPARATOR, id: "file"},
    {name: "Save", icon: "bxs-save", id: "file.save", disabled: true},
    {name: "Save As", id: "file.saveas", disabled: true},
    {name: "Export", icon: "bxs-file-export", id: "file.export", disabled: true},
    {name: "Export As", id: "file.exportas", disabled: true},
    {name: Menubar.SEPARATOR, id: "file"},
    {name: "Image Options", icon: "bxs-image", id: "file.fileoptions", disabled: true},
)