window.distanceTo = (x1, y1, x2, y2) => Math.sqrt((x2-x1)**2+(y2-y1)**2)
Math.clamp = (num, min, max) => Math.min(Math.max(num, min), max)
window.hsv2rgb = (h,s,v) => {var r,g,b,i,f,p,q,t;h/=360,s/=100,v/=100,i=Math.floor(h*6);f=h*6-i;p=v*(1-s);q=v*(1-f*s);t=v*(1-(1-f)*s);switch(i%6){case 0:r=v,g=t,b=p;break;case 1:r=q,g=v,b=p;break;case 2:r=p,g=v,b=t;break;case 3:r=p,g=q,b=v;break;case 4:r=t,g=p,b=v;break;case 5:r=v,g=p,b=q;break}return{r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)}}
Math.rad2deg = (a) => a*180/Math.PI
Math.deg2rad = (a) => a*Math.PI/180
Math.rotate = (x, y, a, ox, oy) => {
    a = Math.deg2rad(a)
    return {x: (x-ox)*(Math.cos(a)) - (y-oy)*(Math.sin(a)) + ox, y: (x-ox)*(Math.sin(a)) + (y-oy)*(Math.cos(a)) + oy}
}


window.fixInputClamping = (e) => {
    e.addEventListener("change", () => e.value = Math.clamp(e.value, e.min, e.max))
}
window.linkSliderToInput = (slider, input) => {
    input.value = slider.value

    slider.addEventListener("input", () => input.value = slider.value)
    input.addEventListener("change", () => slider.value = input.value)
}