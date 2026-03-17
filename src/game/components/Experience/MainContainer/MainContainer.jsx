import { extend } from "@pixi/react"
import { Container, Sprite, Graphics, Text } from 'pixi.js'
import { useState, useEffect, useRef } from "react"
import { Plateforme } from '../../Objects/Platforme.jsx'
import { Joueur } from '../../Objects/Joueur.jsx'
import { ParallaxBackground } from '../../Objects/ParallaxBackground.jsx'
import * as PIXI from 'pixi.js'
import { Lave } from '../../Objects/Lave.jsx'

extend({ Container, Sprite, Graphics, Text })

export const MainContainer = ({ canvasSize, children, onGameOver }) => {

    const score = useRef(0);
    const [scoreAffiche, setScoreAffiche] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    if (!canvasSize || !canvasSize.width || !canvasSize.height) return null;

    const PLAY_AREA_WIDTH = Math.floor(canvasSize.width * 0.45);
    const offsetX = (canvasSize.width - PLAY_AREA_WIDTH) / 2;

    const PLAT_WIDTH = PLAY_AREA_WIDTH / 5 - (PLAY_AREA_WIDTH / 50) * 2;
    const PLAT_HEIGHT = PLAT_WIDTH / 6;
    const PLAT_MARGIN = PLAT_WIDTH / 10;

    const [texturesBiomes, setTexturesBiomes] = useState([]);
    const [texturesTowersLeft, setTexturesTowersLeft] = useState([]);
    const [texturesTowersRight, setTexturesTowersRight] = useState([]);

    useEffect(() => {
        Promise.all([
            PIXI.Assets.load('/background1.png'),
            PIXI.Assets.load('/background2.png'),
            PIXI.Assets.load('/tower_left.png'),
            PIXI.Assets.load('/tower_right.png'),
        ]).then(([b1, b2, tl, tr]) => {
            setTexturesBiomes([b1, b2, b1, b2]);
            setTexturesTowersLeft([tl, tl, tl, tl, tl, tl]);
            setTexturesTowersRight([tr, tr, tr, tr, tr, tr]);
        });
    }, []); 

    useEffect(() => {
        if (isGameOver && onGameOver) {
            const finalScore = scoreAffiche;
            onGameOver(finalScore);
        }
    }, [isGameOver, onGameOver, scoreAffiche]);

    const [plateformes, setPlateformes] = useState([
        { x: (PLAY_AREA_WIDTH - PLAT_WIDTH - PLAT_MARGIN) / 4 + PLAT_MARGIN, y: 500, width: PLAT_WIDTH, height: PLAT_HEIGHT },
        { x: (PLAY_AREA_WIDTH - PLAT_WIDTH - PLAT_MARGIN) / 4 + PLAT_MARGIN, y: 400, width: PLAT_WIDTH, height: PLAT_HEIGHT },
        { x: 2 * (PLAY_AREA_WIDTH - PLAT_WIDTH - PLAT_MARGIN) / 4 + PLAT_MARGIN, y: 300, width: PLAT_WIDTH, height: PLAT_HEIGHT },
        { x: 2 * (PLAY_AREA_WIDTH - PLAT_WIDTH - PLAT_MARGIN) / 4 + PLAT_MARGIN, y: 100, width: PLAT_WIDTH, height: PLAT_HEIGHT },
        { x: 3 * (PLAY_AREA_WIDTH - PLAT_WIDTH - PLAT_MARGIN) / 4 + PLAT_MARGIN, y: 200, width: PLAT_WIDTH, height: PLAT_HEIGHT },
        { x: 4 * (PLAY_AREA_WIDTH - PLAT_WIDTH - PLAT_MARGIN) / 4 + PLAT_MARGIN, y: 100, width: PLAT_WIDTH, height: PLAT_HEIGHT }
    ]);

    const genererPalier = (yMax) => {
        const newY = Math.floor(yMax) - 120;
        const nbPlateformes = 2 + Math.floor(Math.random() * 2);

        const emplacements = [0, 1, 2, 3, 4].map(i =>
            Math.floor(i * (PLAY_AREA_WIDTH - PLAT_WIDTH - PLAT_MARGIN) / 4 + PLAT_MARGIN)
        );

        const choisis = emplacements
            .sort(() => Math.random() - 0.5)
            .slice(0, nbPlateformes);

        return choisis.map(x => ({
            x,
            y: newY,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT
        }));
    };

    const mondeRef = useRef(null);
    const cameraY = useRef(0);
    const dernierY = useRef(0);
    const laveY = useRef(10000);

    const handlePositionChange = ({ y }) => {
        if (!mondeRef.current) return;

        const joueurEcranY = y + cameraY.current;
        const milieu = canvasSize.height / 2;

        if (joueurEcranY < milieu && dernierY.current > y) {
            const diff = milieu - joueurEcranY;

            score.current += diff;
            setScoreAffiche(Math.floor(score.current / 10));

            cameraY.current += diff;
            mondeRef.current.y = cameraY.current;

            setPlateformes(prev => {
                const nouvelles = [...prev];
                while (Math.min(...nouvelles.map(p => p.y)) > y - canvasSize.height) {
                    const palier = genererPalier(Math.min(...nouvelles.map(p => p.y)));
                    nouvelles.push(...palier);
                }
                return nouvelles.filter(p => p.y < y + canvasSize.height);
            });
        }
        if (joueurEcranY > milieu && dernierY.current < y) {
            const diff = joueurEcranY - milieu;
            cameraY.current -= diff;
            mondeRef.current.y = cameraY.current;
            score.current -= diff;
            setScoreAffiche(Math.floor(score.current / 10));
        }
        dernierY.current = y;

        const tailleJoueur = PLAT_MARGIN * 2;
        if (y + tailleJoueur >= laveY.current) {
            setIsGameOver(true);
        }

        if (joueurEcranY > canvasSize.height + 50) {
            setIsGameOver(true);
        }
    };

    if (texturesBiomes.length === 0 || texturesTowersLeft.length === 0 || texturesTowersRight.length === 0) return null;

    return (
        <pixiContainer>
            <ParallaxBackground
                biomeTextures={texturesBiomes}
                towerTexturesLeft={texturesTowersLeft}
                towerTexturesRight={texturesTowersRight}
                canvasSize={canvasSize}
                cameraY={cameraY}
            />

            <pixiContainer ref={mondeRef} x={offsetX}>

                <Lave
                    playAreaWidth={PLAY_AREA_WIDTH}
                    canvasHeight={canvasSize.height}
                    cameraY={cameraY}
                    laveY={laveY}
                />

                {plateformes.map((plat, index) => (
                    <Plateforme key={index} x={plat.x} y={plat.y} largeur={plat.width} hauteur={plat.height} />
                ))}

                <Joueur
                    plateformes={plateformes}
                    onPositionChange={handlePositionChange}
                    playAreaWidth={PLAY_AREA_WIDTH}
                    taillejoueur={PLAT_MARGIN * 2}
                />
            </pixiContainer>

            <pixiText
                text={`Hauteur : ${scoreAffiche}m`}
                x={10}
                y={10}
                style={{ fill: 0xffffff, fontSize: 24, fontWeight: 'bold' }}
            />
            {children}
        </pixiContainer>
    );
};