for(let $e of document.querySelectorAll("template[shadowrootmode]")) {
    let mode = $e.getAttribute("shadowrootmode")
    if(mode === "open" || mode === "closed") {
        let $sr = $e.parentNode.attachShadow({mode})
        $sr.appendChild($e.content)
        $e.remove()
    }
}