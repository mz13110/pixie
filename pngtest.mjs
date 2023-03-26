const CRC32_TABLE = [0x0,0x77073096,-0x11f19ed4,-0x66f6ae46,0x76dc419,0x706af48f,-0x169c5acb,-0x619b6a5d,0xedb8832,0x79dcb8a4,-0x1f2a16e2,-0x682d2678,0x9b64c2b,0x7eb17cbd,-0x1847d2f9,-0x6f40e26f,0x1db71064,0x6ab020f2,-0xc468eb8,-0x7b41be22,0x1adad47d,0x6ddde4eb,-0xb2b4aaf,-0x7c2c7a39,0x136c9856,0x646ba8c0,-0x29d0686,-0x759a3614,0x14015c4f,0x63066cd9,-0x5f0c29d,-0x72f7f20b,0x3b6e20c8,0x4c69105e,-0x2a9fbe1c,-0x5d988e8e,0x3c03e4d1,0x4b04d447,-0x2df27a03,-0x5af54a95,0x35b5a8fa,0x42b2986c,-0x2444362a,-0x534306c0,0x32d86ce3,0x45df5c75,-0x2329f231,-0x542ec2a7,0x26d930ac,0x51de003a,-0x3728ae80,-0x402f9eea,0x21b4f4b5,0x56b3c423,-0x30456a67,-0x47425af1,0x2802b89e,0x5f058808,-0x39f3264e,-0x4ef416dc,0x2f6f7c87,0x58684c11,-0x3e9ee255,-0x4999d2c3,0x76dc4190,0x1db7106,-0x672ddf44,-0x102aefd6,0x71b18589,0x6b6b51f,-0x60401b5b,-0x17472bcd,0x7807c9a2,0xf00f934,-0x69f65772,-0x1ef167e8,0x7f6a0dbb,0x86d3d2d,-0x6e9b9369,-0x199ca3ff,0x6b6b51f4,0x1c6c6162,-0x7a9acf28,-0xd9dffb2,0x6c0695ed,0x1b01a57b,-0x7df70b3f,-0xaf03ba9,0x65b0d9c6,0x12b7e950,-0x74414716,-0x3467784,0x62dd1ddf,0x15da2d49,-0x732c830d,-0x42bb39b,0x4db26158,0x3ab551ce,-0x5c43ff8c,-0x2b44cf1e,0x4adfa541,0x3dd895d7,-0x5b2e3b93,-0x2c290b05,0x4369e96a,0x346ed9fc,-0x529877ba,-0x259f4730,0x44042d73,0x33031de5,-0x55f5b3a1,-0x22f28337,0x5005713c,0x270241aa,-0x41f4eff0,-0x36f3df7a,0x5768b525,0x206f85b3,-0x46992bf7,-0x319e1b61,0x5edef90e,0x29d9c998,-0x4f2f67de,-0x3828574c,0x59b33d17,0x2eb40d81,-0x4842a3c5,-0x3f459353,-0x12477ce0,-0x65404c4a,0x3b6e20c,0x74b1d29a,-0x152ab8c7,-0x622d8851,0x4db2615,0x73dc1683,-0x1c9cf4ee,-0x6b9bc47c,0xd6d6a3e,0x7a6a5aa8,-0x1bf130f5,-0x6cf60063,0xa00ae27,0x7d079eb1,-0xff06cbc,-0x78f75c2e,0x1e01f268,0x6906c2fe,-0x89da8a3,-0x7f9a9835,0x196c3671,0x6e6b06e7,-0x12be48a,-0x762cd420,0x10da7a5a,0x67dd4acc,-0x6462091,-0x71411007,0x17b7be43,0x60b08ed5,-0x29295c18,-0x5e2e6c82,0x38d8c2c4,0x4fdff252,-0x2e44980f,-0x5943a899,0x3fb506dd,0x48b2364b,-0x27f2d426,-0x50f5e4b4,0x36034af6,0x41047a60,-0x209f103d,-0x579820ab,0x316e8eef,0x4669be79,-0x349e4c74,-0x43997ce6,0x256fd2a0,0x5268e236,-0x33f3886b,-0x44f4b8fd,0x220216b9,0x5505262f,-0x3a45c442,-0x4d42f4d8,0x2bb45a92,0x5cb36a04,-0x3d280059,-0x4a2f30cf,0x2cd99e8b,0x5bdeae1d,-0x649b3d50,-0x139c0dda,0x756aa39c,0x26d930a,-0x63f6f957,-0x14f1c9c1,0x72076785,0x5005713,-0x6a40b57e,-0x1d4785ec,0x7bb12bae,0xcb61b38,-0x6d2d7165,-0x1a2a41f3,0x7cdcefb7,0xbdbdf21,-0x792c2d2c,-0xe2b1dbe,0x68ddb3f8,0x1fda836e,-0x7e41e933,-0x946d9a5,0x6fb077e1,0x18b74777,-0x77f7a51a,-0xf09590,0x66063bca,0x11010b5c,-0x709a6101,-0x79d5197,0x616bffd3,0x166ccf45,-0x5ff51d88,-0x28f22d12,0x4e048354,0x3903b3c2,-0x5898d99f,-0x2f9fe909,0x4969474d,0x3e6e77db,-0x512e95b6,-0x2629a524,0x40df0b66,0x37d83bf0,-0x564351ad,-0x2144613b,0x47b2cf7f,0x30b5ffe9,-0x42420de4,-0x35453d76,0x53b39330,0x24b4a3a6,-0x452fc9fb,-0x3228f96d,0x54de5729,0x23d967bf,-0x4c9985d2,-0x3b9eb548,0x5d681b02,0x2a6f2b94,-0x4bf441c9,-0x3cf3715f,0x5a05df1b,0x2d02ef8d]
const crc32 = (data) => {
    if(typeof data === "string") {
        let crc = -1
        for(let b of data) crc = (crc>>>8)^CRC32_TABLE[(crc^b.charCodeAt())&0xff]
        return (crc^(-1))>>>0
    }
    else if(typeof data[Symbol.iterator] === "function") {
        let crc = -1
        for(let b of data) crc = (crc>>>8)^CRC32_TABLE[(crc^b)&0xff]
        return (crc^(-1))>>>0
    }
    else throw `cannot crc ${data}`
}
const uint32ToUint8ArrayBE = (n) => [(n & 0xff000000) >>> 24, (n & 0xff0000) >>> 16, (n & 0xff00) >>> 8, (n & 0xff)]
const int32ToInt8ArrayBE = uint32ToUint8ArrayBE
const int32ToUint8ArrayBE = uint32ToUint8ArrayBE

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

import {readFileSync} from "fs"

let f = readFileSync("test.png")
let a = new Uint8Array(f.length)
f.copy(a)

let decoded = PNG.readChunks(a)
let b = PNG.saveChunks(decoded)

console.log("input: a")
console.log("output (reencoded):", decoded)
if(a.toString() === b.toString()) console.log("(pass) input and output are same")
else console.log("(fail) input and output differ")