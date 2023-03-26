class PNG {
    static get SIGNATURE() {return [137, 80, 78, 71, 13, 10, 26, 10]}
    static get IEND() {return [0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]}

    static get IHDR_LEGAL_COLOR_TYPES() {return [0, 2, 3, 4, 6]}
    static get IHDR_LEGAL_BIT_DEPTHS() {return [1, 2, 4, 8, 16]}
    static get IHDR_LEGAL_BIT_DEPTH_COMBOS() {return [[1,2,4,8,16],[],[8,16],[1,2,4,8],[8,16],[],[8,16]]}
    static get IHDR_COMPRESSION_METHODS() {return ["deflate32k"]}
    static get IHDR_FILTERING_METHODS() {return ["adaptive"]}
    static get IHDR_INTERLACING_METHODS() {return ["none", "adam7"]}

    static readChunks(data) {
        const signature = PNG.SIGNATURE.slice()

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
    static async readChunksAsync(data) {
        if(typeof data[Symbol.iterator] === "function" || data instanceof ArrayBuffer) return PNG.readChunks(new Uint8Array(data))
        else if(data instanceof Blob) return PNG.readChunks(await data.arrayBuffer())
        else throw `unable to process ${data} as png`
    }
    static saveChunks(chunks) {
        let idatEncountered = false
        let iendEncountered = false
        let i = 0

        let out

        function finish() {
            if(!idatEncountered) throw "missing IDAT"

            out = new Uint8Array(PNG.SIGNATURE.length + packedChunks.reduce((a, c) => a + c.length, 0) + PNG.IEND.length)
            i = 0

            out.set(PNG.SIGNATURE, i)
            i += PNG.SIGNATURE.length

            for(let chunk of packedChunks) {
                out.set(chunk, i)
                i += chunk.length
            }

            out.set(PNG.IEND, i)
        }

        let packedChunks = []

        for(let chunk of chunks) {
            let type = chunk.type

            if(i === 0 && type !== "IHDR") throw "missing IHDR as first chunk"
            if(type === "IEND") {
                finish()
                break
            }
            if(type === "IDAT") idatEncountered = true

            if(typeof type !== "string") throw "chunk type is not a string"
            if(type.length !== 4) throw "chunk type is not four characters"

            let typeRaw = new Array(4).fill().map((_,i) => type.charCodeAt(i))
            if(typeRaw.map((c) => (c < 65 || c > 90) && (c < 97 || c > 122)).includes(true)) throw "chunk type can only have ascii letters (a-z A-Z)"

            // assemble data field
            let chunkData = chunk.raw
            if("raw" in chunk) {
                if(typeof chunkData[Symbol.iterator] === "function" || chunkData instanceof ArrayBuffer) chunkData = new Uint8Array(chunkData)
                else throw `cannot process ${chunkData} as chunk data`
            }
            else {
                switch(type) {
                    case "tEXt": {
                        let keyword = String(chunk.data.keyword)
                        if(keyword.startsWith(" ") || keyword.endsWith(" ")) throw "keyword cannot have trailing or leading spaces"
                        if(/ {2,}/.test(keyword)) throw "keyword cannot have consecutive spaces"
                        keyword = keyword.split("").map((c) => c.charCodeAt())
                        if(keyword.map((c) => (c < 32 || c > 126) && (c < 161 || c > 255)).includes(true)) throw "keyword can only have printable latin-1 characters (no NBSP allowed)"

                        let text = String(chunk.data.text)
                        text = text.split("").map((c) => c.charCodeAt())
                        if(text.map((c) => c > 255).includes(true)) throw "text can only have latin-1 characters"

                        chunkData = new Uint8Array(keyword.length + 1 + text.length)
                        chunkData.set(keyword, 0)
                        chunkData[keyword.length] = 0x00 // null separator
                        chunkData.set(text, keyword.length+1)

                        break
                    }
                    default: {
                        throw `unable to encode data for ${type} chunk (probably not implemented)`
                    }
                }
            }
            let chunkLength = chunkData.length

            let data = new Uint8Array(4 + 4 + chunkLength + 4)
            data.set(uint32ToUint8ArrayBE(chunkLength), 0)
            data.set(typeRaw, 4)
            data.set(chunkData, 8)
            let checksum = crc32(data.slice(4, -4)) // checksum only includes chunk type and data fields, no length field
            data.set(uint32ToUint8ArrayBE(checksum), 8 + chunkLength)

            packedChunks.push(data)
            i++
        }
        if(!iendEncountered) finish()

        return out
    }
}