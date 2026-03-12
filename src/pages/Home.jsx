import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className="topbar">
        <button className="topbar-logo" onClick={() => navigate("/")}>
          <img
            src="./assets/ui/lavarush_petio_icon.svg"
            alt="Logo"
            className="logo-img"
          />
        </button>
        <div className="topbar-links">
          <button
            className="topbar-btn"
            onClick={() => navigate("/leaderboard")}
          >
            Leaderboard
          </button>
          <button
            className="topbar-btn topbar-login"
            onClick={() => navigate("/login")}
          >
            Se connecter
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="home-content">
          <div className="title-wrapper">
            <img
              src="./assets/ui/lavarush_text_icon.svg"
              alt="Lava Rush"
              className="title-img"
            />
            <div className="title-glow" />
          </div>
          <p className="game-subtitle">
            Survivez à la lave. Montez le plus haut possible.
          </p>
          <button className="play-btn" onClick={() => navigate("/game")}>
            <span className="play-btn-text">Jouer maintenant</span>
            <span className="play-btn-shine" />
          </button>
        </div>
      </div>

      <div class="lava-container">
        <svg class="lava-svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            class="lava-wave lava-wave--back"
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
          />
          <path
            class="lava-wave lava-wave--mid"
            d="M0,70 C360,20 720,100 1080,50 C1260,30 1380,70 1440,60 L1440,120 L0,120 Z"
          />
          <path
            class="lava-wave lava-wave--front"
            d="M0,80 C200,40 500,100 720,70 C940,40 1200,90 1440,70 L1440,120 L0,120 Z"
          />
        </svg>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>Blabla titre</h3>
          <p>blabla descriptione</p>
        </div>
      </div>

      <div className="footer">
        <p>© 2025 Lava Rush - Tous droits réservés</p>
      </div>
    </>
  );
}
