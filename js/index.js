window.loaded.then(() => {
    getCSS("base").then((css)=>document.body.appendChild(css))
    UI.pushModal(document.createElement("px-main-modal"))
})