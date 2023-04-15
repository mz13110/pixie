(module
    (memory (import "mem" "satv_gen") 1)
    (func $hsv2rgb (export "hsv2rgb") (param $h f32) (param $s f32) (param $v f32) (result i32 i32 i32)
        (local $i i32)
        (local $f f32)
        (local $p f32)
        (local $q f32)
        (local $t f32)
        (local $rem i32)
        (local $r f32)
        (local $g f32)
        (local $b f32)

        ;; h /= 360
        local.get $h
        f32.const 360
        f32.div
        local.set $h
        
        ;; s /= 100
        local.get $s
        f32.const 100
        f32.div
        local.set $s
        
        ;; v /= 100
        local.get $v
        f32.const 100
        f32.div
        local.set $v

        ;; i = floor(h * 6)
        local.get $h
        f32.const 6
        f32.mul
        f32.floor
        i32.trunc_f32_u
        local.set $i

        ;; f = h * 6 - i
        local.get $h
        f32.const 6
        f32.mul
        local.get $i
        f32.convert_i32_u
        f32.sub
        local.set $f

        ;; p = v * (1 - s);
        f32.const 1
        local.get $s
        f32.sub
        local.get $v
        f32.mul
        local.set $p

        ;; q = v * (1 - f * s)
        local.get $f
        local.get $s
        f32.mul
        local.set $q
        f32.const 1
        local.get $q
        f32.sub
        local.get $v
        f32.mul
        local.set $q

        ;; t = v * (1 - (1 - f) * s)
        f32.const 1
        local.get $f
        f32.sub
        local.get $s
        f32.mul
        local.set $t
        f32.const 1
        local.get $t
        f32.sub
        local.get $v
        f32.mul
        local.set $t

        ;; rem = i % 6
        local.get $i
        i32.const 6
        i32.rem_u
        local.tee $rem

        i32.const 0
        i32.eq
        (if (result f32 f32 f32)
            (then ;; rem == 0
                local.get $v
                local.get $t
                local.get $p
            )
            (else
                i32.const 1
                local.get $rem
                i32.eq
                (if (result f32 f32 f32)
                    (then ;; rem == 1
                        local.get $q
                        local.get $v
                        local.get $p
                    )
                    (else
                        i32.const 2
                        local.get $rem
                        i32.eq
                        (if (result f32 f32 f32)
                            (then ;; rem == 2
                                local.get $p
                                local.get $v
                                local.get $t
                            )
                            (else
                                i32.const 3
                                local.get $rem
                                i32.eq
                                (if (result f32 f32 f32)
                                    (then ;; rem == 3
                                        local.get $p
                                        local.get $q
                                        local.get $v
                                    )
                                    (else
                                        i32.const 4
                                        local.get $rem
                                        i32.eq
                                        (if (result f32 f32 f32)
                                            (then ;; rem == 4
                                                local.get $t
                                                local.get $p
                                                local.get $v
                                            )
                                            (else ;; rem == 5
                                                local.get $v
                                                local.get $p
                                                local.get $q
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )

        (;
            return {
                r: Math.round(Math.clamp(r * 255, 0, 255)),
                g: Math.round(Math.clamp(g * 255, 0, 255)),
                b: Math.round(Math.clamp(b * 255, 0, 255)),
            };
        ;)
        local.set $h
        local.set $s

        f32.const 255
        f32.mul

        f32.const 0
        f32.max
        f32.const 255
        f32.min

        i32.trunc_f32_u


        local.get $s
        f32.const 255
        f32.mul

        f32.const 0
        f32.max
        f32.const 255
        f32.min

        i32.trunc_f32_u


        local.get $h
        f32.const 255
        f32.mul

        f32.const 0
        f32.max
        f32.const 255
        f32.min

        i32.trunc_f32_u
        return
    )
    (func (export "gen_satv") (param $hue f32) (param $w i32) (param $h i32)
        (local $o i32)
        (local $r i32)
        (local $g i32)
        (local $b i32)
        (local $s f32)
        (local $v f32)
        (local $sinc f32)
        (local $vinc f32)

        (local $i i32)
        i32.const 0
        local.set $i

        f32.const 0
        local.set $v

        ;; even if width/height is one no divide by zero error is raised for some reason???
        f32.const 100
        local.get $w
        i32.const 1
        i32.sub
        f32.convert_i32_u
        f32.div
        local.set $sinc

        f32.const 100
        local.get $h
        i32.const 1
        i32.sub
        f32.convert_i32_u
        f32.div
        local.set $vinc

        (loop $vloop
            f32.const 0
            local.set $s
            (loop $sloop
                local.get $hue
                local.get $s
                local.get $v
                call $hsv2rgb
                local.set $b
                local.set $g
                local.set $r

                local.get $o
                local.get $r
                i32.store8

                local.get $o
                i32.const 1
                i32.add
                local.tee $o
                local.get $g
                i32.store8

                local.get $o
                i32.const 1
                i32.add
                local.tee $o
                local.get $b
                i32.store8

                local.get $o
                i32.const 1
                i32.add
                local.tee $o
                i32.const 255
                i32.store8

                local.get $o
                i32.const 1
                i32.add
                local.set $o

                local.get $s
                local.get $sinc
                f32.add
                local.tee $s
                f32.const 100
                f32.le
                br_if $sloop
            )
            local.get $v
            local.get $vinc
            f32.add
            local.tee $v
            f32.const 100
            f32.le
            br_if $vloop
        )
    )
)