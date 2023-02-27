window.styleCache = {}

window.getCSS = async (path) => {
    let css
    if(path in styleCache) css = styleCache[path]
    else {
        css = await (await fetch(`/styles/${path}.css`)).text()
        styleCache[path] = css
    }

    let e = document.createElement("style")
    e.innerHTML = css
    return e
}