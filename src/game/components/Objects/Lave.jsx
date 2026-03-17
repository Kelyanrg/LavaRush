import { useCallback, useRef, useEffect } from "react"
import { useTick, extend } from "@pixi/react"
import { Graphics } from "pixi.js"

extend({ Graphics })

export const Lave = ({ playAreaWidth, canvasHeight, cameraY, laveY }) => {
    const laveRef = useRef(null)
    const estReveillee = useRef(false)
    const HAUTEUR_VISIBLE_MINIMUM = 80
    const autoScrollerY = useRef(canvasHeight - HAUTEUR_VISIBLE_MINIMUM)

    useEffect(() => {
        const reveillerLave = (e) => {
            if (e.code === 'Space' && !estReveillee.current) {
                estReveillee.current = true
                window.removeEventListener('keydown', reveillerLave)
            }
        }

        window.addEventListener('keydown', reveillerLave)
        
        return () => {
            window.removeEventListener('keydown', reveillerLave);
        }
    }, [])

    const drawLave = useCallback((g) => {
        g.clear().rect(0, 0, playAreaWidth, 300).fill(0xff4400)
    }, [playAreaWidth])

    useTick((ticker) => {
        if (!laveRef.current || !cameraY) return
        
        const basDeLecranVisible = (canvasHeight - cameraY.current) - HAUTEUR_VISIBLE_MINIMUM
        
        if (basDeLecranVisible < autoScrollerY.current) {
            autoScrollerY.current = basDeLecranVisible
        }
        
        if (estReveillee.current) {
            const vitesseLave = 1.0
            autoScrollerY.current -= vitesseLave * ticker.deltaTime
        } else {
            autoScrollerY.current = basDeLecranVisible
        }
        
        laveRef.current.y = autoScrollerY.current

        if (laveY) {
            laveY.current = autoScrollerY.current
        }
    });

    return (
        <pixiGraphics 
            ref={laveRef} 
            draw={drawLave} 
            alpha={0.85} 
        />
    )
}