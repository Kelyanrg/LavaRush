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
    const plateformes = [
        { x: 100, y: 400, width: 120, height: 20 },
        { x: 300, y: 300, width: 120, height: 20 },
        { x: 500, y: 200, width: 120, height: 20 },
        { x: 700, y: 100, width: 120, height: 20 }
    ];

    if (!backgroundTexture) return null

    return (
        <pixiContainer>
            <pixiSprite
                width={canvasSize.width}
                height={canvasSize.height}
                texture={backgroundTexture}
            />
            {plateformes.map((plat, index) => (
                <Plateforme key={index} x={plat.x} y={plat.y} />
            ))}
            <Joueur plateformes={plateformes} />
            {children}
        </pixiContainer>
    );
};