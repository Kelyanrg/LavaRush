import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Experience } from "../game/components/Experience/Experience.jsx";
import { Helmet } from "react-helmet-async";
import * as PIXI from "pixi.js";
import "../pages/game.css";

const GAME_ASSETS = [
  "/assets/backgrounds/biome1.png",
  "/assets/backgrounds/biome2.png",
  "/assets/backgrounds/biome2.1.png",
  "/assets/backgrounds/biome3.png",
  "/assets/backgrounds/biome4.png",
  "/assets/backgrounds/biome5.png",
  "/assets/backgrounds/biome6.png",
  "/assets/backgrounds/biome7.png",
  "/assets/backgrounds/biome8.png",
  "/assets/backgrounds/biome9.png",
  "/assets/backgrounds/biome10.png",
  "/assets/backgrounds/biome11.png",
  "/assets/backgrounds/biome12.png",
  "/assets/backgrounds/biome13.png",
  "/assets/backgrounds/tower_left_1.png",
  "/assets/backgrounds/tower_right_1.png",
  "/assets/sprites/plateforme.png",
  "/assets/sprites/plateforme_spike.png",
  "/assets/sprites/bat_droite_bas.png",
  "/assets/sprites/bat_droite_haut.png",
  "/assets/sprites/bat_gauche_bas.png",
  "/assets/sprites/bat_gauche_haut.png",
  "/assets/sprites/lava1_v3.png",
  "/assets/sprites/lava2_v3.png",
  "/assets/sprites/lava3_v3.png",
  "/assets/sprites/lava4_v3.png",
  "/assets/sprites/lava_body.png",
  "/assets/sprites/perso_neutre_droite.png",
  "/assets/sprites/perso_neutre_gauche.png",
  "/assets/sprites/perso_jump_droite.png",
  "/assets/sprites/perso_jump_gauche.png",
  "/assets/sprites/perso_run_droite.png",
  "/assets/sprites/perso_run_gauche.png",
];

