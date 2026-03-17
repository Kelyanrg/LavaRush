import { extend } from "@pixi/react"
import { Container, Assets, Sprite, Graphics, Text } from 'pixi.js'
import { useState, useEffect, useRef } from "react"
import { Plateforme } from '../../Objects/Platforme.jsx'
import { Joueur } from '../../Objects/Joueur.jsx'
import { ParallaxBackground } from '../../Objects/ParallaxBackground.jsx'
import * as PIXI from 'pixi.js'

extend({ Container, Sprite, Graphics, Text })

export const MainContainer = ({ canvasSize, children }) => {

    const score = useRef(0);
    const [scoreAffiche, setScoreAffiche] = useState(0);

    const [gameOver, setGameOver] = useState(false)
    const PLAY_AREA_WIDTH = Math.floor(canvasSize.width * 0.45)
    const offsetX = (canvasSize.width - PLAY_AREA_WIDTH) / 2;

    const [texturesBiomes, setTexturesBiomes] = useState([]);
    const [texturesTowersLeft, setTexturesTowersLeft] = useState([]);
    const [texturesTowersRight, setTexturesTowersRight] = useState([]);

    useEffect(() => {
        Promise.all([
            PIXI.Assets.load('/background2.png'),
            PIXI.Assets.load('/background3.png'),

            PIXI.Assets.load('/tower_left.png'),
            PIXI.Assets.load('/tower_right.png'),
        ]).then(([b1, b2, tl, tr]) => {

            setTexturesBiomes([b1, b2, b1, b2]);
            setTexturesTowersLeft([tl, tl, tl, tl, tl, tl]);
            setTexturesTowersRight([tr, tr, tr, tr, tr, tr]);
        });
    }, []);


    const [plateformes, setPlateformes] = useState([
        { x: (PLAY_AREA_WIDTH - 120) / 4, y: 500, width: 120, height: 20 },
        { x: (PLAY_AREA_WIDTH - 120) / 4, y: 400, width: 120, height: 20 },
        { x: 2 * (PLAY_AREA_WIDTH - 120) / 4, y: 300, width: 120, height: 20 },
        { x: 2 * (PLAY_AREA_WIDTH - 120) / 4, y: 100, width: 120, height: 20 },
        { x: 3 * (PLAY_AREA_WIDTH - 120) / 4, y: 200, width: 120, height: 20 },
        { x: 4 * (PLAY_AREA_WIDTH - 120) / 4, y: 100, width: 120, height: 20 }
    ])

    const genererPalier = (yMax) => {
        const newY = Math.floor(yMax) - 120
        const nbPlateformes = 2 + Math.floor(Math.random() * 2)
        const largeur = 120

        const emplacements = [0, 1, 2, 3, 4].map(i =>
            Math.floor(i * (PLAY_AREA_WIDTH - largeur) / 4)
        )

        const choisis = emplacements
            .sort(() => Math.random() - 0.5)
            .slice(0, nbPlateformes)

        return choisis.map(x => ({
            x,
            y: newY,
            width: largeur,
            height: 20
        }))

    }

    const mondeRef = useRef(null)
    const cameraY = useRef(0)
    const dernierY = useRef(0)


    const handlePositionChange = ({ y }) => {
        if (!mondeRef.current) return

        const joueurEcranY = y + cameraY.current

        const milieu = canvasSize.height / 2

        if (joueurEcranY < milieu && dernierY.current > y) {
            const diff = milieu - joueurEcranY

            score.current += diff;
            setScoreAffiche(Math.floor(score.current / 10))

            cameraY.current += diff

            mondeRef.current.y = cameraY.current
            setPlateformes(prev => {
                const nouvelles = [...prev]

                while (Math.min(...nouvelles.map(p => p.y)) > y - canvasSize.height) {
                    const palier = genererPalier(Math.min(...nouvelles.map(p => p.y)))
                    nouvelles.push(...palier)
                }

                return nouvelles.filter(p => p.y < y + canvasSize.height)
            })
        }
        if (joueurEcranY > milieu && dernierY.current < y) {
            const diff = joueurEcranY - milieu
            cameraY.current -= diff
            mondeRef.current.y = cameraY.current
            score.current -= diff;
            setScoreAffiche(Math.floor(score.current / 10))
        }
        dernierY.current = y
        if (joueurEcranY > canvasSize.height + 50) {
            setGameOver(true);
        }
    }

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
                {plateformes.map((plat, index) => (
                    <Plateforme key={index} x={plat.x} y={plat.y} />
                ))}
                <Joueur
                    plateformes={plateformes}
                    onPositionChange={handlePositionChange}
                    playAreaWidth={PLAY_AREA_WIDTH}
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
    )
}