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

    const RATIO_LARGEUR_JEU = 0.428; 
    const PLAY_AREA_WIDTH = Math.floor(canvasSize.width * RATIO_LARGEUR_JEU);
    const offsetX = Math.floor((canvasSize.width - PLAY_AREA_WIDTH) / 2);

    const LEFT_TOWER_WIDTH = offsetX;
    const RIGHT_TOWER_WIDTH = canvasSize.width - (offsetX + PLAY_AREA_WIDTH);
    
    const refTowerTexture = towerTexturesLeft[0];
    const towerScale = LEFT_TOWER_WIDTH / refTowerTexture.width;
    const towerScaledHeight = Math.floor(refTowerTexture.height * towerScale);

    const RATIO_BIOME = 0.2; 
    const RATIO_TOWER = 0.6; 

    const updateTapisRoulant = (spritesArray, movement, totalHeight) => {
        spritesArray.forEach((sprite) => {
            if (!sprite) return;
            sprite.y += movement;

            // REBOUCLAGE VERS LE HAUT (Quand on monte dans le jeu, les sprites descendent)
            // Si le haut du sprite dépasse le bas de l'écran :
            if (sprite.y >= canvasSize.height) {
                sprite.y -= totalHeight;
            } 
            
            // REBOUCLAGE VERS LE BAS (Si on redescend, rare mais possible)
            // Si le bas du sprite remonte au-dessus du "plafond" de la pile :
            else if (sprite.y < canvasSize.height - totalHeight) {
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
                        y={canvasSize.height - (index + 1) * bgScaledHeight}
                    />
                ))}
            </pixiContainer>

            {/* TOURS */}
            <pixiContainer>
                {towerTexturesLeft.map((texture, index) => (
                    <pixiSprite
                        key={`tower-left-${index}`}
                        ref={el => towerLeftSpritesRef.current[index] = el}
                        texture={texture}
                        width={LEFT_TOWER_WIDTH} 
                        height={towerScaledHeight}
                        x={0} 
                        y={canvasSize.height - (index + 1) * towerScaledHeight}
                    />
                ))}

                {towerTexturesRight.map((texture, index) => (
                    <pixiSprite
                        key={`tower-right-${index}`}
                        ref={el => towerRightSpritesRef.current[index] = el}
                        texture={texture}
                        width={RIGHT_TOWER_WIDTH} 
                        height={towerScaledHeight}
                        x={offsetX + PLAY_AREA_WIDTH}
                        y={canvasSize.height - (index + 1) * towerScaledHeight}
                    />
                ))}
            </pixiContainer>
        </pixiContainer>
    );
};