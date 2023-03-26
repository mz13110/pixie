console.clear()
function draw(d) {
    if(d < 2) return console.log("@")


    let o = d/2

    for(let y = 0; y < d+1; y++) {
        let row = ""
        for(let x = 0; x < d+1; x++) {
            row += (x-o)**2+(y-o)**2 <= (d/2)**2 ? "@" : " "
        }
        console.log(row)
    }
}
draw(4)
