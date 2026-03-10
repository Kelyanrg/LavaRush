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

      <div className="lava-divider">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            className="lava-wave"
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="rgba(255, 81, 0, 0.64)"
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
