class Editor {
    static state = new State("EditorState")
    static bus = new Bus("EditorBus")

    // first layer is bottommost one
    static layers = []

    static filename = "pixie"
}