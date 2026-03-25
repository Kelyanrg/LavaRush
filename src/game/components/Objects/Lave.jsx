import { useRef, useEffect } from "react"
import { useTick, extend } from "@pixi/react"
import { Sprite, Container } from "pixi.js"

extend({ Sprite, Container })

export const Lave = ({ playAreaWidth, canvasHeight, cameraY, laveY, isGameOver, texturesSurface, textureCorps }) => {
    const laveContainerRef = useRef(null)
    const surfaceRef = useRef(null)
    const corpsRef = useRef(null)
    const time = useRef(0)

    const estActive = useRef(false)
    const autoScrollerY = useRef(canvasHeight - 200)

    const ratioLave = 385 / 586; 
    const SURFACE_HEIGHT = playAreaWidth * ratioLave;

    const HITBOX_OFFSET = SURFACE_HEIGHT * 0.4;
    
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

    useTick((ticker) => {
        if (isGameOver || !laveContainerRef.current) return

        if (estActive.current) {
            let vitesseLave = 0//1.0

            if (cameraY && cameraY.current > 0) {
                const bonusDeVitesse = (cameraY.current / 3000) * 0.5
                vitesseLave += bonusDeVitesse
            }

            const VITESSE_MAXIMUM = 0//4.8
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

        laveContainerRef.current.y = autoScrollerY.current

        if (laveY) {
            laveY.current = autoScrollerY.current + HITBOX_OFFSET;
        }

        if (corpsRef.current) {
            const hauteurDynamique = canvasHeight - autoScrollerY.current + 500;
            corpsRef.current.height = Math.max(100, hauteurDynamique);
        }

        if (surfaceRef.current && texturesSurface && texturesSurface.length === 4) {
            time.current += ticker.deltaTime;
            const animationSpeed = 0.12; 
            const frameIndex = Math.floor(time.current * animationSpeed) % 4;
            surfaceRef.current.texture = texturesSurface[frameIndex];
        }
    })

    return (
        <pixiContainer ref={laveContainerRef}>
            <pixiSprite
                ref={corpsRef}
                y={SURFACE_HEIGHT - 2}
                width={playAreaWidth}
                height={100}
                texture={textureCorps}
            />
            
            <pixiSprite
                ref={surfaceRef}
                y={0}
                width={playAreaWidth}
                height={SURFACE_HEIGHT}
                texture={texturesSurface ? texturesSurface[0] : undefined}
            />
        </pixiContainer>
    )
}