export default function Game() {
  const [gameState, setGameState] = useState("START");
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Ref direct sur le DOM pour le score — zéro re-render React
  const hudAltRef = useRef(null);
  const alertTimeoutRef = useRef(null);

  // Dispatche un KeyboardEvent pour les contrôles tactiles
  const fireKey = (type, key, code) => {
    window.dispatchEvent(new KeyboardEvent(type, { key, code, bubbles: true }));
  };

  const handleScoreUpdate = (score) => {
    if (hudAltRef.current) {
      hudAltRef.current.textContent = `${score} m`;
    }
  };

  const handleAlert = (msg) => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlertMessage(msg);
    alertTimeoutRef.current = setTimeout(() => setAlertMessage(null), 4500);
  };

  const isGuest = user?.is_anonymous === true;

  // ── Touche ESPACE pour lancer/rejouer ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === " ") {
        if (gameState === "GAMEOVER" || gameState === "START") {
          startLoading();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // ── Préchargement réel des assets PIXI ──
  const startLoading = () => {
    setLoadProgress(0);
    setGameState("LOADING");
  };

  useEffect(() => {
    if (gameState !== "LOADING") return;

    let cancelled = false;

    PIXI.Assets.load(GAME_ASSETS, (progress) => {
      if (!cancelled) setLoadProgress(Math.round(progress * 100));
    })
      .then(() => {
        if (!cancelled) setGameState("PLAYING");
      })
      .catch(() => {
        if (!cancelled) setGameState("PLAYING");
      });

    return () => {
      cancelled = true;
    };
  }, [gameState]);

  // ── Récupération du meilleur score ──
  useEffect(() => {
    const fetchBestScore = async () => {
      const { data, error } = await supabase
        .from("scores")
        .select("altitude")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setBestScore(data.altitude || 0);
      } else if (error && error.code !== "PGRST116") {
        console.error("Erreur fetch score:", error.message);
      }
    };

    if (user) fetchBestScore();
  }, [user]);

  const handleGameOver = async (finalScore) => {
    setCurrentScore(finalScore);
    setGameState("DYING");

    const saveScore = async () => {
      if (finalScore > bestScore) {
        setIsNewRecord(true);
        setBestScore(finalScore);
        if (!isGuest && user) {
          const { error } = await supabase
            .from("scores")
            .upsert(
              { user_id: user.id, altitude: finalScore },
              { onConflict: "user_id" },
            );
          if (error) console.error("Erreur détaillée:", error.message);
        }
      } else {
        setIsNewRecord(false);
      }
    };

    await Promise.all([
      saveScore(),
      new Promise((resolve) => setTimeout(resolve, 1300)),
    ]);

    setGameState("GAMEOVER");
  };

  return (
    <div className={`game-page${gameState === "PLAYING" ? " game-page--playing" : ""}`}>
      <Helmet>
        <title>LavaRush</title>
        <link rel="icon" href="./assets/ui/lavarush_petio_icon.svg" />
      </Helmet>

      {/* OVERLAY START */}
      {gameState === "START" && (
        <div className="overlay-start-screen">
          <button className="btn-back" onClick={() => navigate("/")}>
            ← Retour
          </button>
          <div className="title-wrapper">
            <img
              src="./assets/ui/lavarush_text_icon.svg"
              alt="Lava Rush"
              className="title-img"
            />
            <div className="title-glow" />
          </div>
          <div className="instructions">
            {bestScore > 0 ? (
              <div className="best-score-display">
                Record actuel: {bestScore}
              </div>
            ) : (
              <div className="best-score-display">Aucun record</div>
            )}
            <p>
              Grimpe le plus haut possible pour échapper à la lave ! Reste sur
              tes gardes : le danger peut surgir à tout instant.
            </p>
            <div className="controls">
              <div className="control-gauche">
                <p>Déplacement à gauche</p>
                <img
                  src="../assets/ui/icon_Q.svg"
                  alt="Gauche"
                  className="control-icon"
                />
              </div>
              <div className="control-droite">
                <p>Déplacement à droite</p>
                <img
                  src="../assets/ui/icon_D.svg"
                  alt="Droite"
                  className="control-icon"
                />
              </div>
              <div className="control-jump">
                <p>Saut</p>
                <img
                  src="../assets/ui/icon_espace.svg"
                  alt="Saut"
                  className="control-icon"
                />
              </div>
            </div>
          </div>
          <button className="btn-main" onClick={startLoading}>
            JOUER
          </button>
        </div>
      )}

      {/* JEU PIXI — visible pendant PLAYING et DYING */}
      {(gameState === "PLAYING" || gameState === "DYING") && user && (
        <>
          <Experience
            userId={user.id}
            onGameOver={handleGameOver}
            isMuted={isMuted}
            onScoreUpdate={handleScoreUpdate}
            onAlert={handleAlert}
          />

          {/* HUD Altitude — mise à jour DOM directe, 0 re-render */}
          <div className="hud-altitude">
            <span className="hud-alt-value" ref={hudAltRef}>
              0 m
            </span>
            <span className="hud-alt-label">Altitude</span>
          </div>

          {/* Alerte in-game */}
          {alertMessage && (
            <div className="hud-alert" key={alertMessage.corps}>
              <div className="hud-alert-header">
                <span className="hud-alert-icon">⚠️</span>
                {alertMessage.titre}
              </div>
              <div className="hud-alert-body">{alertMessage.corps}</div>
            </div>
          )}

          <button
            className="btn-mute"
            onClick={() => setIsMuted((m) => !m)}
            title={isMuted ? "Activer le son" : "Couper le son"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          {/* Contrôles tactiles mobile */}
          <div
            className="mobile-controls"
            onContextMenu={(e) => e.preventDefault()}
          >
            <button
              className="ctrl-btn ctrl-left"
              onPointerDown={(e) => { e.preventDefault(); fireKey("keydown", "q", "KeyQ"); }}
              onPointerUp={(e) => { e.preventDefault(); fireKey("keyup", "q", "KeyQ"); }}
              onPointerLeave={(e) => { e.preventDefault(); fireKey("keyup", "q", "KeyQ"); }}
              onContextMenu={(e) => e.preventDefault()}
            >◀</button>
            <button
              className="ctrl-btn ctrl-right"
              onPointerDown={(e) => { e.preventDefault(); fireKey("keydown", "d", "KeyD"); }}
              onPointerUp={(e) => { e.preventDefault(); fireKey("keyup", "d", "KeyD"); }}
              onPointerLeave={(e) => { e.preventDefault(); fireKey("keyup", "d", "KeyD"); }}
              onContextMenu={(e) => e.preventDefault()}
            >▶</button>
            <button
              className="ctrl-btn ctrl-jump"
              onPointerDown={(e) => { e.preventDefault(); fireKey("keydown", " ", "Space"); }}
              onPointerUp={(e) => { e.preventDefault(); fireKey("keyup", " ", "Space"); }}
              onPointerLeave={(e) => { e.preventDefault(); fireKey("keyup", " ", "Space"); }}
              onContextMenu={(e) => e.preventDefault()}
            >▲</button>
          </div>
        </>
      )}

      {/* DEATH TRANSITION */}
      {gameState === "DYING" && (
        <div className="death-overlay" aria-hidden="true">
          <div className="death-flash" />
          <div className="death-vignette" />
          <div className="death-lava-surge">
            <svg className="death-wave death-wave--back" viewBox="0 0 1440 200" preserveAspectRatio="none">
              <path d="M0,80 C240,160 480,20 720,80 C960,140 1200,20 1440,80 L1440,200 L0,200 Z" />
            </svg>
            <svg className="death-wave death-wave--mid" viewBox="0 0 1440 200" preserveAspectRatio="none">
              <path d="M0,100 C360,30 720,140 1080,70 C1260,40 1380,100 1440,80 L1440,200 L0,200 Z" />
            </svg>
            <svg className="death-wave death-wave--front" viewBox="0 0 1440 200" preserveAspectRatio="none">
              <path d="M0,120 C200,60 500,150 720,100 C940,60 1200,130 1440,110 L1440,200 L0,200 Z" />
            </svg>
            <div className="death-lava-body" />
          </div>
        </div>
      )}

      {/* OVERLAY CHARGEMENT */}
      {gameState === "LOADING" && (
        <div className="overlay-loading">
          <div className="loading-content">
            <img
              src="./assets/ui/lavarush_text_icon.svg"
              alt="Lava Rush"
              className="loading-logo"
            />
            <div className="loading-bar-wrap">
              <div
                className="loading-bar"
                style={{
                  width: `${loadProgress}%`,
                  transition:
                    loadProgress === 0 ? "none" : "width 0.2s ease-out",
                }}
              />
            </div>
            <p className="loading-text">
              {loadProgress < 100 ? `Chargement… ${loadProgress}%` : "Prêt !"}
            </p>
          </div>
          <div className="loading-lava-wave" />
        </div>
      )}

      {/* OVERLAY GAME OVER */}
      {gameState === "GAMEOVER" && (
        <div className="overlay game-over-screen">
          <h2 className="gameover-title">T'as perdu !</h2>

          <div className="gameover-card">
            <div className="gameover-score-section">
              <span className="score-label">Score</span>
              <span className="score-value">{currentScore}</span>
            </div>

            {isNewRecord ? (
              <div className="new-record-badge">🔥 Nouveau Record !</div>
            ) : (
              <div className="gameover-score-badge">
                Meilleur score : {bestScore}
              </div>
            )}

            {isGuest && (
              <div className="guest-prompt">
                <p>Crée un compte pour sauvegarder ton score !</p>
                <button
                  className="btn-golden"
                  onClick={() =>
                    navigate("/signup", {
                      state: { pendingScore: currentScore },
                    })
                  }
                >
                  Créer un compte
                </button>
              </div>
            )}
          </div>

          <button className="btn-main" onClick={startLoading}>
            Rejouer
          </button>

          <div className="buttons-group">
            <button
              className="btn-secondary"
              onClick={() => navigate("/leaderboard")}
            >
              🏆 Classement
            </button>
            <button className="btn-secondary" onClick={() => navigate("/")}>
              ← Menu Principal
            </button>
          </div>

          <p className="hint-text">Appuie sur ESPACE pour rejouer</p>
        </div>
      )}
    </div>
  );
}