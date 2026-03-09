import { extend, useTick } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useCallback, useRef, useEffect } from "react";
import { checkCollision } from "../../helpers/common.js";

extend({ Graphics });

export const Joueur = ({ plateformes = [], onPositionChange }) => {
    console.log("type:", typeof plateformes);
    console.log("isArray:", Array.isArray(plateformes));
    console.log("valeur:", plateformes);
    const playerRef = useRef(null);
    const physics = useRef({
        velocityY: 0,
        velocityX: 0,
        gravity: 1,
        jumpForce: -18,
        friction: 0.8,
        acceleration: 2.5,
        maxSpeed: 8,
        onGround: false
    });
    const jumpBuffer = useRef(0);
    const keys = useRef({ q: false, d: false });
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                jumpBuffer.current = 15;
            }
            if (e.key.toLowerCase() === 'q') keys.current.q = true;
            if (e.key.toLowerCase() === 'd') keys.current.d = true;
        };
        const handleKeyUp = (e) => {
            if (e.code === 'Space' && physics.current.velocityY < 0) {
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
    }, []);
    useTick((ticker) => {
        if (!playerRef.current) return;
        const delta = ticker.deltaTime;
        const p = physics.current;
        const player = playerRef.current;
        // Mouvements horizontaux
        if (keys.current.q) p.velocityX -= p.acceleration * delta;
        if (keys.current.d) p.velocityX += p.acceleration * delta;
        p.velocityX *= p.friction;
        if (p.velocityX > p.maxSpeed) p.velocityX = p.maxSpeed;
        if (p.velocityX < -p.maxSpeed) p.velocityX = -p.maxSpeed;
        player.x += p.velocityX * delta;
        if (player.x < 0) player.x = 0;
        if (player.x > 900) player.x = 900;
        // Gravité
        p.velocityY += p.gravity * delta;
        player.y += p.velocityY * delta;
        //reset onGround
        p.onGround = false;
        // Collision avec plateformes
        plateformes.forEach((plat) => {
            const joueurRect = { x: player.x, y: player.y, width: 40, height: 40 };

            if (checkCollision(joueurRect, plat)) {
                // Calcul du chevauchement sur chaque axe
                const overlapLeft = (joueurRect.x + joueurRect.width) - plat.x;
                const overlapRight = (plat.x + plat.width) - joueurRect.x;
                const overlapTop = (joueurRect.y + joueurRect.height) - plat.y;
                const overlapBottom = (plat.y + plat.height) - joueurRect.y;

                // Le plus petit chevauchement = côté de la collision
                const minOverlapX = Math.min(overlapLeft, overlapRight);
                const minOverlapY = Math.min(overlapTop, overlapBottom);

                // ✅ On résout uniquement l'axe le moins profond
                if (minOverlapY < minOverlapX) {
                    // Collision verticale (dessus ou dessous)
                    if (overlapTop < overlapBottom) {
                        // Vient d'en haut
                        player.y = plat.y - joueurRect.height;
                        p.velocityY = 0; // rebond/saut automatique
                        p.onGround = true;
                    } else {
                        // Vient d'en bas
                        player.y = plat.y + plat.height;
                        p.velocityY = 0;
                    }
                } else {
                    // Collision horizontale (gauche ou droite)
                    if (overlapLeft < overlapRight) {
                        // Vient de la gauche
                        player.x = plat.x - joueurRect.width;
                    } else {
                        // Vient de la droite
                        player.x = plat.x + plat.width;
                    }
                    p.velocityX = 0;
                }
                // // console.log("Collision avec plateforme:", plat);
                // // Vient d'en haut
                // if (p.velocityY > 0 && player.y + 40 - p.velocityY * delta <= plat.y) {
                //     player.y = plat.y;
                //     p.velocityY = 0;
                //     p.onGround = true;
                // }
                // // // Vient d'en bas
                // else if (p.velocityY < 0 && player.y - p.velocityY * delta >= plat.y + plat.height) {
                //     player.y = plat.y ;
                //     p.velocityY = 0;
                //  }

                // // Côté gauche/droit
                // else if (p.velocityX > 0 &&player.y) player.x = plat.x - 40;
                // else if (p.velocityX < 0) player.x = plat.x + plat.width;
            }
        });


        //sol fixe
        if (player.y >= 500) {
            player.y = 500;
            p.velocityY = 0;
            p.onGround = true;
        }
        if (jumpBuffer.current > 0 && p.onGround) {
            p.velocityY = p.jumpForce;
            p.onGround = false;
            jumpBuffer.current = 0;
        }

        if (jumpBuffer.current > 0) jumpBuffer.current -= 1;
        if (onPositionChange) {
            onPositionChange({ x: player.x, y: player.y });
        }
    });

    const drawPlayer = useCallback((g) => {
        g.clear().rect(0, 0, 40, 40).fill(0x100060);
    }, []);

    return <pixiGraphics ref={playerRef} draw={drawPlayer} />;

    // Inputs clavier

}
