window.styleCache = {}
window.pendingStyles = {}

window.fetchCSS = async (path, isShorthand, basePath) => {
    isShorthand = isShorthand ?? true
    basePath = basePath ?? document.baseURI
    if(isShorthand) path = `/styles/${path}.css`
    path = new URL(path, basePath).href

    let css
    if(path in styleCache) css = styleCache[path]
    else {
        // dont create a new fetch if a previous one is pending
        if(!(path in pendingStyles)) pendingStyles[path] = new Promise(async (resolve, reject) => {
            let res = await fetch(path)
            let css
            if(res.headers.get("Content-Type") === "text/css") css = await cacheCSSURLs(`/*\n * ${path}\n * recursive css caching by css.js\n */\n\n` + await res.text(), path)
            else css = await res.text()
            let blob = new Blob([css], {type: res.headers.get("Content-Type")})
            delete pendingStyles[path]
            resolve({text: css, blob, url: URL.createObjectURL(blob)})
        })
        css = await pendingStyles[path]
        styleCache[path] = css
    }
    return css
}
window.cacheCSSURLs = async (css, basePath) => {
    basePath = basePath ?? document.baseURI

    let match
    let i = 0

    let regex = /(?:url\()['"]?([^'"\)\s>]+)/ig
    let p = []
    while((match = regex.exec(css)) !== null) {
        if(match.index === regex.lastIndex) regex.lastIndex++

        let url = match[1]

        let mi = match.index
        let j = i
        p.push(new Promise(async (resolve, reject) => {
            url = (await fetchCSS(url, false, basePath)).url
            resolve(css.substring(j, mi + "url(".length) + url)
        }))
        i = match.index + match[0].length
    }
    return (await Promise.all(p)).join() + css.substring(i)
}
window.getCSS = async (path, isShorthand, basePath) => {
    let $ = document.createElement("style")
    $.innerHTML = (await fetchCSS(path, isShorthand, basePath)).text
    return $
}