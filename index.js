function xport(pixels) {
    const BRAILLE_CHARS = "⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿".split("")
    const toSingle = (pix) => this.BRAILLE_CHARS[new Array(6).reduce((a,_,i) => pix[i] ? a + (2**i) : a)]
}

function canvas(w, h, onChanged) {
    let el = document.createElement("canvas")
    el.width = Math.ceil(w/6)*6
    el.height = Math.ceil(h/6)*6

    let drawing = false

    let ctx = el.getContext("2d")
    
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, el.width, el.height)
    function set(x, y) {
        ctx.fillStyle = el.getAttribute("fill")
        ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1)

        if(onChanged) onChanged()
    }
    el.onmousedown = (e) => {
        let rect = el.getBoundingClientRect()
        drawing = true
        set((el.width / rect.width) * e.offsetX, (el.height / rect.height) * e.offsetY)
    }
    el.onmousemove = (e) => {
        if(!drawing) return
        let rect = el.getBoundingClientRect()
        set((el.width / rect.width) * e.offsetX, (el.height / rect.height) * e.offsetY)
    }
    el.onmouseup = () => drawing = false
    el.onmouseleave = () => drawing = false

    return el
}

let cv = canvas(12, 12, () => {
    let img = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height, {colorSpace: "srgb"}).data
    img = new Array(img.length / 4).fill(null).map((_,i) => img[i*4] < 127)
    img = new Array(cv.height).fill(null).map((_,i) => img.slice(i*cv.width, (i+1)*cv.width))
    document.querySelector("p").innerText = xport(img)
})
cv.setAttribute("fill", "#000000")
document.body.appendChild(cv)