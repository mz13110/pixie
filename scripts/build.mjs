import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join, normalize } from "path"
import { spawn, spawnSync } from "child_process"

const EXCLUDED_EXTENSIONS = ["wat"]

let assets = []
async function scan(p) {
    let ignore = []
    if(existsSync(join(p, ".ignore"))) {
        ignore = readFileSync(join(p, ".ignore")).toString().split("\n")
    }
    for(let i of readdirSync(p)) {
        if(ignore.includes(i)) continue
        let s = statSync(join(p, i))

        if(s.isDirectory()) scan(join(p, i))
        else {
            let ext = i.split(".").pop().toLowerCase()
            let path = normalize(join(p, i))

            console.log("+", path)
            if(!EXCLUDED_EXTENSIONS.includes(ext)) assets.push(path)

            switch(ext) {
                case "wat": {
                    console.log("wat2wasm", path)
                    let proc = spawnSync("wat2wasm", [path, "-o", normalize(join(p, i.split(".").slice(0,-1).concat("wasm").join(".")))])
                    if(proc.status !== 0) {
                        process.stderr.write(proc.stderr)
                        process.stdout.write(proc.stdout)
                        console.error("failed to wat2wasm", path)
                        process.exit(1)
                    }
                    break
                }
            }
        }
    }
}
scan("./")
writeFileSync("init/assets.txt", assets.join("\n"))