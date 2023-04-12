window.distanceTo = (x1, y1, x2, y2) => Math.sqrt((x2-x1)**2+(y2-y1)**2)
Math.clamp = (num, min, max) => Math.min(Math.max(num, min), max)
window.hsv2rgb = (hue,sat,val) => {var r,g,b,i,f,p,q,t;hue/=360,sat/=100,val/=100,i=Math.floor(hue*6);f=hue*6-i;p=val*(1-sat);q=val*(1-f*sat);t=val*(1-(1-f)*sat);switch(i%6){case 0:r=val,g=t,b=p;break;case 1:r=q,g=val,b=p;break;case 2:r=p,g=val,b=t;break;case 3:r=p,g=q,b=val;break;case 4:r=t,g=p,b=val;break;case 5:r=val,g=p,b=q;break}return{r:Math.clamp(Math.round(r*255),0,255),g:Math.clamp(Math.round(g*255),0,255),b:Math.clamp(Math.round(b*255),0,255)}}
window.rgb2hsv = (r,g,b) => {var m=Math.max(r,g,b),n=Math.min(r,g,b),d=m-n,h,s=(m===0?0:d/m),v=m/255;switch(m){case n:h=0;break;case r:h=(g-b)+d*(g<b?6:0);h/=6*d;break;case g:h=(b-r)+d*2;h/=6*d;break;case b:h=(r-g)+d*4;h/=6*d;break}return{h:Math.clamp(h*360,0,360),s:Math.clamp(s*100,0,100),v:Math.clamp(v*100,0,100)}}
window.rgb2hex = (r,g,b) => "#"+(r<16?"0":"")+r.toString(16)+(g<16?"0":"") + g.toString(16)+(b<16?"0":"") + b.toString(16)
window.hsv2hex = (hue,sat,val) => {
    let {r, g, b} = hsv2rgb(hue, sat, val)
    return rgb2hex(r, g, b)
}
Math.rad2deg = (a) => a*180/Math.PI
Math.deg2rad = (a) => a*Math.PI/180
Math.rotate = (x, y, a, ox, oy) => {
    a = Math.deg2rad(a)
    return {x: (x-ox)*(Math.cos(a)) - (y-oy)*(Math.sin(a)) + ox, y: (x-ox)*(Math.sin(a)) + (y-oy)*(Math.cos(a)) + oy}
}
Math.angleAround = (x, y, ox, oy) => (Math.rad2deg(Math.atan2(y-oy, x-ox)) + 360) % 360

window.fixInputClamping = (e) => {
    e.addEventListener("change", () => e.value = Math.clamp(e.value, e.min, e.max))
}
window.linkInputToSlider = (slider, input) => {
    input.value = slider.value

    slider.addEventListener("input", () => input.value = slider.value)
    input.addEventListener("change", (e) => {
        slider.value = input.value
        slider.dispatchEvent(new Event("input"))
        slider.dispatchEvent(new Event("change"))
    })
}
window.linkEventAttr = (target, name, attr) => {
    target.addEventListener(name, (e) => {
        // use with(Proxy){} to inject property named "event"
        function inject(event, target, f) {
            with(new Proxy({}, {
                get: (_, k) => k === "event" ? event : globalThis[k],
                has: (_, k) => k === "event" || k in globalThis,
                set: (_, k, v) => {k === "event" ? (event = v) : (globalThis[k] = v)}
            })) {
                f.bind(target)(event)
            }
        }

        if(attr in target && typeof target[attr] === "function") {
            inject(e, target, target[attr])
        }
        inject(e, target, Function(target.getAttribute(attr)))
    })
}

window.contrastColor = (hue, sat, val) => {
    let c = hsv2rgb(hue, sat, val)
    return (c.r*0.299 + c.g*0.587 + c.b*0.114) > 145 ? "black" : "white"
}
window.contrastColorRGB = (r, g, b) => (r*0.299 + g*0.587 + b*0.114) > 145 ? "black" : "white"

