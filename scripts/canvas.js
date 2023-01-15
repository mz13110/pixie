class Canvas {
    constructor(w, h) {
        let e = document.createElement("canvas")
        this.e = e
        e.width = Math.ceil(w)
        e.height = Math.ceil(h)
        e.classList.add("canvas")
    
        let drawing = false
    
        let ctx = e.getContext("2d")
        
        function set(x, y) {
            ctx.fillStyle = e.getAttribute("fill")
            ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1)
        }
        function erase(x, y) {
            ctx.clearRect(Math.floor(x), Math.floor(y), 1, 1)
        }

        e.onmousedown = (ev) => {
            let rect = e.getBoundingClientRect()
            drawing = true
            set((e.width / rect.width) * ev.offsetX, (e.height / rect.height) * ev.offsetY)
        }
        e.onmousemove = (ev) => {
            if(!drawing) return
            let rect = e.getBoundingClientRect()
            set((e.width / rect.width) * ev.offsetX, (e.height / rect.height) * ev.offsetY)
        }
        e.onmouseup = () => drawing = false
        e.onmouseleave = () => drawing = false

        e.oncontextmenu = () => false // disable right click context menu
    }
}

