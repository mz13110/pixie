const PNG_SIGNATURE = Object.freeze([137, 80, 78, 71, 13, 10, 26, 10])
const PNG_IEND = Object.freeze([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])

const PNG_COLOR_TYPE_RGBA = 6

const PNG_EDITOR_DATA_CHUNK_TYPE = "pxJS"

class PNGImage {
    png = null
    info = {}

    constructor(raw) {
        if(typeof raw[Symbol.iterator] === "function" || raw instanceof ArrayBuffer || typeof raw === "string") raw = Buffer.from(raw)
        else if(!Buffer.isBuffer(raw)) throw `unable to convert ${raw} to a buffer object`

        this.info = PNGImage.extractInfo(raw)
        this.png = PNG.sync.read(raw)
        PNG.adjustGamma(this.png)
    }

    static extractInfo(raw) {
        if(!Buffer.isBuffer(raw)) throw "input to PNGImage.extractInfo() should be a buffer"

        let info = {}

        let o = 0

        try {
            for(let byte of PNG_SIGNATURE) {
                if(raw.readUInt8(o) !== byte) throw "bad png signature"
                o += 1
            }
            while(true) {
                let length = raw.readUInt32BE(o); o += 4
                let realCRC = crc32(raw.slice(o, o + length + 4))
                let type = new Array(4).fill().reduce((a) => a + String.fromCharCode(raw.readUInt8(o++)), "")
                let data = raw.slice(o + 1, (o += length) + 1)

                let crc = raw.readUInt32BE(o); o += 4
                if(crc !== realCRC) throw "bad checksum"

                if(type === "IEND") break
                else if(type === PNG_EDITOR_DATA_CHUNK_TYPE) {
                    let keyword
                    let keywordLength = data.readUInt8()
                    if(typeof keywordLength !== "number" || keywordLength < 1) throw "invalid pxJS keyword length"
                    try {
                        keyword = new TextDecoder("", {fatal: true}).decode(data.slice(1, keywordLength + 1)).toLowerCase()
                    }
                    catch(e) {
                        throw "unable to decode pxJS keyword"
                    }

                    if(keyword in info) throw `pxJS with keyword ${keyword} already declared`
                    if(keyword.startsWith("__") && keyword.endsWith("__")) throw `keywords starting and ending with "__" cannot be used in pxJS for security reasons, got keyword ${keyword}`

                    let data
                    try {
                        data = JSON.parse(new TextDecoder("", {fatal: true}).decode(data.slice(1 + keywordLength)))
                    }
                    catch(e) {
                        throw "unable to decode pxJS data as JSON"
                    }
                }
            }
        }
        catch(e) {
            if(e instanceof RangeError) throw "unexpected EOF"
            throw e
        }

        return info
    }

    static injectInfo(raw, info) {
        
    }
}

