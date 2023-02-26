class PencilTool extends Tool {
    drawing = false
    constructor() {
        super("Pencil", "pencil", "solid;pencil", {size: 1})
    }

    onDown(c, x, y) {
        this.drawing = true
        this.onMove(c, x, y)
    }
    onMove(c, x, y) {
        if(this.drawing) c.set(x, y)
    }
    onUp() {
        this.drawing = false
    }
}
class EraserTool extends Tool {
    erasing = false
    constructor() {
        super("Eraser", "eraser", "solid;eraser", {size: 1})
    }

    onDown(c, x, y) {
        this.erasing = true
        this.onMove(c, x, y)
    }
    onMove(c, x, y) {
        if(this.erasing) c.del(x, y)
    }
    onUp() {
        this.erasing = false
    }
}
class BucketTool extends Tool {
    constructor() {
        super("Bucket Fill", "bucket", "solid;color-fill")
    }
}

ToolRegistry.add(new PencilTool(), new EraserTool())