window.customLogger = (namespace) => {
    let c = ["#ff1000", "#ff9900", "#ffe900", "#01b546", "#0788f2", "#b13df4"][Math.floor(Math.random() * 6)]
    let h = {
        "#ff1000": [255, 16, 0],
        "#ff9900": [255, 153, 0],
        "#ffe900": [255, 233, 0],
        "#01b546": [1, 181, 70],
        "#0788f2": [7, 136, 240],
        "#b13df4": [177, 61, 244]
    }
    return console.log.bind(window, `%c${namespace}`, `color: ${contrastColorRGB(...(h[c]))==="black" ? "#000000" : "#ffffff"}; background-color: ${c}; padding: 2px;`)
}

window.$icon = (icon, ...classes) => {
    let $ = document.createElement("i")
    $.classList.add("bx")
    if(icon !== "") $.classList.add(icon)
    $.classList.add(...classes)

    return $
}
window.icon = (icon, ...classes) =>  `<i class="bx ${icon} ${classes.join(" ")}"></i>`

Object.deepFreeze = function deepFreeze(o) {
    Object.freeze(o)
    if(o === undefined) return o

    Object.getOwnPropertyNames(o).map((prop) => {
        if(o[prop] !== null && (typeof o[prop] === "object" || typeof o[prop] === "function") && !Object.isFrozen(o[prop])) Object.deepFreeze(o[prop])
    })

    return o
}


