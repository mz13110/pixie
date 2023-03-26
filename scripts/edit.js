window.undo = () => {

}
window.redo = () => {
    
}

//menubar
Menubar.addSection("edit", "Edit")
Menubar.addItems(
    {name: "Undo", icon: "bx-undo", id: "edit.undo", disabled: true},
    {name: "Redo", icon: "bx-redo", id: "edit.redo", disabled: true},
    {name: Menubar.SEPARATOR, id: "edit"},
    {name: "Preferences", icon: "bxs-cog", id: "edit.preferences", disabled: true}
)
