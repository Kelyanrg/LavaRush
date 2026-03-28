import { useState, useEffect } from "react";
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
  "/assets/sprites/lava1.png",
  "/assets/sprites/lava2.png",
  "/assets/sprites/lava3.png",
  "/assets/sprites/lava4.png",
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
  const { user } = useAuth();
  const navigate = useNavigate();

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
    setGameState("GAMEOVER");

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

  return (
    <div className="game-page">
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

      {/* JEU PIXI — monté uniquement quand les assets sont prêts */}
      {gameState === "PLAYING" && (
        <Experience userId={user.id} onGameOver={handleGameOver} />
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
          <h2 className="gameover-title">Perdu Looser</h2>

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
