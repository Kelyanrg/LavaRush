import { extend } from "@pixi/react";
import { Graphics, Sprite } from "pixi.js";
import { useCallback } from "react";

extend({ Graphics, Sprite });

export const Spikes = ({ x, y, width, height, textureSpikes }) => {
    if (!textureSpikes) return null
    return (
        <pixiSprite x={x} y={y} width={width} height={height} texture={textureSpikes} />
    );
};