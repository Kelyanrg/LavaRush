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


export const MainContainer = ({ canvasSize, children, onGameOver, isMuted = false, onScoreUpdate, onAlert }) => {
    const scaleX = canvasSize.width / 1440;
    const scaleY = canvasSize.height / 700;
    const scale = Math.min(scaleX, scaleY);

    const score = useRef(0);
    const maxScore = useRef(0);
    const lastReportedScore = useRef(-1);
    const scoreAfficheRef = useRef(-1);

    const [isGameOver, setIsGameOver] = useState(false);

    if (!canvasSize || !canvasSize.width || !canvasSize.height) return null;

    const isMobileView = canvasSize.width < 768;
    const PLAY_AREA_WIDTH = Math.floor(canvasSize.width * (isMobileView ? 0.96 : 0.428));
    const offsetX = (canvasSize.width - PLAY_AREA_WIDTH) / 2;

    const PLAT_WIDTH = PLAY_AREA_WIDTH / 5 - ((PLAY_AREA_WIDTH / 50) * 2);
    const PLAT_HEIGHT = (PLAT_WIDTH / 6) * 1.2;
    const PLAT_MARGIN = PLAY_AREA_WIDTH / 50;

    const JOUEUR_WIDTH = PLAT_MARGIN * 3;
    const JOUEUR_HEIGHT = JOUEUR_WIDTH * 2;

    const MOB_WIDTH = PLAT_MARGIN * 6;
    const MOB_HEIGHT = MOB_WIDTH * 0.6;
    const MOB_OFFSET_Y = MOB_HEIGHT + 10;

    const BAS_Y = canvasSize.height - 250;
    const GAP_BETWEEN_PLAT = canvasSize.height / 5.9;

    const SPIKE_HEIGHT = PLAT_HEIGHT / 2;

    const colonnesX = [0, 1, 2, 3, 4].map((i) =>
        Math.floor(
            (i * (PLAT_WIDTH + 2 * PLAT_MARGIN)) + PLAT_MARGIN,
        ),
    );

    const joueurStartX = colonnesX[2] + PLAT_WIDTH / 2 - JOUEUR_WIDTH / 2;
    const joueurStartY = BAS_Y - JOUEUR_HEIGHT - 10;

    const [plateformes, setPlateformes] = useState([
        { emplacements: 1, x: colonnesX[1], y: BAS_Y, width: PLAT_WIDTH, height: PLAT_HEIGHT },
        { emplacements: 2, x: colonnesX[2], y: BAS_Y, width: PLAT_WIDTH, height: PLAT_HEIGHT },
        { emplacements: 3, x: colonnesX[3], y: BAS_Y, width: PLAT_WIDTH, height: PLAT_HEIGHT },

        { emplacements: 1, x: colonnesX[1], y: BAS_Y - 120, width: PLAT_WIDTH, height: PLAT_HEIGHT },
        { emplacements: 3, x: colonnesX[3], y: BAS_Y - 120, width: PLAT_WIDTH, height: PLAT_HEIGHT },

        { emplacements: 0, x: colonnesX[0], y: BAS_Y - 240, width: PLAT_WIDTH, height: PLAT_HEIGHT },
        { emplacements: 4, x: colonnesX[4], y: BAS_Y - 240, width: PLAT_WIDTH, height: PLAT_HEIGHT, hasSpike: true },

        { emplacements: 1, x: colonnesX[1], y: BAS_Y - 360, width: PLAT_WIDTH, height: PLAT_HEIGHT },
        { emplacements: 3, x: colonnesX[3], y: BAS_Y - 360, width: PLAT_WIDTH, height: PLAT_HEIGHT },

        { emplacements: 2, x: colonnesX[2], y: BAS_Y - 480, width: PLAT_WIDTH, height: PLAT_HEIGHT },
    ]);

    const [spikes, setSpikes] = useState([{
        emplacements: 4,
        x: colonnesX[4],
        y: (BAS_Y - 240) + PLAT_HEIGHT,
        width: PLAT_WIDTH,
        height: SPIKE_HEIGHT
    }]);

    const alerte800m = useRef(false);
    const alerte1400m = useRef(false);
    const mob850mSpawned = useRef(false);

    const musicRef = useRef(null);

    if (!musicRef.current) {
        musicRef.current = new Audio("/assets/audio/sound_in_game.mp3");
        musicRef.current.loop = true;
        musicRef.current.volume = 0.08;
    }

    useEffect(() => {
        const music = musicRef.current;

        const playAudio = () => {
            music.play().then(() => {
                window.removeEventListener('mousedown', playAudio);
                window.removeEventListener('keydown', playAudio);
                window.removeEventListener('touchstart', playAudio);
            }).catch(() => { });
        };

        const handleVisibility = () => {
            if (document.hidden) {
                music.pause();
            } else if (!isMuted) {
                music.play().catch(() => { });
            }
        };

        window.addEventListener('mousedown', playAudio);
        window.addEventListener('keydown', playAudio);
        window.addEventListener('touchstart', playAudio);
        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('pagehide', () => music.pause());

        return () => {
            window.removeEventListener('mousedown', playAudio);
            window.removeEventListener('keydown', playAudio);
            window.removeEventListener('touchstart', playAudio);
            document.removeEventListener('visibilitychange', handleVisibility);
            music.pause();
            music.currentTime = 0;
        };
    }, []);

    useEffect(() => {
        if (musicRef.current) {
            musicRef.current.volume = isMuted ? 0 : 0.08;
        }
    }, [isMuted]);

    const [texturesBiomes, setTexturesBiomes] = useState([]);
    const [texturesTowersLeft, setTexturesTowersLeft] = useState([]);
    const [texturesTowersRight, setTexturesTowersRight] = useState([]);
    const [texturesPlatforme, setTexturesPlatforme] = useState(null);
    const [texturesMob, setTexturesMob] = useState([]);
    const [textureSpikes, setTextureSpikes] = useState(null);
    const [texturesLaveTop, setTexturesLaveTop] = useState([]);
    const [texturesLaveBody, setTexturesLaveBody] = useState(null);
    const [texturesPerso, setTexturesPerso] = useState([]);

    useEffect(() => {
        Promise.all([
            PIXI.Assets.load("/assets/backgrounds/biome1.png"),
            PIXI.Assets.load("/assets/backgrounds/biome2.png"),
            PIXI.Assets.load("/assets/backgrounds/biome2.1.png"),
            PIXI.Assets.load("/assets/backgrounds/biome3.png"),
            PIXI.Assets.load("/assets/backgrounds/biome4.png"),
            PIXI.Assets.load("/assets/backgrounds/biome5.png"),
            PIXI.Assets.load("/assets/backgrounds/biome6.png"),
            PIXI.Assets.load("/assets/backgrounds/biome7.png"),
            PIXI.Assets.load("/assets/backgrounds/biome8.png"),
            PIXI.Assets.load("/assets/backgrounds/biome9.png"),
            PIXI.Assets.load("/assets/backgrounds/biome10.png"),
            PIXI.Assets.load("/assets/backgrounds/biome11.png"),
            PIXI.Assets.load("/assets/backgrounds/biome12.png"),
            PIXI.Assets.load("/assets/backgrounds/biome13.png"),
            PIXI.Assets.load("/assets/backgrounds/tower_left_1.png"),
            PIXI.Assets.load("/assets/backgrounds/tower_right_1.png"),
            PIXI.Assets.load("/assets/sprites/plateforme.png"),
            PIXI.Assets.load("/assets/sprites/bat_droite_bas.png"),
            PIXI.Assets.load("/assets/sprites/bat_droite_haut.png"),
            PIXI.Assets.load("/assets/sprites/bat_gauche_bas.png"),
            PIXI.Assets.load("/assets/sprites/bat_gauche_haut.png"),
            PIXI.Assets.load("/assets/sprites/lava1_v3.png"),
            PIXI.Assets.load("/assets/sprites/lava2_v3.png"),
            PIXI.Assets.load("/assets/sprites/lava3_v3.png"),
            PIXI.Assets.load("/assets/sprites/lava4_v3.png"),
            PIXI.Assets.load("/assets/sprites/lava_body.png"),
            PIXI.Assets.load("/assets/sprites/perso_neutre_droite.png"),
            PIXI.Assets.load("/assets/sprites/perso_neutre_gauche.png"),
            PIXI.Assets.load("/assets/sprites/perso_jump_droite.png"),
            PIXI.Assets.load("/assets/sprites/perso_jump_gauche.png"),
            PIXI.Assets.load("/assets/sprites/perso_run_droite.png"),
            PIXI.Assets.load("/assets/sprites/perso_run_gauche.png"),
            PIXI.Assets.load("/assets/sprites/plateforme_spike.png"),
            PIXI.Assets.load("/assets/fonts/super_squad/Super_Squad.ttf"),
            PIXI.Assets.load("/assets/fonts/acme/Acme-Regular.ttf"),
        ]).then(([b1, b2, b2b, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, tl, tr, spritePlateforme, batDB, batDH, batGB, batGH, l1, l2, l3, l4, lavaBody, persoND, persoNG, persoJD, persoJG, persoRD, persoRG, spikes]) => {
            setTexturesBiomes([b1, b2, b2b,  b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b13, b13, b13, b13, b13, b13, b13, b13]);
            setTexturesTowersLeft([tl, tl, tl, tl, tl, tl]);
            setTexturesTowersRight([tr, tr, tr, tr, tr, tr]);
            setTexturesPlatforme(spritePlateforme);
            setTexturesMob([batDB, batDH, batGB, batGH]);
            setTexturesLaveTop([l1, l2, l3, l4, l1, l2, l3, l4, l1, l2, l3, l4, l1, l2, l3, l4, l1, l2, l3, l4]);
            setTexturesLaveBody(lavaBody);
            setTexturesPerso([persoND, persoNG, persoJD, persoJG, persoRD, persoRG]);
            setTextureSpikes(spikes);
        });
    }, []);

    useEffect(() => {
        if (isGameOver && onGameOver) {
            const finalScore = Math.max(0, Math.floor(maxScore.current / 10));
            onGameOver(finalScore);
        }
    }, [isGameOver]);

    const genererplatformes = (emplacementDeReference = 2, DIRECTIONS = [], newY = -1000, interdition = [], chanceSpikes = 0) => {
        let nouveauemplacement = -1;
        while (
            nouveauemplacement < 0 ||
            nouveauemplacement > 4 ||
            interdition.includes(nouveauemplacement)
        ) {
            const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
            nouveauemplacement = emplacementDeReference + direction;
        }

        const isSpiked = chanceSpikes > 0 && Math.random() < chanceSpikes;

        if (isSpiked) {
            setSpikes(prev => [...prev, {
                emplacements: nouveauemplacement,
                x: colonnesX[nouveauemplacement],
                y: newY + PLAT_HEIGHT,
                width: PLAT_WIDTH,
                height: SPIKE_HEIGHT
            }]);
        }

        return {
            emplacements: nouveauemplacement,
            x: colonnesX[nouveauemplacement],
            y: newY,
            width: PLAT_WIDTH,
            height: PLAT_HEIGHT,
            hasMob: false,
            hasSpike: isSpiked
        };
    };

    const genererPalier = (yMax, emplacements) => {
        const newY = Math.floor(yMax) - GAP_BETWEEN_PLAT;

        const altitudePlateformePrecedente = Math.floor((BAS_Y - yMax) / 10);
        const altitudeNouvellePlateforme = Math.floor((BAS_Y - newY) / 10);

        const isPalier1500m = altitudePlateformePrecedente < 1500 && altitudeNouvellePlateforme >= 1500;

        let nbPlateformes = 1 + Math.floor(Math.random() * 2);
        const DIRECTIONS = [-2, -1, -1, 0, 0, 1, 1, 2];
        const DIRECTIONS_SIMPLE = [-1, 0, 1];

        const altitudeActuelle = Math.floor(maxScore.current / 10);
        let chanceSpawnMob = 0;

        if (altitudeActuelle > 1000) {
            chanceSpawnMob = 0.2;
            if (altitudeActuelle >= 3800) chanceSpawnMob = 0.5;
            else if (altitudeActuelle >= 2800) chanceSpawnMob = 0.4;
            else if (altitudeActuelle >= 1800) chanceSpawnMob = 0.3;
        } else if (altitudeActuelle > 500) {
            if (altitudeActuelle >= 800) chanceSpawnMob = 0.2;
        }

        let plateformesDuPalier = [];

        let forcerPic = false;
        if (isPalier1500m) {
            forcerPic = true;
            nbPlateformes = 2;
        }

        const chanceSpikes = forcerPic ? 1 : ((nbPlateformes === 1 || altitudeActuelle < 1500) ? 0 : (chanceSpawnMob / 2));

        const refCol = emplacements[Math.floor(Math.random() * emplacements.length)];

        if (altitudeActuelle > 1000) {
            const premierePlatforme = genererplatformes(refCol, DIRECTIONS, newY, [], chanceSpikes);
            if (nbPlateformes === 2) {
                const chanceSpikes2 = premierePlatforme.hasSpike ? 0 : chanceSpikes;
                plateformesDuPalier = [premierePlatforme, genererplatformes(premierePlatforme.emplacements, DIRECTIONS, newY, [premierePlatforme.emplacements], chanceSpikes2)];
            } else {
                plateformesDuPalier = [premierePlatforme];
            }
        } else if (altitudeActuelle > 500) {
            const premierePlatforme = genererplatformes(refCol, DIRECTIONS_SIMPLE, newY, [], chanceSpikes);
            if (nbPlateformes === 2) {
                const chanceSpikes2 = premierePlatforme.hasSpike ? 0 : chanceSpikes;
                plateformesDuPalier = [premierePlatforme, genererplatformes(premierePlatforme.emplacements, DIRECTIONS_SIMPLE, newY, [premierePlatforme.emplacements], chanceSpikes2)];
            } else {
                plateformesDuPalier = [premierePlatforme];
            }
        } else {
            const premierePlatforme = genererplatformes(refCol, DIRECTIONS, newY, [], 0);
            const secondePlatforme = genererplatformes(premierePlatforme.emplacements, DIRECTIONS, newY, [premierePlatforme.emplacements], 0);

            if (nbPlateformes === 2) {
                plateformesDuPalier = [
                    premierePlatforme,
                    secondePlatforme,
                    genererplatformes(secondePlatforme.emplacements, DIRECTIONS, newY, [premierePlatforme.emplacements, secondePlatforme.emplacements], 0),
                ];
            } else {
                plateformesDuPalier = [premierePlatforme, secondePlatforme];
            }
        }

        if (chanceSpawnMob > 0 && Math.random() < chanceSpawnMob) {
            const plateformesDispos = plateformesDuPalier.filter(p => !p.hasSpike);
            if (plateformesDispos.length > 0) {
                const indexAleatoire = Math.floor(Math.random() * plateformesDispos.length);
                plateformesDispos[indexAleatoire].hasMob = true;
            } else if (plateformesDuPalier.length > 0) {
                const indexAleatoire = Math.floor(Math.random() * plateformesDuPalier.length);
                plateformesDuPalier[indexAleatoire].hasMob = true;
            }
        }

        return plateformesDuPalier;
    };

    const mondeRef = useRef(null);
    const cameraY = useRef(0);
    const cibleCameraY = useRef(0);
    const dernierY = useRef(0);
    const laveY = useRef(1000);
    const mobsRef = useRef({});

    const handlePositionChange = ({ x, y }) => {
        if (!mondeRef.current || isGameOver) return;

        const joueurEcranY = y + cibleCameraY.current;
        const milieu = canvasSize.height * 0.5;
        const limiteBas = canvasSize.height - 150;

        if (joueurEcranY < milieu && dernierY.current > y) {
            const diff = milieu - joueurEcranY;

            score.current += diff;
            cibleCameraY.current += diff;

            if (score.current > maxScore.current) {
                maxScore.current = score.current;
            }

            const newScore = Math.floor(maxScore.current / 10);
            if (newScore !== lastReportedScore.current) {
                lastReportedScore.current = newScore;
                onScoreUpdate?.(newScore);
            }

            const yPlusHaut = plateformes.reduce((min, p) => p.y < min ? p.y : min, plateformes[0].y);

            if (yPlusHaut > y - canvasSize.height * 1.5) {
                setPlateformes(prev => {
                    const yMin = Math.min(...prev.map(p => p.y));

                    const dernierPalier = prev.filter(p => p.y === yMin).map(p => p.emplacements);
                    const gap = Math.floor(GAP_BETWEEN_PLAT);
                    const avantDernierPalier = prev.filter(p => p.y === yMin + gap).map(p => p.emplacements);

                    const nouveauPalier = genererPalier(yMin, dernierPalier);

                    nouveauPalier.forEach(nouvellePlat => {
                        const col = nouvellePlat.emplacements;
                        if (dernierPalier.includes(col) && avantDernierPalier.includes(col)) {
                            nouvellePlat.hasMob = false;
                        }
                    });

                    const altitudeDuPalier = Math.floor((BAS_Y - nouveauPalier[0].y) / 10);
                    if (altitudeDuPalier >= 850 && !mob850mSpawned.current) {
                        const platValide = nouveauPalier.find(p => !p.hasSpike);
                        if (platValide) {
                            platValide.hasMob = true;
                            mob850mSpawned.current = true;
                        }
                    }

                    return [...prev, ...nouveauPalier];
                });
            }
        }

        if (joueurEcranY > limiteBas && dernierY.current < y) {
            const diff = joueurEcranY - limiteBas;
            cibleCameraY.current -= diff;
            score.current -= diff;
        }

        const joueurRect = { x, y, width: JOUEUR_WIDTH, height: JOUEUR_HEIGHT };

        for (let s of spikes) {
            const spikeHitbox = {
                x: s.x + (s.width * 0.25),
                y: s.y + (s.height * 0.4),
                width: s.width * 0.5,
                height: s.height * 0.6
            };
            if (checkCollision(joueurRect, spikeHitbox)) {
                setIsGameOver(true);
                break;
            }
        }

        if (y + JOUEUR_HEIGHT >= laveY.current) {
            setIsGameOver(true);
        }

        if (joueurEcranY > canvasSize.height + 50) {
            setIsGameOver(true);
        }

        if (mobsRef.current) {
            for (const mobId in mobsRef.current) {
                const m = mobsRef.current[mobId];

                const mobHitbox = {
                    x: m.x + (m.width * 0.2),
                    y: m.y + (m.height * 0.2),
                    width: m.width * 0.6,
                    height: m.height * 0.6
                };

                if (checkCollision(joueurRect, mobHitbox)) {
                    setIsGameOver(true);
                    break;
                }
            }
        }

        dernierY.current = y;
    };

    useTick((ticker) => {
        if (isGameOver) return;

        const nouvellePositionCamera = cameraY.current + (cibleCameraY.current - cameraY.current) * 0.15 * ticker.deltaTime;
        cameraY.current = nouvellePositionCamera;

        if (mondeRef.current) {
            mondeRef.current.y = Math.floor(cameraY.current);
        }

        const altitudeActuelle = Math.floor(maxScore.current / 10);

        if (altitudeActuelle !== scoreAfficheRef.current) {
            scoreAfficheRef.current = altitudeActuelle;

            if (altitudeActuelle >= 800 && !alerte800m.current) {
                alerte800m.current = true;
                onAlert?.({ titre: "ALERTE !", corps: "Les chauves-souris arrivent !" });
            }

            if (altitudeActuelle >= 1400 && !alerte1400m.current) {
                alerte1400m.current = true;
                onAlert?.({ titre: "ALERTE !", corps: "Apparition de pics !" });
            }
        }

        if (Math.floor(ticker.lastTime / 16) % 30 === 0) {
            const limiteNettoyage = laveY.current + 200;

            const limiteHaute = -cameraY.current - canvasSize.height * 2;

            setPlateformes((prev) => {
                const aNettoyer = prev.some((p) => p.y >= limiteNettoyage || p.y < limiteHaute);
                if (aNettoyer) {
                    return prev.filter((p) => p.y < limiteNettoyage && p.y >= limiteHaute);
                }
                return prev;
            });

            setSpikes((prev) => {
                const aNettoyer = prev.some((s) => s.y >= limiteNettoyage || s.y < limiteHaute);
                if (aNettoyer) {
                    return prev.filter((s) => s.y < limiteNettoyage && s.y >= limiteHaute);
                }
                return prev;
            });
        }
    });

    console.log("update ok")

    if (texturesBiomes.length === 0 || texturesTowersLeft.length === 0 || texturesTowersRight.length === 0 || texturesMob.length === 0 || texturesLaveTop.length === 0 || !texturesLaveBody || texturesPerso.length === 0 || !textureSpikes) return null;

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
                        hauteur={plat.hasSpike ? plat.height + SPIKE_HEIGHT : plat.height}
                        texturesPlatforme={plat.hasSpike ? textureSpikes : texturesPlatforme}
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
                    isGameOver={isGameOver}
                    largeurJoueur={JOUEUR_WIDTH}
                    hauteurJoueur={JOUEUR_HEIGHT}
                    startX={joueurStartX}
                    startY={joueurStartY}
                    texturesPerso={texturesPerso}
                    ScaleX={scaleX}
                    ScaleY={scaleY}
                    Scale={scale}
                />
            </pixiContainer>
            {children}
        </pixiContainer>
    );
};