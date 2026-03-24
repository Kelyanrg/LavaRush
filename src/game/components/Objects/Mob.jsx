import { useCallback, useRef } from 'react';
import { extend, useTick } from '@pixi/react';
import { Graphics } from 'pixi.js';

extend({ Graphics });

export const Mob = ({ x, y, width, height }) => {
    const mobRef = useRef(null);

    const drawMob = useCallback((g) => {
        g.clear().rect(0, 0, width, height).fill(0x8B00FF);
    }, [width, height]);

    return (
        <pixiGraphics 
            ref={mobRef} 
            x={x} 
            y={y} 
            draw={drawMob} 
        />
    );
};