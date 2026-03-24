import { useRef, useEffect } from 'react';
import { extend, useTick } from '@pixi/react';
import { Sprite } from 'pixi.js';

extend({ Sprite });

export const Mob = ({ id, mobsRef, y, width, height, limitLeftX, limitRightX, texturesMobs }) => {
    const mobRef = useRef(null);
    const time = useRef(Math.random() * 100);

    const centerX = (limitLeftX + limitRightX) / 2;
    const totalDistance = (limitRightX - width) - limitLeftX;
    const amplitude = totalDistance / 2;

    useEffect(() => {
        return () => {
            if (mobsRef && mobsRef.current) {
                delete mobsRef.current[id];
            }
        };
    }, [id, mobsRef]);

    useTick((ticker) => {
        if (mobRef.current) {
            const vitessePixels = 3;
            time.current += ticker.deltaTime * (vitessePixels / amplitude);

            mobRef.current.x = (centerX - width / 2) + Math.sin(time.current) * amplitude;
            mobRef.current.y = y + Math.cos(time.current * 2) * (height * 0.15);

            if (texturesMobs && texturesMobs.length === 4) {


                const isMovingRight = Math.cos(time.current) > 0;

                const flapSpeed = 8;
                const isWingsUp = Math.floor(time.current * flapSpeed) % 2 === 0;

                let textureIndex = 0;
                if (isMovingRight) {
                    textureIndex = isWingsUp ? 1 : 0;
                } else {
                    textureIndex = isWingsUp ? 3 : 2;
                }

                mobRef.current.texture = texturesMobs[textureIndex];
            }

            if (mobsRef && mobsRef.current) {
                mobsRef.current[id] = {
                    x: mobRef.current.x,
                    y: mobRef.current.y,
                    width: width,
                    height: height
                };
            }
        }
    });

    return (
        <pixiSprite
            ref={mobRef}
            x={centerX}
            y={y}
            width={width}
            height={height}
            texture={texturesMobs ? texturesMobs[0] : undefined}
        />
    );
};