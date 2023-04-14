import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

let files = []
async function scan(p) {
    let ignore = []
    if(existsSync(join(p, ".ignore"))) {
        ignore = readFileSync(join(p, ".ignore")).toString().split("\n")
    }
    for(let i of readdirSync(p)) {
        if(ignore.includes(i)) continue
        let s = statSync(join(p, i))
        if(s.isDirectory()) scan(join(p, i))
        else files.push(join(p, i))
    }
}
scan("./")
writeFileSync("init/assets.txt", files.join("\n"))