import { extend } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useCallback } from "react";

extend({ Graphics });

export const Plateforme = ({ x, y, largeur = 120, hauteur = 20, couleur = 0xff00 }) => {
    const draw = useCallback((graphics) => {
        graphics.clear().rect(0, 0, largeur, hauteur).fill(couleur);
    }, [largeur, hauteur, couleur]);

    return <pixiGraphics draw={draw} x={x} y={y} />;
};