import { useRef } from 'react'
import { useTick, extend } from '@pixi/react'
import { Graphics, Container, Sprite } from 'pixi.js'
import * as PIXI from 'pixi.js'

extend({ Graphics, Container, Sprite, TilingSprite: PIXI.TilingSprite })

export const ParallaxBackground = ({ textures, canvasSize }) => {
    const bgRef = useRef(null);
    const midRef = useRef(null);

    const IMG_W = 1920;

    const scale = canvasSize.width / IMG_W
    const offsetX = (canvasSize.width - (IMG_W * scale)) / 2

    useTick((ticker) => {
        const delta = ticker.deltaTime;
        bgRef.current.tilePosition.x = 0
        bgRef.current.tilePosition.y += 0.5 * delta;

        midRef.current.tilePosition.x = 0
        midRef.current.tilePosition.y += 1.5 * delta
    })

    return (
        <>
            <pixiContainer>
                {textures?.bg && (
                    <pixiTilingSprite 
                        ref={bgRef}
                        texture={textures.bg}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        tileScale={{ x: scale, y: scale }}
                    />
                )}
            </pixiContainer>

            <pixiContainer>
                {textures?.mid && (
                    <pixiTilingSprite 
                        ref={midRef}
                        texture={textures.mid}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        tileScale={{ x: scale, y: scale }}
                    />
                )}
            </pixiContainer>
        </>
    )
}