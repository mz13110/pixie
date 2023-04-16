window.loaded.then(() => {
    getCSS("base").then((css)=>document.body.appendChild(css))
    UI.pushModal(new MainModal())
    UI.pushModal(new SaveFileDialog())
})