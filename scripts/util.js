window.distanceTo = (x1, y1, x2, y2) => Math.sqrt((x2-x1)**2+(y2-y1)**2)
Math.clamp = (num, min, max) => Math.min(Math.max(num, min), max)
window.hsv2rgb = (h,s,v) => {var r,g,b,i,f,p,q,t;h/=360,s/=100,v/=100,i=Math.floor(h*6);f=h*6-i;p=v*(1-s);q=v*(1-f*s);t=v*(1-(1-f)*s);switch(i%6){case 0:r=v,g=t,b=p;break;case 1:r=q,g=v,b=p;break;case 2:r=p,g=v,b=t;break;case 3:r=p,g=q,b=v;break;case 4:r=t,g=p,b=v;break;case 5:r=v,g=p,b=q;break}return{r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)}}
window.rgb2hsv = (r,g,b) => {var m=Math.max(r,g,b),n=Math.min(r,g,b),d=m-n,h,s=(m===0?0:d/m),v=m/255;switch(m){case n:h=0;break;case r:h=(g-b)+d*(g<b?6:0);h/=6*d;break;case g:h=(b-r)+d*2;h/=6*d;break;case b:h=(r-g)+d*4;h/=6*d;break}return{h:Math.round(h*360),s:Math.round(s*100),v:Math.round(v*100)}}
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
window.contrastColor = (h, s, v) => {
    let c = hsv2rgb(h, s, v)
    return (c.r*0.299 + c.g*0.587 + c.b*0.114) > 145 ? "black" : "white"
}