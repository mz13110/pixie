class File {
    static save() {
        
    }

    static export() {

    }
}

//menubar
Menubar.addSection("file", "File")
Menubar.addItems(
    {name: "New", icon: "bxs-file-plus", id: "file.new", disabled: true},
    {name: "Open", icon: "bxs-file-import", id: "file.open", disabled: true},
    {name: Menubar.SEPARATOR, id: "file"},
    {name: "Save", icon: "bxs-save", id: "file.save", disabled: true},
    {name: "Save As", id: "file.saveas", disabled: true},
    {name: "Export", icon: "bxs-file-export", id: "file.export", disabled: true},
    {name: "Export As", id: "file.exportas", disabled: true},
    {name: Menubar.SEPARATOR, id: "file"},
    {name: "Canvas Size", icon: "bxs-rectangle", id: "file.canvassize", disabled: true},
)
