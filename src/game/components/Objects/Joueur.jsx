import { extend, useTick } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useCallback, useRef, useEffect } from "react";

extend({ Graphics });

export const Joueur = () => {
    const playerRef = useRef(null);
    const physics = useRef({
        velocityY: 0,
        velocityX: 0,
        gravity: 1,
        jumpForce: -18,
        friction: 0.8,
        acceleration: 1.5,
        maxSpeed: 8
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

        if (keys.current.q) p.velocityX -= p.acceleration * delta;
        if (keys.current.d) p.velocityX += p.acceleration * delta;

        p.velocityX *= p.friction;
        if (p.velocityX > p.maxSpeed) p.velocityX = p.maxSpeed;
        if (p.velocityX < -p.maxSpeed) p.velocityX = -p.maxSpeed;

        player.x += p.velocityX * delta;
        if (player.x < 0) player.x = 0;
        if (player.x > 900) player.x = 900;

        p.velocityY += p.gravity * delta;
        player.y += p.velocityY * delta;

        if (player.y >= 400) {
            player.y = 400;
            p.velocityY = 0;
            if (jumpBuffer.current > 0) {
                p.velocityY = p.jumpForce;
                jumpBuffer.current = 0;
            }
        }
        if (jumpBuffer.current > 0) jumpBuffer.current -= 1;
    });

    const drawPlayer = useCallback((g) => {
        g.clear().rect(0, 0, 40, 40).fill(0xff3300);
    }, []);
    return <pixiGraphics ref={playerRef} draw={drawPlayer} />;

    // Inputs clavier

}
