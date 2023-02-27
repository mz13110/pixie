let cache = {}

window.getCSS = async (path) => {
    let css
    if(path in cache) css = cache[path]
    else {
        css = await (await fetch(`/styles/${path}.css`)).text()
        cache[path] = css
    }

    let e = document.createElement("style")
    e.innerHTML = css
    return e
}