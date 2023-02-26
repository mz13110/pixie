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

Object.deepFreeze = function deepFreeze(o) {
    Object.freeze(o)
    if(o === undefined) return o

    Object.getOwnPropertyNames(o).map((prop) => {
        if(o[prop] !== null && (typeof o[prop] === "object" || typeof o[prop] === "function") && !Object.isFrozen(o[prop])) Object.deepFreeze(o[prop])
    })

    return o
}