import { extend, useTick } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useCallback, useRef, useEffect } from "react";
import { checkCollision } from "../../helpers/common.js";

extend({ Graphics });

export const Joueur = ({ plateformes = [], spikes = [], onPositionChange, playAreaWidth, isGameOver, largeurJoueur, hauteurJoueur, startX, startY, ScaleY = 1, ScaleX = 1, Scale = 1 }) => {
    const playerRef = useRef(null);
    const isInitialized = useRef(false);
    const miniBoostBuffer = useRef(0);
    const acceleration = (((playAreaWidth / 5 - (playAreaWidth / 50) * 2) / 25) * Scale);
    const friction = 0.67 * ScaleX;
    const gravity = 0.98 * ScaleY;
    const maxSpeed = 8 * Scale;



    const physics = useRef({
        velocityY: 0,
        velocityX: 0,
        gravity: gravity,
        jumpForce: gravity * -18,
        friction: friction,
        acceleration: acceleration,
        maxSpeed: maxSpeed,
        onGround: false
    });

    const jumpBuffer = useRef(0);
    const nocolitionbuffer = useRef(0);
    const keys = useRef({ q: false, d: false, z: false });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isGameOver) return;

            if (e.code === 'Space' || e.key.toLowerCase() === 'z') {
                e.preventDefault();
                jumpBuffer.current = 15;
            }
            if (e.key.toLowerCase() === 'q') keys.current.q = true;
            if (e.key.toLowerCase() === 'd') keys.current.d = true;
        };
        const handleKeyUp = (e) => {
            if ((e.code === 'Space' || e.key.toLowerCase() === 'z') && physics.current.velocityY < 0) {
                physics.current.velocityY *= 0.5;
                jumpBuffer.current = 0;
            }
            if (e.key.toLowerCase() === 'q') keys.current.q = false;
            if (e.key.toLowerCase() === 'd') keys.current.d = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isGameOver]);

    useTick((ticker) => {
        if (!playerRef.current || isGameOver) return;

        const player = playerRef.current;
        const p = physics.current;

        if (!isInitialized.current) {
            player.x = startX;
            player.y = startY;
            p.velocityX = 0;
            p.velocityY = 0;
            isInitialized.current = true;

            if (onPositionChange) {
                onPositionChange({ x: player.x, y: player.y });
            }
            return;
        }

        let delta = ticker.deltaTime;
        if (delta > 2) delta = 1;

        if (keys.current.q) p.velocityX -= p.acceleration * delta;
        if (keys.current.d) p.velocityX += p.acceleration * delta;
        p.velocityX *= p.friction;

        if (p.velocityX > p.maxSpeed) p.velocityX = p.maxSpeed;
        if (p.velocityX < -p.maxSpeed) p.velocityX = -p.maxSpeed;

        player.x += p.velocityX * delta;

        if (player.x < 0) player.x = 0;
        if (player.x > playAreaWidth - largeurJoueur) player.x = playAreaWidth - largeurJoueur;

        p.velocityY += p.gravity * delta;

        if (p.velocityY > 12) {
            p.velocityY = 12;
        }

        player.y += p.velocityY * delta;
        p.onGround = false;

        plateformes.forEach((plat) => {
            const joueurRect = { x: player.x, y: player.y, width: largeurJoueur, height: hauteurJoueur };

            if (checkCollision(joueurRect, plat)) {
                const overlapLeft = (joueurRect.x + joueurRect.width) - plat.x;
                const overlapRight = (plat.x + plat.width) - joueurRect.x;
                const overlapTop = (joueurRect.y + joueurRect.height) - plat.y;
                const overlapBottom = (plat.y + plat.height) - joueurRect.y;

                const minOverlapX = Math.min(overlapLeft, overlapRight);
                const minOverlapY = Math.min(overlapTop, overlapBottom);

                if (minOverlapY < minOverlapX) {
                    if (overlapTop < overlapBottom) {
                        if (nocolitionbuffer.current <= 0) {
                            player.y = plat.y - joueurRect.height;
                            p.velocityY = 0;
                            p.onGround = true;
                        }
                    } else {
                        miniBoostBuffer.current = 5;
                    }
                } else {
                    if (overlapLeft < overlapRight) {
                        player.x = plat.x - joueurRect.width;
                    } else {
                        player.x = plat.x + plat.width;
                    }
                    p.velocityX = 0;
                }
            }
        });


        if (jumpBuffer.current > 0 && p.onGround) {
            p.velocityY = p.jumpForce;
            p.onGround = false;
            jumpBuffer.current = 0;
        }

        if (miniBoostBuffer.current > 0 && p.onGround) {
            p.velocityY = p.jumpForce * 0.8;
            p.onGround = false;
            miniBoostBuffer.current = 0;
        }

        if (jumpBuffer.current > 0) jumpBuffer.current -= 1;
        if (miniBoostBuffer.current > 0) miniBoostBuffer.current -= 1;

        if (onPositionChange) {
            onPositionChange({ x: player.x, y: player.y });
        }
    });

    const drawPlayer = useCallback((g) => {
        g.clear().rect(0, 0, largeurJoueur, hauteurJoueur).fill(0x100060);
    }, [largeurJoueur, hauteurJoueur]);

    return <pixiGraphics ref={playerRef} draw={drawPlayer} />;
};