import { extend } from "@pixi/react";
import { Container, Assets, Sprite, Graphics } from 'pixi.js';
import { useState, useEffect, useRef } from "react";
import backgroundAsset from '../../../assets/StarsBackground.jpg';
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
    const [plateformes, setPlateformes] = useState([
        { x: (canvasSize.width - 120) / 4, y: 400, width: 120, height: 20 },
        { x: 2 * (canvasSize.width - 120) / 4, y: 300, width: 120, height: 20 },
        { x: 2 * (canvasSize.width - 120) / 4, y: 100, width: 120, height: 20 },
        { x: 3 * (canvasSize.width - 120) / 4, y: 200, width: 120, height: 20 },
        { x: 4 * (canvasSize.width - 120) / 4, y: 100, width: 120, height: 20 }
    ]);
    const genererPalier = (yMax) => {
        const newY = Math.floor(yMax) - 120;
        const nbPlateformes = 2 + Math.floor(Math.random() * 2);
        const largeur = 120;

        const emplacements = [0, 1, 2, 3, 4].map(i =>
            Math.floor(i * (canvasSize.width - largeur) / 4)
        );

        const choisis = emplacements
            .sort(() => Math.random() - 0.5)
            .slice(0, nbPlateformes);

        return choisis.map(x => ({
            x,
            y: newY,
            width: largeur,
            height: 20
        }));

    };
    const genererPlateforme = (yMax) => {
        const newY = yMax - (80 + Math.random() * 80);
        const newX = 50 + Math.random() * (canvasSize.width - 170)
        return {
            x: newX,
            y: newY,
            width: 120,
            height: 20
        };
    }
    const mondeRef = useRef(null);   // référence au Container PixiJS
    const cameraY = useRef(0);
    const dernierY = useRef(0);
    const handlePositionChange = ({ y }) => {
        if (!mondeRef.current) return;

        // Position réelle du joueur sur l'écran
        // (sa position dans le monde + le décalage de la caméra)
        const joueurEcranY = y + cameraY.current;

        // Le joueur dépasse le milieu de l'écran vers le haut ?
        const milieu = canvasSize.height / 2;

        if (joueurEcranY < milieu && dernierY.current > y) {
            // Calcul de combien il faut scroller
            const diff = milieu - joueurEcranY;

            // On accumule le scroll total
            cameraY.current += diff;

            // On déplace physiquement le Container vers le bas
            mondeRef.current.y = cameraY.current;
            setPlateformes(prev => {
                const nouvelles = [...prev];

                while (Math.min(...nouvelles.map(p => p.y)) > y - canvasSize.height) {
                    // ✅ génère un palier entier (2-3 plateformes) au lieu d'une seule
                    const palier = genererPalier(Math.min(...nouvelles.map(p => p.y)));
                    nouvelles.push(...palier); // ... pour aplatir le tableau
                }

                return nouvelles.filter(p => p.y < y + canvasSize.height);
            });
        }
        if (joueurEcranY > milieu && dernierY.current < y) {
            const diff = joueurEcranY - milieu;
            cameraY.current -= diff;
            mondeRef.current.y = cameraY.current;
        }
        dernierY.current = y;
        if (joueurEcranY > canvasSize.height + 50) {
            setGameOver(true);
        }
    };

    if (!backgroundTexture) return null
    console.log("plateformes:", plateformes, Array.isArray(plateformes));
    return (
        <pixiContainer>
            <pixiSprite
                width={canvasSize.width}
                height={canvasSize.height}
                texture={backgroundTexture}
            />
            <pixiContainer ref={mondeRef}>
                {plateformes.map((plat, index) => (
                    <Plateforme key={index} x={plat.x} y={plat.y} />
                ))}
                <Joueur plateformes={plateformes} onPositionChange={handlePositionChange} />
            </pixiContainer>
            {children}
        </pixiContainer>
    );
};