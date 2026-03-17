import { useRef } from 'react';
import { useTick, extend } from '@pixi/react';
import { Container, Sprite } from 'pixi.js';

extend({ Container, Sprite });

export const ParallaxBackground = ({ biomeTextures, towerTexturesLeft, towerTexturesRight, canvasSize, cameraY }) => {
    const biomeSpritesRef = useRef([]);
    const towerLeftSpritesRef = useRef([]);
    const towerRightSpritesRef = useRef([]);
    
    const prevCameraY = useRef(0);

    const IMG_W = 1920;
    const bgScale = canvasSize.width / IMG_W;
    const bgScaledHeight = 1080 * bgScale;

    const TOWER_WIDTH = Math.floor(canvasSize.width * 0.286);
    
    const refTowerTexture = towerTexturesLeft[0];
    const towerScale = TOWER_WIDTH / refTowerTexture.width;
    const towerScaledHeight = Math.floor(refTowerTexture.height * towerScale);

    const RATIO_BIOME = 0.2; 
    const RATIO_TOWER = 0.6; 

    const updateTapisRoulant = (spritesArray, movement, totalHeight) => {
        spritesArray.forEach((sprite) => {
            if (!sprite) return;
            sprite.y += movement;

            if (sprite.y >= canvasSize.height) {
                sprite.y -= totalHeight;
            } else if (sprite.y < canvasSize.height - totalHeight) {
                sprite.y += totalHeight;
            }
        });
    };

    useTick(() => {
        if (!cameraY) return;

        const deltaCamY = cameraY.current - prevCameraY.current;
        prevCameraY.current = cameraY.current;

        if (deltaCamY !== 0) {
            const totalHeightBiomes = bgScaledHeight * biomeSpritesRef.current.length;
            updateTapisRoulant(biomeSpritesRef.current, deltaCamY * RATIO_BIOME, totalHeightBiomes);

            const totalHeightTowersLeft = towerScaledHeight * towerLeftSpritesRef.current.length;
            updateTapisRoulant(towerLeftSpritesRef.current, deltaCamY * RATIO_TOWER, totalHeightTowersLeft);

            const totalHeightTowersRight = towerScaledHeight * towerRightSpritesRef.current.length;
            updateTapisRoulant(towerRightSpritesRef.current, deltaCamY * RATIO_TOWER, totalHeightTowersRight);
        }
    });

    return (
        <pixiContainer>
            <pixiContainer>
                {biomeTextures.map((texture, index) => (
                    <pixiSprite
                        key={`biome-${index}`}
                        ref={el => biomeSpritesRef.current[index] = el}
                        texture={texture}
                        width={canvasSize.width}
                        height={bgScaledHeight}
                        x={0}
                        y={-index * bgScaledHeight}
                    />
                ))}
            </pixiContainer>

            <pixiContainer>
                {towerTexturesLeft.map((texture, index) => (
                    <pixiSprite
                        key={`tower-left-${index}`}
                        ref={el => towerLeftSpritesRef.current[index] = el}
                        texture={texture}
                        width={TOWER_WIDTH}
                        height={towerScaledHeight}
                        x={0} 
                        y={-index * towerScaledHeight}
                    />
                ))}

                {towerTexturesRight.map((texture, index) => (
                    <pixiSprite
                        key={`tower-right-${index}`}
                        ref={el => towerRightSpritesRef.current[index] = el}
                        texture={texture}
                        width={TOWER_WIDTH}
                        height={towerScaledHeight}
                        x={canvasSize.width - TOWER_WIDTH} 
                        y={-index * towerScaledHeight}
                    />
                ))}
            </pixiContainer>
        </pixiContainer>
    );
};