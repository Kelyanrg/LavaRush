import { extend, useTick } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useCallback, useRef, useEffect } from "react";
import { checkCollision } from "../../helpers/common.js";

extend({ Graphics });

export const Joueur = ({ plateformes = [], onPositionChange, taillejoueur = 40, playAreaWidth = 900 }) => {
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
    const nocolitionbuffer = useRef(0);
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

        if (keys.current.q) p.velocityX -= p.acceleration * delta;
        if (keys.current.d) p.velocityX += p.acceleration * delta;
        p.velocityX *= p.friction;
        if (p.velocityX > p.maxSpeed) p.velocityX = p.maxSpeed;
        if (p.velocityX < -p.maxSpeed) p.velocityX = -p.maxSpeed;
        
        player.x += p.velocityX * delta;
        
        if (player.x < 0) player.x = 0;
        if (player.x > playAreaWidth - taillejoueur) player.x = playAreaWidth - taillejoueur;

        p.velocityY += p.gravity * delta;
        player.y += p.velocityY * delta;
        p.onGround = false;

        plateformes.forEach((plat) => {
            const joueurRect = { x: player.x, y: player.y, width: taillejoueur, height: taillejoueur };

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
                        jumpBuffer.current = 10;
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
        g.clear().rect(0, 0, taillejoueur, taillejoueur).fill(0x100060);
    }, [taillejoueur]);

    return <pixiGraphics ref={playerRef} draw={drawPlayer} />;
}