// CRC32 stolen from stack overflow that i changed a bit
const CRC32_TABLE = [0x0,0x77073096,-0x11f19ed4,-0x66f6ae46,0x76dc419,0x706af48f,-0x169c5acb,-0x619b6a5d,0xedb8832,0x79dcb8a4,-0x1f2a16e2,-0x682d2678,0x9b64c2b,0x7eb17cbd,-0x1847d2f9,-0x6f40e26f,0x1db71064,0x6ab020f2,-0xc468eb8,-0x7b41be22,0x1adad47d,0x6ddde4eb,-0xb2b4aaf,-0x7c2c7a39,0x136c9856,0x646ba8c0,-0x29d0686,-0x759a3614,0x14015c4f,0x63066cd9,-0x5f0c29d,-0x72f7f20b,0x3b6e20c8,0x4c69105e,-0x2a9fbe1c,-0x5d988e8e,0x3c03e4d1,0x4b04d447,-0x2df27a03,-0x5af54a95,0x35b5a8fa,0x42b2986c,-0x2444362a,-0x534306c0,0x32d86ce3,0x45df5c75,-0x2329f231,-0x542ec2a7,0x26d930ac,0x51de003a,-0x3728ae80,-0x402f9eea,0x21b4f4b5,0x56b3c423,-0x30456a67,-0x47425af1,0x2802b89e,0x5f058808,-0x39f3264e,-0x4ef416dc,0x2f6f7c87,0x58684c11,-0x3e9ee255,-0x4999d2c3,0x76dc4190,0x1db7106,-0x672ddf44,-0x102aefd6,0x71b18589,0x6b6b51f,-0x60401b5b,-0x17472bcd,0x7807c9a2,0xf00f934,-0x69f65772,-0x1ef167e8,0x7f6a0dbb,0x86d3d2d,-0x6e9b9369,-0x199ca3ff,0x6b6b51f4,0x1c6c6162,-0x7a9acf28,-0xd9dffb2,0x6c0695ed,0x1b01a57b,-0x7df70b3f,-0xaf03ba9,0x65b0d9c6,0x12b7e950,-0x74414716,-0x3467784,0x62dd1ddf,0x15da2d49,-0x732c830d,-0x42bb39b,0x4db26158,0x3ab551ce,-0x5c43ff8c,-0x2b44cf1e,0x4adfa541,0x3dd895d7,-0x5b2e3b93,-0x2c290b05,0x4369e96a,0x346ed9fc,-0x529877ba,-0x259f4730,0x44042d73,0x33031de5,-0x55f5b3a1,-0x22f28337,0x5005713c,0x270241aa,-0x41f4eff0,-0x36f3df7a,0x5768b525,0x206f85b3,-0x46992bf7,-0x319e1b61,0x5edef90e,0x29d9c998,-0x4f2f67de,-0x3828574c,0x59b33d17,0x2eb40d81,-0x4842a3c5,-0x3f459353,-0x12477ce0,-0x65404c4a,0x3b6e20c,0x74b1d29a,-0x152ab8c7,-0x622d8851,0x4db2615,0x73dc1683,-0x1c9cf4ee,-0x6b9bc47c,0xd6d6a3e,0x7a6a5aa8,-0x1bf130f5,-0x6cf60063,0xa00ae27,0x7d079eb1,-0xff06cbc,-0x78f75c2e,0x1e01f268,0x6906c2fe,-0x89da8a3,-0x7f9a9835,0x196c3671,0x6e6b06e7,-0x12be48a,-0x762cd420,0x10da7a5a,0x67dd4acc,-0x6462091,-0x71411007,0x17b7be43,0x60b08ed5,-0x29295c18,-0x5e2e6c82,0x38d8c2c4,0x4fdff252,-0x2e44980f,-0x5943a899,0x3fb506dd,0x48b2364b,-0x27f2d426,-0x50f5e4b4,0x36034af6,0x41047a60,-0x209f103d,-0x579820ab,0x316e8eef,0x4669be79,-0x349e4c74,-0x43997ce6,0x256fd2a0,0x5268e236,-0x33f3886b,-0x44f4b8fd,0x220216b9,0x5505262f,-0x3a45c442,-0x4d42f4d8,0x2bb45a92,0x5cb36a04,-0x3d280059,-0x4a2f30cf,0x2cd99e8b,0x5bdeae1d,-0x649b3d50,-0x139c0dda,0x756aa39c,0x26d930a,-0x63f6f957,-0x14f1c9c1,0x72076785,0x5005713,-0x6a40b57e,-0x1d4785ec,0x7bb12bae,0xcb61b38,-0x6d2d7165,-0x1a2a41f3,0x7cdcefb7,0xbdbdf21,-0x792c2d2c,-0xe2b1dbe,0x68ddb3f8,0x1fda836e,-0x7e41e933,-0x946d9a5,0x6fb077e1,0x18b74777,-0x77f7a51a,-0xf09590,0x66063bca,0x11010b5c,-0x709a6101,-0x79d5197,0x616bffd3,0x166ccf45,-0x5ff51d88,-0x28f22d12,0x4e048354,0x3903b3c2,-0x5898d99f,-0x2f9fe909,0x4969474d,0x3e6e77db,-0x512e95b6,-0x2629a524,0x40df0b66,0x37d83bf0,-0x564351ad,-0x2144613b,0x47b2cf7f,0x30b5ffe9,-0x42420de4,-0x35453d76,0x53b39330,0x24b4a3a6,-0x452fc9fb,-0x3228f96d,0x54de5729,0x23d967bf,-0x4c9985d2,-0x3b9eb548,0x5d681b02,0x2a6f2b94,-0x4bf441c9,-0x3cf3715f,0x5a05df1b,0x2d02ef8d]
window.crc32 = (data) => {
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
window.uint32ToUint8ArrayBE = (n) => [(n & 0xff000000) >>> 24, (n & 0xff0000) >>> 16, (n & 0xff00) >>> 8, (n & 0xff)]
window.int32ToInt8ArrayBE = uint32ToUint8ArrayBE
window.int32ToUint8ArrayBE = uint32ToUint8ArrayBE

window.None = Symbol("None")
window.nc = (a, b) => a ?? (a === None ? b : a)