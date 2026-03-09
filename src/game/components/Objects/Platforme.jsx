import { extend } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useCallback } from "react";

extend({ Graphics });

export const Plateforme = ({ x, y, largeur = 120, hauteur = 20, couleur = 0xff0000 }) => {
    const draw = useCallback((graphics) => {
        graphics.clear();
        graphics.beginFill(couleur);
        graphics.drawRoundedRect(x, y, largeur, hauteur);
        graphics.endFill();
    }, [largeur, hauteur, couleur]);

    return <pixiGraphics draw={draw} x={x} y={y} />;
};