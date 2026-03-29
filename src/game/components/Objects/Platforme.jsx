import { extend } from "@pixi/react";
import { Graphics, Sprite } from "pixi.js";
// import { useCallback } from "react";

extend({ Graphics, Sprite });

export const Plateforme = ({ x, y, largeur = 120, hauteur = 20, couleur = 0xff00, texturesPlatforme }) => {
    if (!texturesPlatforme) return null
    return <pixiSprite x={x} y={y} width={largeur} height={hauteur} texture={texturesPlatforme} />;
};