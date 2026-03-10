import { Graphics } from "pixi.js";
import { GAME_WIDTH, GRAVITY, JUMP_DURATION } from "./constants.js";
import { findTarget, checkCollisions } from "./platforms.js";

function getGameLeft() {
  return (window.innerWidth - GAME_WIDTH) / 2;
}

export const player = {
  sprite: null,
  x: 0,
  y: 0,
  width: 32,
  height: 48,
  velocityY: 0,
  currentPlatform: null,
};

let isAnimating = false;
let animProgress = 0;
let fromX = 0,
  fromY = 0,
  toX = 0,
  toY = 0;
let arcHeight = 0;
let targetPlatform = null;
let inputLocked = false;

export function initPlayer(stage, startX, startY, startPlatform) {
  const g = new Graphics();
  g.rect(0, 0, player.width, player.height);
  g.fill(0x00ff88);
  stage.addChild(g);

  player.sprite = g;
  player.x = startX;
  player.y = startY;
  player.velocityY = 0;
  player.currentPlatform = startPlatform;
  isAnimating = false;
  inputLocked = false;

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
}

export function destroyPlayer() {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
}

export function updatePlayer(delta) {
  if (isAnimating) {
    updateAnimation(delta);
  } else if (!player.currentPlatform) {
    // Chute libre uniquement quand pas sur une plateforme
    applyGravity(delta);
  }

  if (player.sprite) {
    player.sprite.x = player.x;
    player.sprite.y = player.y;
  }
}

function updateAnimation(delta) {
  animProgress += delta / JUMP_DURATION;
  if (animProgress >= 1) animProgress = 1;

  const t = animProgress;
  player.x = lerp(fromX, toX, t);
  player.y = lerp(fromY, toY, t) - Math.sin(t * Math.PI) * arcHeight;

  if (animProgress >= 1) {
    player.x = toX;
    player.y = toY;
    isAnimating = false;
    inputLocked = false;

    if (targetPlatform) {
      // Atterrit sur la plateforme cible (ou rebond sur place)
      player.currentPlatform = targetPlatform;
      player.velocityY = 0;
    } else {
      // Saut dans le vide → commence à tomber
      player.currentPlatform = null;
      player.velocityY = 3;
    }
  }
}

function applyGravity(delta) {
  player.velocityY += GRAVITY * delta;
  player.y += player.velocityY * delta;

  const landed = checkCollisions(player);
  if (landed) {
    player.currentPlatform = landed;
    player.velocityY = 0;
  }

  const gl = getGameLeft();
  if (player.x < gl) player.x = gl;
  if (player.x + player.width > gl + GAME_WIDTH)
    player.x = gl + GAME_WIDTH - player.width;
}

function launchToward(direction) {
  if (inputLocked || isAnimating || !player.currentPlatform) return;

  const target = findTarget(player.currentPlatform, direction);

  fromX = player.x;
  fromY = player.y;
  isAnimating = true;
  animProgress = 0;
  inputLocked = true;

  if (target) {
    // Plateforme trouvée → saut vers elle
    targetPlatform = target;
    toX = target.x + target.width / 2 - player.width / 2;
    toY = target.y - player.height;
    arcHeight = Math.max(60, Math.abs(target.y - fromY) * 0.7);
  } else if (direction === "up") {
    // Espace sans plateforme au-dessus → petit rebond, retombe sur la même
    targetPlatform = player.currentPlatform; // ← CRUCIAL : garde le col intact
    toX = fromX;
    toY = fromY;
    arcHeight = 50;
  } else {
    // Gauche/droite sans plateforme → saut dans le vide → mort
    targetPlatform = null;
    toX = direction === "left" ? fromX - 150 : fromX + 150;
    toY = fromY - 30;
    const gl = getGameLeft();
    toX = Math.max(gl, Math.min(gl + GAME_WIDTH - player.width, toX));
    arcHeight = 40;
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function onKeyDown(e) {
  if (e.code === "ArrowLeft" || e.code === "KeyA") launchToward("left");
  if (e.code === "ArrowRight" || e.code === "KeyD") launchToward("right");
  if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space")
    launchToward("up");
}
function onKeyUp(e) {}
