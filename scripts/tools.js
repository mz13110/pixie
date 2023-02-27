class PencilTool extends Tool {
    drawing = false
    constructor() {
        super("Pencil", "pencil", "bxs-pencil", {
            "size": {name: "Size", type: "slider", min: 1, default: 1},
            "line": {name: "Line", type: "boolean", default: false}
        })
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
        super("Eraser", "eraser", "bxs-eraser", {
            "size": {name: "Size", type: "slider", min: 1, default: 1},
            "line": {name: "Line", type: "boolean", default: false}
        })
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
        super("Bucket Fill", "bucket", "bxs-color-fill", {
            "diagonal_neighbors": {name: "Diagonal Neighbors", type: "checkbox", default: false},
            "threshold": {name: "Threshold", type: "slider", min: 0, max: 100, default: 90}
        })
    }
}

ToolRegistry.add(new PencilTool(), new EraserTool(), new BucketTool())