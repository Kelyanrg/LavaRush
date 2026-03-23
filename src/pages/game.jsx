import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Experience } from "../game/components/Experience/Experience.jsx";
import { Helmet } from "react-helmet-async";
import "./game.css";

export default function Game() {
  const [gameState, setGameState] = useState("START");
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isGuest = user?.app_metadata?.provider === "anonymous";

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

      const { error } = await supabase.from("scores").upsert(
        {
          user_id: user.id,
          altitude: finalScore,
        },
        { onConflict: "user_id" },
      );

      if (error) console.error("Erreur détaillée:", error.message);
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
        <div className="overlay start-screen">
          {bestScore > 0 ? (
            <div className="best-score-display">Record actuel: {bestScore}</div>
          ) : (
            <div className="best-score-display">Aucun record</div>
          )}
          <button className="btn-main" onClick={() => setGameState("PLAYING")}>
            JOUER
          </button>
        </div>
      )}

      {/* JEU PIXI */}
      {gameState === "PLAYING" && (
        <Experience userId={user.id} onGameOver={handleGameOver} />
      )}

      {/* OVERLAY GAME OVER */}
      {gameState === "GAMEOVER" && (
        <div className="overlay game-over-screen">
          <h2>Perdu looser</h2>
          <p>Votre score: {currentScore}</p>
          {isNewRecord ? (
            <p className="new-record">Nouveau re@cord !</p>
          ) : (
            <p>Record actuel: {bestScore}</p>
          )}
          <button className="btn-main" onClick={() => setGameState("START")}>
            REJOUER
          </button>
        </div>
      )}
    </div>
  );
}