window.decodePNG = (data) => {
    const signature = PNG_SIGNATURE.slice()

    let chunks = []

    let step = 0 // 0: signature, 1: chunk length, 2: chunk type, 3: chunk data, 4: chunk crc
    let i = 0
    let chunkLength = 0
    let chunkType = ""
    let chunkData = new Uint8Array(new ArrayBuffer(0))
    let chunkCrc = 0
    let iendEncountered = false
    let idatEncountered = false

    function process(bytes) {
        for(let byte of bytes) {
            switch(step) {
                case 0: {// signature
                    let b = signature.shift()
                    if(b !== byte) throw "bad or missing signature"
                    if(signature.length === 0) step = 1
                    break
                }
                case 1: {// chunk length
                    if(i === 0) {
                        chunkLength = 0
                        chunkType = ""
                        chunkData = new Uint8Array(0)
                        chunkCrc = 0
                    }
                    chunkLength = (chunkLength * 0x100) + byte // unsigned left shift doesnt exist for some reason
                    if(++i === 4) i = 0, step = 2
                    break
                }
                case 2: {// chunk type
                    chunkType = chunkType + String.fromCharCode(byte)
                    if(++i == 4) {
                        if(chunks.length === 0 && chunkType !== "IHDR") throw "first chunk not IHDR" // first png chunk should always be IHDR
                        if(chunkType === "IDAT") idatEncountered = true
                        i = 0, step = chunkLength === 0 ? 4 : 3
                    }
                    break
                }
                case 3: {// chunk data
                    if(i === 0) chunkData = new Uint8Array(chunkLength)
                    chunkData[i] = byte
                    if(++i == chunkLength) i = 0, step = 4
                    break
                }
                case 4: {// chunk crc
                    chunkCrc = (chunkCrc * 0x100) + byte // unsigned left shift doesnt exist for some reason
                    if(++i === 4) {
                        i = 0
                        let d = new Uint8Array(chunkLength + 4)
                        d[0] = chunkType[0].charCodeAt()
                        d[1] = chunkType[1].charCodeAt()
                        d[2] = chunkType[2].charCodeAt()
                        d[3] = chunkType[3].charCodeAt()
                        d.set(chunkData, 4)
                        if(crc32(d) !== chunkCrc) throw "bad or missing checksum"

                        if(chunkType === "IEND") {
                            iendEncountered = true
                            return
                        }

                        let chunk = {type: chunkType, raw: chunkData}
                        switch(chunkType) {
                            case "tEXt": {
                                let keyword = "", text = ""
                                let parsingKeyword = true
                                for(let byte of chunkData) {
                                    if(parsingKeyword) {
                                        if(byte === 0x00) {
                                            if(keyword === "") throw "tEXt keyword cannot be empty"
                                            parsingKeyword = false
                                            continue
                                        }
                                        keyword += String.fromCharCode(byte)
                                        if(keyword.length >= 80) throw "tEXt keyword must be less than 80 characters"
                                    }
                                    else {
                                        if(byte === 0x00) throw "tEXt text cannot have null character"
                                        text += String.fromCharCode(byte)
                                    }
                                }
                                chunk.data = {keyword, text}
                                break
                            }
                            case "IHDR": {
                                let field = 0 // 0: width (Int32BE), 1: height (Int32BE), 2: compression (Uint8), 3: filter (Uint8), 4: interlace (Uint8), 7: end of stream expected
                                let i = 0
                                let wh = 0

                                chunk.data = {}
                                for(let byte of chunkData) {
                                    switch(field) {
                                        // because width and height are stored the same way, we can simplify by using switch(){} fall-through
                                        case 0:   // width
                                        case 1: { // height
                                            wh = (wh << 8) + byte // use unsigned bitshift because according to the spec, width and height are unsigned

                                            if(++i === 4) {
                                                if(wh > 0x7fffffff) throw "width and height cannot be greater than (2^31)-1"
                                                if(wh < 1) throw "width and height must be at least 1"

                                                if(field === 0) chunk.data.width = wh
                                                else chunk.data.height = wh

                                                wh = 0, i = 0, field++
                                            }
                                            break
                                        }

                                        case 2: { // bit depth
                                            if(!PNG.IHDR_LEGAL_BIT_DEPTHS.includes(byte)) throw `${byte} is not a valid bit depth. valid bit depths are 1, 2, 4, 8, and 16`

                                            chunk.data.bitDepth = byte

                                            field = 3
                                            break
                                        }
                                        case 3: { // color type
                                            if(!PNG.IHDR_LEGAL_COLOR_TYPES.includes(byte)) throw `${byte} is not a valid color type. valid color types are 0, 2, 3, 4, 6`
                                            if(!PNG.IHDR_LEGAL_BIT_DEPTH_COMBOS[byte].includes(chunk.data.bitDepth)) throw `${chunk.data.bitDepth} is not a valid bit depth for color type ${byte}`

                                            chunk.data.color = {
                                                usePalette: byte & 1,
                                                useColor: byte & 2,
                                                useAlpha: byte & 4
                                            }

                                            field = 4
                                            break
                                        }
                                        case 4: // compression method
                                            if(!(byte in PNG.IHDR_COMPRESSION_METHODS)) throw `unrecognized compression method ${byte}` // only one compression method (deflate/inflate with 32k sliding window) is defined by the spec

                                            chunk.data.compression = PNG.IHDR_COMPRESSION_METHODS[byte]

                                            field = 5
                                            break
                                        case 5: // filtering method
                                            if(!(byte in PNG.IHDR_FILTERING_METHODS)) throw `unrecognized filter method ${byte}` // only one filter method (adaptive filtering with five basic filter types) is defined by the spec

                                            chunk.data.filter = PNG.IHDR_FILTERING_METHODS[byte]

                                            field = 6
                                            break
                                        case 6: // interlacing method (if any at all)
                                            if(!(byte in PNG.IHDR_INTERLACING_METHODS)) throw `unrecognized interlacing method ${byte}`

                                            chunk.data.interlacing = PNG.IHDR_INTERLACING_METHODS[byte]

                                            field = 7
                                            break

                                        case 7:
                                            throw `bad or missing IHDR`
                                    }
                                }
                                if(field !== 7 || i !== 0) throw "bad or missing IHDR"
                            }
                        }

                        chunks.push(chunk)
                        step = 1
                    }
                    break
                }
            }
        }
    }
    function finish() {
        if(!iendEncountered) throw "missing IEND"
        if(!idatEncountered) throw "missing IDAT"
    }

    if(typeof data[Symbol.iterator] === "function" || data instanceof ArrayBuffer) process(new Uint8Array(data))
    else if(data instanceof Blob) throw "use readChunksAsync for blobs"
    else throw `unable to process ${data} as png`
    finish()

    return chunks
}
window.decodePNGAsync = async (data) => {
    if(typeof data[Symbol.iterator] === "function" || data instanceof ArrayBuffer) return PNG.readChunks(new Uint8Array(data))
    else if(data instanceof Blob) return PNG.readChunks(await data.arrayBuffer())
    else throw `unable to process ${data} as png`
}