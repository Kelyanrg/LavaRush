import { Graphics } from "pixi.js";
import { GAME_WIDTH, COLS, PLAT_W, PLAT_H, ROW_GAP } from "./constants.js";

export let platforms = [];

function getGameLeft() {
  return (window.innerWidth - GAME_WIDTH) / 2;
}

const CELL_W = GAME_WIDTH / COLS;

function createPlatform(stage, col, y) {
  const x = getGameLeft() + col * CELL_W + (CELL_W - PLAT_W) / 2;

  const g = new Graphics();
  g.rect(0, 0, PLAT_W, PLAT_H);
  g.fill(0x3355ff);
  g.x = x;
  g.y = y;
  stage.addChild(g);

  const plat = { sprite: g, x, y, col, width: PLAT_W, height: PLAT_H };
  platforms.push(plat);
  return plat;
}

export function initPlatforms(stage, screenH) {
  platforms = [];

  const startY = screenH - 120;
  createPlatform(stage, 2, startY);

  // Génération simple : pour chaque ligne, 1 ou 2 plateformes
  // sur des colonnes aléatoires distinctes
  let y = startY;
  for (let i = 0; i < 14; i++) {
    y -= ROW_GAP;

    // 1 ou 2 plateformes par ligne
    const count = Math.random() < 0.5 ? 1 : 2;

    // Colonnes aléatoires sans répétition
    const colsAvailable = [0, 1, 2, 3, 4];
    const chosen = [];
    for (let c = 0; c < count; c++) {
      const idx = Math.floor(Math.random() * colsAvailable.length);
      chosen.push(colsAvailable.splice(idx, 1)[0]);
    }

    chosen.forEach((col) => createPlatform(stage, col, y));
  }
}

export function findTarget(currentPlat, direction) {
  if (!currentPlat) return null;

  const col = currentPlat.col;

  if (direction === "up") {
    // Même colonne, strictement au-dessus, la plus proche
    let best = null;
    for (const p of platforms) {
      if (p.col !== col) continue;
      if (p.y >= currentPlat.y) continue;
      if (!best || p.y > best.y) best = p;
    }
    return best;
  }

  if (direction === "left") {
    // Exactement col - 1, la plus proche en Y
    let best = null;
    for (const p of platforms) {
      if (p.col !== col - 1) continue;
      if (
        !best ||
        Math.abs(p.y - currentPlat.y) < Math.abs(best.y - currentPlat.y)
      )
        best = p;
    }
    return best;
  }

  if (direction === "right") {
    // Exactement col + 1, la plus proche en Y
    let best = null;
    for (const p of platforms) {
      if (p.col !== col + 1) continue;
      if (
        !best ||
        Math.abs(p.y - currentPlat.y) < Math.abs(best.y - currentPlat.y)
      )
        best = p;
    }
    return best;
  }

  return null;
}

export function checkCollisions(player) {
  for (const plat of platforms) {
    const bottom = player.y + player.height;
    const overlapX =
      player.x + player.width > plat.x && player.x < plat.x + plat.width;
    const touchTop = bottom >= plat.y && bottom <= plat.y + PLAT_H + 10;
    if (overlapX && touchTop && player.velocityY >= 0) {
      player.y = plat.y - player.height;
      player.velocityY = 0;
      return plat;
    }
  }
  return null;
}
