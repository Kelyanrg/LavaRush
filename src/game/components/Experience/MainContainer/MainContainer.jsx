import { extend } from "@pixi/react";
import { Container, Assets, Sprite, Graphics } from 'pixi.js';
import { useState, useEffect } from "react";
import backgroundAsset from '../../../assets/GalaxieDeLaink.jpg';
import { Plateforme } from '../../Objects/Platforme.jsx'
import { Joueur } from '../../Objects/Joueur.jsx'
extend({ Container, Sprite, Graphics });
export const MainContainer = ({ canvasSize, children }) => {
    const [backgroundTexture, setBackgroundTexture] = useState(null);
    useEffect(() => {
        Assets.load(backgroundAsset).then((texture) => {
            setBackgroundTexture(texture);
        });
    }, []);

    if (!backgroundTexture) return null

    return (
        <pixiContainer>
            <pixiSprite
                width={canvasSize.width}
                height={canvasSize.height}
                texture={backgroundTexture}
            />
            <Plateforme x={100} y={100} />
            <Plateforme x={100} y={150} />
            <Joueur />
            {children}
        </pixiContainer>
    );
};