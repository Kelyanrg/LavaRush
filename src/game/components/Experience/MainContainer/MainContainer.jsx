import { extend, useTick } from "@pixi/react";
import { Container, Sprite, Graphics, Text, Assets } from "pixi.js";
import { useState, useEffect, useRef } from "react";
import { Plateforme } from "../../Objects/Platforme.jsx";
import { Joueur } from "../../Objects/Joueur.jsx";
import { Spikes } from "../../Objects/Spikes.jsx";
import { ParallaxBackground } from "../../Objects/ParallaxBackground.jsx";
import * as PIXI from "pixi.js";
import { Lave } from "../../Objects/Lave.jsx";
import { checkCollision } from "../../../helpers/common.js";
import { Mob } from "../../Objects/Mob.jsx";

extend({ Container, Sprite, Graphics, Text });

export const MainContainer = ({ canvasSize, children, onGameOver }) => {
    const scaleX = canvasSize.width / 480;
    const scaleY = canvasSize.height / 720;
    const scale = Math.min(scaleX, scaleY); // échelle uniforme
    const score = useRef(0);
    const [scoreAffiche, setScoreAffiche] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    if (!canvasSize || !canvasSize.width || !canvasSize.height) return null;

    const PLAY_AREA_WIDTH = Math.floor(canvasSize.width * 0.428);
    const offsetX = (canvasSize.width - PLAY_AREA_WIDTH) / 2;

    const PLAT_WIDTH = PLAY_AREA_WIDTH / 5 - (PLAY_AREA_WIDTH / 50) * 2;
    const PLAT_HEIGHT = (PLAT_WIDTH / 6) * 1.2;
    const PLAT_MARGIN = PLAT_WIDTH / 10;
    const acceleration = PLAT_WIDTH / 25;

    const JOUEUR_WIDTH = PLAT_MARGIN * 1.8;
    const JOUEUR_HEIGHT = JOUEUR_WIDTH * 1.8;

    const MOB_WIDTH = PLAT_MARGIN * 6;
    const MOB_HEIGHT = MOB_WIDTH * 0.6;
    const MOB_OFFSET_Y = MOB_HEIGHT + 10;

    const BAS_Y = canvasSize.height - 250;
    const GAP_BETWEEN_PLAT = canvasSize.height / 5.9;

    const colonnesX = [0, 1, 2, 3, 4].map((i) =>
        Math.floor(
            (i * (PLAY_AREA_WIDTH - PLAT_WIDTH - PLAT_MARGIN)) / 4 + PLAT_MARGIN,
        ),
    );

    const joueurStartX = colonnesX[2] + PLAT_WIDTH / 2 - JOUEUR_WIDTH / 2;
    const joueurStartY = BAS_Y - JOUEUR_HEIGHT - 10;

    const [plateformes, setPlateformes] = useState([
        {
            emplacements: 1,
            x: colonnesX[1],
            y: BAS_Y,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT,
        },
        {
            emplacements: 2,
            x: colonnesX[2],
            y: BAS_Y,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT,
        },
        {
            emplacements: 3,
            x: colonnesX[3],
            y: BAS_Y,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT,
        },

        {
            emplacements: 1,
            x: colonnesX[1],
            y: BAS_Y - GAP_BETWEEN_PLAT,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT,
        },
        {
            emplacements: 3,
            x: colonnesX[3],
            y: BAS_Y - GAP_BETWEEN_PLAT,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT,
        },

        {
            emplacements: 0,
            x: colonnesX[0],
            y: BAS_Y - GAP_BETWEEN_PLAT * 2,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT,
        },
        {
            emplacements: 4,
            x: colonnesX[4],
            y: BAS_Y - GAP_BETWEEN_PLAT * 2,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT,
        },

        {
            emplacements: 1,
            x: colonnesX[1],
            y: BAS_Y - GAP_BETWEEN_PLAT * 3,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT,
        },
        {
            emplacements: 3,
            x: colonnesX[3],
            y: BAS_Y - GAP_BETWEEN_PLAT * 3,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT,
        },

        {
            emplacements: 2,
            x: colonnesX[2],
            y: BAS_Y - GAP_BETWEEN_PLAT * 4,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT,
        },
    ]);
    const [spikes, setSpikes] = useState([
        // { emplacements: 1, x: colonnesX[1], y: BAS_Y - 120 + PLAT_HEIGHT, width: PLAT_WIDTH, height: PLAT_HEIGHT / 2 }
    ]);

    const [texturesBiomes, setTexturesBiomes] = useState([]);
    const [texturesTowersLeft, setTexturesTowersLeft] = useState([]);
    const [texturesTowersRight, setTexturesTowersRight] = useState([]);
    const [texturePlatforme, setTexturePlatforme] = useState(null);
    const [texturesMob, setTexturesMob] = useState([]);
    const [texturesLaveTop, setTexturesLaveTop] = useState([]);
    const [texturesLaveBody, setTexturesLaveBody] = useState(null);

    useEffect(() => {
        Promise.all([
            PIXI.Assets.load("/assets/backgrounds/biome1.png"),
            PIXI.Assets.load("/assets/backgrounds/biome2.png"),
            PIXI.Assets.load("/assets/backgrounds/biome3.png"),
            PIXI.Assets.load("/assets/backgrounds/biome4.png"),
            PIXI.Assets.load("/assets/backgrounds/tower_left_1.png"),
            PIXI.Assets.load("/assets/backgrounds/tower_right_1.png"),
            PIXI.Assets.load("/assets/sprites/plateforme.png"),
            PIXI.Assets.load("/assets/sprites/bat_droite_bas.png"),
            PIXI.Assets.load("/assets/sprites/bat_droite_haut.png"),
            PIXI.Assets.load("/assets/sprites/bat_gauche_bas.png"),
            PIXI.Assets.load("/assets/sprites/bat_gauche_haut.png"),
            PIXI.Assets.load("/assets/sprites/lava1.png"),
            PIXI.Assets.load("/assets/sprites/lava2.png"),
            PIXI.Assets.load("/assets/sprites/lava3.png"),
            PIXI.Assets.load("/assets/sprites/lava4.png"),
            PIXI.Assets.load("/assets/sprites/lava_body.png"),
        ]).then(
            ([
                b1,
                b2,
                b3,
                b4,
                tl,
                tr,
                spritePlateforme,
                batDB,
                batDH,
                batGB,
                batGH,
                l1,
                l2,
                l3,
                l4,
                lavaBody,
            ]) => {
                setTexturesBiomes([b1, b2, b3, b4, b1, b2, b3, b4]);
                setTexturesTowersLeft([tl, tl, tl, tl, tl, tl]);
                setTexturesTowersRight([tr, tr, tr, tr, tr, tr]);
                setTexturePlatforme(spritePlateforme);
                setTexturesMob([batDB, batDH, batGB, batGH]);
                setTexturesLaveTop([l1, l2, l3, l4]);
                setTexturesLaveBody(lavaBody);
            },
        );
    }, []);

    useEffect(() => {
        if (isGameOver && onGameOver) {
            const finalScore = Math.max(0, scoreAffiche);
            onGameOver(finalScore);
        }
    }, [isGameOver]);

    const genererplatformes = (
        emplacementDeReference = 2,
        DIRECTIONS = [],
        newY = -1000,
        interdition = [],
        chanceSpawn = 0,
    ) => {
        let nouveauemplacement = -1;
        while (
            nouveauemplacement < 0 ||
            nouveauemplacement > 4 ||
            interdition.includes(nouveauemplacement)
        ) {
            const direction =
                DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
            nouveauemplacement = emplacementDeReference + direction;
        }
        return {
            emplacements: nouveauemplacement,
            x: colonnesX[nouveauemplacement],
            y: newY,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT,
            hasMob: Math.random() < chanceSpawn,
        };
    };

    const genererPalier = (yMax, emplacements) => {
        const newY = Math.floor(yMax) - GAP_BETWEEN_PLAT;
        const nbPlateformes = 1 + Math.floor(Math.random() * 2);
        // const nbPlateformes = 1;
        const DIRECTIONS = [-2, -1, -1, 0, 0, 1, 1, 2];
        const DIRECTIONS_SIMPLE = [-1, 0, 1];
        const altitudeActuelle = Math.floor(score.current / 10);
        let chanceSpawn = 0;

        if (altitudeActuelle > 0) {
            chanceSpawn = 0.15;
            if (altitudeActuelle >= 3800) chanceSpawn = 0.4;
            else if (altitudeActuelle >= 2800) chanceSpawn = 0.3;
            else if (altitudeActuelle >= 1800) chanceSpawn = 0.2;
            // let nouveauemplacement = -1;
            // while (nouveauemplacement < 0 || nouveauemplacement > 4) {
            //     const direction = DIRECTIONS[Math.floor(Math.random() * 8)];
            //     nouveauemplacement = (emplacements[0] + direction);
            // }
            const premierePlatforme = genererplatformes(
                emplacements[0],
                DIRECTIONS,
                newY,
                [],
                chanceSpawn,
            );

            if (nbPlateformes === 2) {
                // let nouveauemplacement2 = -1;
                // while (nouveauemplacement2 < 0 || nouveauemplacement2 > 4 || nouveauemplacement2 === nouveauemplacement) {
                //     const direction = DIRECTIONS[Math.floor(Math.random() * 8)];
                //     nouveauemplacement2 = (nouveauemplacement + direction);
                // }
                // return [
                //     { emplacements: nouveauemplacement, x: colonnesX[nouveauemplacement], y: newY, width: PLAT_WIDTH, height: PLAT_HEIGHT },
                //     { emplacements: nouveauemplacement2, x: colonnesX[nouveauemplacement2], y: newY, width: PLAT_WIDTH, height: PLAT_HEIGHT }
                // ];

                return [
                    premierePlatforme,
                    genererplatformes(
                        premierePlatforme.emplacements,
                        DIRECTIONS,
                        newY,
                        [premierePlatforme.emplacements],
                        chanceSpawn,
                    ),
                ];
            } else {
                return [premierePlatforme];
            }
        } else if (altitudeActuelle > 500) {
            if (altitudeActuelle >= 800) chanceSpawn = 0.3;
            const premierePlatforme = genererplatformes(
                emplacements[0],
                DIRECTIONS_SIMPLE,
                newY,
                [],
                chanceSpawn,
            );
            if (nbPlateformes === 2) {
                // let nouveauemplacement2 = -1;
                // while (nouveauemplacement2 < 0 || nouveauemplacement2 > 4 || nouveauemplacement2 === nouveauemplacement) {
                //     const direction = DIRECTIONS[Math.floor(Math.random() * 8)];
                //     nouveauemplacement2 = (nouveauemplacement + direction);
                // }
                // return [
                //     { emplacements: nouveauemplacement, x: colonnesX[nouveauemplacement], y: newY, width: PLAT_WIDTH, height: PLAT_HEIGHT },
                //     { emplacements: nouveauemplacement2, x: colonnesX[nouveauemplacement2], y: newY, width: PLAT_WIDTH, height: PLAT_HEIGHT }
                // ];

                return [
                    premierePlatforme,
                    genererplatformes(
                        premierePlatforme.emplacements,
                        DIRECTIONS_SIMPLE,
                        newY,
                        [premierePlatforme.emplacements],
                        chanceSpawn,
                    ),
                ];
            } else {
                return [premierePlatforme];
            }
        } else {
            // let nouveauemplacement = -1;
            // while (nouveauemplacement < 0 || nouveauemplacement > 4) {
            //     const direction = DIRECTIONS[Math.floor(Math.random() * 8)];
            //     nouveauemplacement = (emplacements[0] + direction);
            // }
            // let nouveauemplacement2 = -1;
            // while (nouveauemplacement2 < 0 || nouveauemplacement2 > 4 || nouveauemplacement2 === nouveauemplacement) {
            //     const direction = DIRECTIONS[Math.floor(Math.random() * 8)];
            //     nouveauemplacement2 = (nouveauemplacement + direction);
            // }
            const premierePlatforme = genererplatformes(
                emplacements[0],
                DIRECTIONS,
                newY,
            );
            const secondePlatforme = genererplatformes(
                premierePlatforme.emplacements,
                DIRECTIONS,
                newY,
                [premierePlatforme.emplacements],
            );
            if (nbPlateformes === 2) {
                return [
                    premierePlatforme,
                    secondePlatforme,
                    genererplatformes(secondePlatforme.emplacements, DIRECTIONS, newY, [
                        premierePlatforme.emplacements,
                        secondePlatforme.emplacements,
                    ]),
                ];
            } else {
                return [premierePlatforme, secondePlatforme];
            }
        }

        // const emplacements = [0, 1, 2, 3, 4].map(i =>
        //     Math.floor(i * (PLAY_AREA_WIDTH - PLAT_WIDTH - PLAT_MARGIN) / 4 + PLAT_MARGIN)
        // );
    };
    console.log(acceleration);
    const mondeRef = useRef(null);
    const cameraY = useRef(0);
    const cibleCameraY = useRef(0);
    const dernierY = useRef(0);
    const laveY = useRef(1000);
    const mobsRef = useRef({});

    const handlePositionChange = ({ x, y }) => {
        if (!mondeRef.current) return;

        const joueurEcranY = y + cibleCameraY.current;
        const milieu = canvasSize.height / 2;
        const limiteBas = canvasSize.height - 150;

        if (joueurEcranY < milieu && dernierY.current > y) {
            const diff = milieu - joueurEcranY;

            score.current += diff;
            setScoreAffiche(Math.floor(score.current / 10));

            cibleCameraY.current += diff;

            setPlateformes((prev) => {
                const nouvelles = [...prev];
                while (Math.min(...nouvelles.map((p) => p.y)) > y - canvasSize.height) {
                    const yMin = Math.min(...nouvelles.map((p) => p.y));
                    const emplacementsDernierPalier = nouvelles
                        .filter((p) => p.y === yMin)
                        .map((p) => p.emplacements);
                    const palier = genererPalier(
                        Math.min(...nouvelles.map((p) => p.y)),
                        emplacementsDernierPalier,
                    );
                    nouvelles.push(...palier);
                }
                return nouvelles;
            });
        }

        if (joueurEcranY > limiteBas && dernierY.current < y) {
            const diff = joueurEcranY - limiteBas;
            cibleCameraY.current -= diff;
            score.current -= diff;
            setScoreAffiche(Math.floor(score.current / 10));
        }

        dernierY.current = y;

        if (y + JOUEUR_HEIGHT >= laveY.current) {
            setIsGameOver(true);
        }

        if (joueurEcranY > canvasSize.height + 50) {
            setIsGameOver(true);
        }

        if (mobsRef.current) {
            const joueurRect = { x, y, width: JOUEUR_WIDTH, height: JOUEUR_HEIGHT };

            for (const mobId in mobsRef.current) {
                if (checkCollision(joueurRect, mobsRef.current[mobId])) {
                    setIsGameOver(true);
                }
            }
        }
    };

    useTick((ticker) => {
        cameraY.current +=
            (cibleCameraY.current - cameraY.current) * 0.15 * ticker.deltaTime;

        if (mondeRef.current) {
            mondeRef.current.y = Math.floor(cameraY.current);
        }

        setPlateformes((prev) => {
            const doitNettoyer = prev.some((p) => p.y >= laveY.current);
            if (doitNettoyer) {
                return prev.filter((p) => p.y < laveY.current);
            }
            return prev;
        });
    });

    if (
        texturesBiomes.length === 0 ||
        texturesTowersLeft.length === 0 ||
        texturesTowersRight.length === 0 ||
        texturesMob.length === 0 ||
        texturesLaveTop.length === 0 ||
        !texturesLaveBody
    )
        return null;

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
                {plateformes.map((plat) => (
                    <Plateforme
                        key={`plat-${plat.x}-${plat.y}`}
                        x={plat.x}
                        y={plat.y}
                        largeur={plat.width}
                        hauteur={plat.height}
                        texturePlatforme={texturePlatforme}
                    />
                ))}

                {spikes.map((spike) => (
                    <Spikes
                        key={`spike-${spike.x}-${spike.y}`}
                        x={spike.x}
                        y={spike.y}
                        width={spike.width}
                        height={spike.height}
                    />
                ))}

                {plateformes
                    .filter((plat) => plat.hasMob)
                    .map((plat) => {
                        const assignedColumnIdx = plat.emplacements;

                        let leftNeighborIdx = assignedColumnIdx - 1;
                        let rightNeighborIdx = assignedColumnIdx + 1;

                        if (assignedColumnIdx === 0) {
                            leftNeighborIdx = 0;
                            rightNeighborIdx = 2;
                        } else if (assignedColumnIdx === colonnesX.length - 1) {
                            leftNeighborIdx = colonnesX.length - 3;
                            rightNeighborIdx = colonnesX.length - 1;
                        }

                        const limitLeftX = colonnesX[leftNeighborIdx];
                        const limitRightX = colonnesX[rightNeighborIdx] + plat.width;

                        return (
                            <Mob
                                key={`mob-${plat.x}-${plat.y}`}
                                id={`mob-${plat.x}-${plat.y}`}
                                mobsRef={mobsRef}
                                y={plat.y - MOB_OFFSET_Y}
                                width={MOB_WIDTH}
                                height={MOB_HEIGHT}
                                limitLeftX={limitLeftX}
                                limitRightX={limitRightX}
                                texturesMobs={texturesMob}
                            />
                        );
                    })}

                <Lave
                    playAreaWidth={PLAY_AREA_WIDTH}
                    canvasHeight={canvasSize.height}
                    cameraY={cameraY}
                    laveY={laveY}
                    texturesSurface={texturesLaveTop}
                    textureCorps={texturesLaveBody}
                />

                <Joueur
                    plateformes={plateformes}
                    spikes={spikes}
                    onPositionChange={handlePositionChange}
                    playAreaWidth={PLAY_AREA_WIDTH}
                    taillejoueur={PLAT_MARGIN * 2}
                    acceleration={acceleration}
                    isGameOver={isGameOver}
                    largeurJoueur={JOUEUR_WIDTH}
                    hauteurJoueur={JOUEUR_HEIGHT}
                    startX={joueurStartX}
                    startY={joueurStartY}
                />
            </pixiContainer>

            <pixiText
                text={`Hauteur : ${scoreAffiche}m`}
                x={10}
                y={10}
                style={{ fill: 0xffffff, fontSize: 24, fontWeight: "bold" }}
            />
            {children}
        </pixiContainer>
    );
};
