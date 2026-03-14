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
        .eq("id", user.id)
        .single();

      if (data) setBestScore(data.altitude || 0);
    };

    if (user) fetchBestScore();
  }, [user]);

  const handleGameOver = async (finalScore) => {
    setCurrentScore(finalScore);
    setGameState("GAMEOVER");

    if (finalScore > bestScore) {
      setIsNewRecord(true);
      setBestScore(finalScore);

      const { error } = await supabase
        .from("scores")
        .update({ altitude: finalScore })
        .eq("id", user.id);

      if (error)
        console.error(
          "Erreur lors de la mise à jour du record:",
          error.message,
        );
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
              <div className="best-score-display">
                Record actuel: {bestScore}
              </div>
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
    </div>
  );
}
