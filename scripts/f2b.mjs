import { readFileSync } from "fs"

console.log("new Buffer([" + (new Uint8Array(readFileSync(process.argv[2])) + "])"))