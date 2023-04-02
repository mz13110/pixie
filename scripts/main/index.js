let $ = document.querySelector(".main").$

GlobalState.sub("toolbox.selection", (v) => {
    $.querySelector("px-tool-info").tool = ToolRegistry.get(v)

    $.querySelector("px-canvas").tool = ToolRegistry.get(v)
})
if(!GlobalState.get("toolbox.selection")) GlobalState.set("toolbox.selection", "pencil")

$.querySelector("px-palette-manager").$section = $.querySelector("px-palette-manager").parentElement
$.querySelector("px-tool-info").$section = $.querySelector("px-tool-info").parentElement