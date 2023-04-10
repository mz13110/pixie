window.cache = {}
window.pendingFetches = {}

window.cachedFetch = async (path, basePath) => {
    basePath = basePath ?? document.baseURI
    console.assert(basePath !== false)
    path = new URL(path, basePath).href

    let css
    if(path in window.cache) css = window.cache[path]
    else {
        // dont create a new fetch if a previous one is pending
        if(!(path in window.pendingFetches)) window.pendingFetches[path] = new Promise(async (resolve, reject) => {
            let res = await fetch(path)
            let blob = await res.blob()
            let isCSS = blob.type === "text/css"
            let isText = isCSS || blob.type.startsWith("text/") || blob.type === "application/javascript" || blob.type === "application/json"

            let text
            if(isText) {
                text = await blob.text()
                if(isCSS) blob = new Blob([(text = `/*\n * ${path}\n * recursive css caching\n */\n\n` + await cacheCSSURLs(text, path))], {type: "text/css"})
            }

            resolve(isText ? {isText, isCSS, text: text, blob, url: URL.createObjectURL(blob)} : {isText, isCSS, blob, url: URL.createObjectURL(blob)})
            delete window.pendingFetches[path]
        })
        css = await window.pendingFetches[path]
        window.cache[path] = css
    }
    return css
}


window.cacheCSSURLs = async (css, basePath) => {
    basePath = basePath ?? document.baseURI

    let match
    let i = 0

    let regex = /(url\(['"]?)([^'"\)\s>]+)(['"]?\))/ig
    let p = []
    while((match = regex.exec(css)) !== null) {
        if(match.index === regex.lastIndex) regex.lastIndex++

        let a = match[1], url = match[2], b = match[3]
        let o = match.index
        let j = i
        p.push(new Promise(async (resolve, reject) => {
            let newUrl = (await cachedFetch(url, basePath)).url
            resolve(css.substring(j, o) + `/*${a + url.replaceAll("*/", "*\\") + b}*/` + a + newUrl + b)
        }))
        i = match.index + match[0].length
    }
    return (await Promise.all(p)).join("") + css.substring(i)
}
window.getCSS = async (path, isShorthand, basePath) => {
    let $ = document.createElement("style")
    $.innerHTML = (await cachedFetch(((isShorthand??true) ? `/styles/${path}.css` : path), basePath)).text
    return $
}
window.getJS = async (path, module, isShorthand, basePath) => {
    module = module ?? false

    let $ = document.createElement("script")
    $.innerHTML = (await cachedFetch(((isShorthand??true) ? `/scriptss/${path}.js` : path), basePath)).text
    $.module = module
    return $
}