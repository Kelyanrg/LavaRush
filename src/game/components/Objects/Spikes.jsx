import { extend } from "@pixi/react";
import { Graphics, Sprite } from "pixi.js";
import { useCallback } from "react";

extend({ Graphics, Sprite });

export const Spikes = ({ x, y, width, height }) => {
    const draw = useCallback((graphics) => {
        graphics.clear().rect(0, 0, width, height).fill(0xff0000);
    }, [width, height]);
    return (
        <pixiGraphics
            draw={draw} x={x} y={y}
        />
    );
};