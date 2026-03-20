import { useCallback, useRef, useEffect } from "react"
import { useTick, extend } from "@pixi/react"
import { Graphics } from "pixi.js"

extend({ Graphics })

export const Lave = ({ playAreaWidth, canvasHeight, cameraY, laveY, isGameOver }) => {
    const laveRef = useRef(null)
    const estActive = useRef(false)

    const autoScrollerY = useRef(canvasHeight - 100)

    useEffect(() => {
        const monterLave = (e) => {
            if (e.code === 'Space' && !estActive.current) {
                estActive.current = true
                window.removeEventListener('keydown', monterLave)
            }
        }

        window.addEventListener('keydown', monterLave)

        return () => {
            window.removeEventListener('keydown', monterLave)
        }
    }, [])

    const drawLave = useCallback((g) => {
        g.clear().rect(0, 0, playAreaWidth, 3000).fill(0xff4400)
    }, [playAreaWidth])

    useTick((ticker) => {
        if (isGameOver || !laveRef.current) return

        if (estActive.current) {
            let vitesseLave = 2.0

            if (cameraY && cameraY.current > 0) {
                const bonusDeVitesse = (cameraY.current / 1500) * 0.5
                vitesseLave += bonusDeVitesse
            }

            const VITESSE_MAXIMUM = 6.0
            if (vitesseLave > VITESSE_MAXIMUM) {
                vitesseLave = VITESSE_MAXIMUM
            }

            autoScrollerY.current -= vitesseLave * ticker.deltaTime
        }

        laveRef.current.y = autoScrollerY.current

        if (laveY) {
            laveY.current = autoScrollerY.current
        }
    })

    return (
        <pixiGraphics
            ref={laveRef}
            draw={drawLave}
            alpha={0.85}
        />
    )
}