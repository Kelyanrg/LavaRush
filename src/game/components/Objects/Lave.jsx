import { useRef, useEffect, useCallback } from "react"
import { useTick, extend } from "@pixi/react"
import { Graphics } from "pixi.js"

extend({ Graphics })

export const Lave = ({ playAreaWidth, canvasHeight, cameraY, laveY, isGameOver }) => {
    const laveRef = useRef(null)
    const estActive = useRef(false)

    const autoScrollerY = useRef(canvasHeight - 100)

    useEffect(() => {
        const monterLave = (e) => {
            if ((e.code === 'Space' || e.key.toLowerCase() === 'z') && !estActive.current) {
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
        g.clear().rect(-2, 0, playAreaWidth + 4, 100).fill(0xff4400)
    }, [playAreaWidth])

    useTick((ticker) => {
        if (isGameOver || !laveRef.current) return

        if (estActive.current) {
            let vitesseLave = 2.0

            if (cameraY && cameraY.current > 0) {
                const bonusDeVitesse = (cameraY.current / 3000) * 0.5
                vitesseLave += bonusDeVitesse
            }

            const VITESSE_MAXIMUM = 4.8
            if (vitesseLave > VITESSE_MAXIMUM) {
                vitesseLave = VITESSE_MAXIMUM
            }

            if (cameraY) {
                const positionEcranLave = autoScrollerY.current + cameraY.current;
                const distanceSousEcran = positionEcranLave - canvasHeight;

                if (distanceSousEcran > 300) {
                    vitesseLave = 10.0 + (distanceSousEcran / 50); 
                } else if (distanceSousEcran > 50) {
                    vitesseLave = Math.max(vitesseLave, 6.5);
                }
            }

            autoScrollerY.current -= vitesseLave * ticker.deltaTime
        }

        laveRef.current.y = autoScrollerY.current

        if (laveY) {
            laveY.current = autoScrollerY.current
        }

        const hauteurDynamique = canvasHeight - autoScrollerY.current + 500;
        laveRef.current.height = Math.max(100, hauteurDynamique);
    })

    return (
        <pixiGraphics
            ref={laveRef}
            draw={drawLave}
            alpha={0.85}
        />
    )
}