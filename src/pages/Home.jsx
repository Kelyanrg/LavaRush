import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./home.css";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Home() {
  const navigate = useNavigate();
  const { session, user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const displayName = user?.user_metadata?.username || "Anonyme";

  return (
    <div className="home-page">
      <Helmet>
        <title>LavaRush - Accueil</title>
        <link rel="icon" href="./assets/ui/lavarush_petio_icon.svg" />
      </Helmet>
      <div className="topbar">
        <button className="topbar-logo" onClick={() => navigate("/")}>
          <img
            src="./assets/ui/lavarush_petio_icon.svg"
            alt="Logo"
            className="logo-img"
          />
        </button>

        {session && (
          <div className="topbar-user-info">
            Connecté en tant que :{" "}
            <span className="user-highlight">{displayName}</span>
          </div>
        )}

        <div className="topbar-links">
          <button
            className="topbar-btn"
            onClick={() => navigate("/leaderboard")}
          >
            Leaderboard
          </button>

          {session ? (
            <button className="topbar-btn topbar-login" onClick={handleLogout}>
              Se déconnecter
            </button>
          ) : (
            <button
              className="topbar-btn topbar-login"
              onClick={() => navigate("/login")}
            >
              Se connecter
            </button>
          )}
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
          <div className="play-btn-wrapper">
            <button className="play-btn" onClick={() => navigate("/game")}>
              <span className="play-btn-text">Jouer maintenant</span>
              <span className="play-btn-shine" />
            </button>
          </div>
        </div>
      </div>

      <div className="lava-container">
        <svg
          className="lava-svg"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            className="lava-wave lava-wave--back"
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
          />
          <path
            className="lava-wave lava-wave--mid"
            d="M0,70 C360,20 720,100 1080,50 C1260,30 1380,70 1440,60 L1440,120 L0,120 Z"
          />
          <path
            className="lava-wave lava-wave--front"
            d="M0,80 C200,40 500,100 720,70 C940,40 1200,90 1440,70 L1440,120 L0,120 Z"
          />
        </svg>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>Grimpe sans fin</h3>
          <p>
            Saute de plateforme en plateforme et monte le plus haut possible. La
            lave monte, pas question de t'arrêter.
          </p>
        </div>
        <div className="info-card">
          <h3>Évite les dangers</h3>
          <p>
            Plateformes cassantes, chauves-souris qui patrouillent... chaque
            seconde peut être la dernière. Reste en alerte.
          </p>
        </div>
        <div className="info-card">
          <h3>Bats ton record</h3>
          <p>
            Chaque partie compte. Sauvegarde ton meilleur score et grimpe au
            classement.
          </p>
        </div>
      </div>

      <div className="team-section">
        <p className="team-eyebrow">L'équipe</p>
        <h2 className="team-title">
          La composition <span className="team-formation-tag">2·1·2</span>
        </h2>

        <div className="team-grid">
          {[
            {
              name: "Sybille",
              file: "Sybille",
              role: "Dev",
              desc: "A passé 3h sur un bug. Le bug a perdu.",
            },
            {
              name: "Florian",
              file: "Florian",
              role: "Dev",
              desc: "Git push en prod un vendredi. Légende vivante.",
            },
            {
              name: "Kelyan",
              file: "Kelyan",
              role: "Coordinateur & Dev",
              desc: "Rôle principal: pushing ball des devs",
            },
            {
              name: "Maïlys",
              file: "Mailis",
              role: "Design",
              desc: "2h sur la nuance d'orange exacte. Aucun regret.",
            },
            {
              name: "Angie",
              file: "Angie",
              role: "Design",
              desc: "La bête, ses designs sont réalisés grâce à la caféine.",
            },
          ].map(({ name, file, role, desc }) => (
            <div className="team-card" key={name}>
              <div className="team-photo-wrap">
                <img
                  src={`./assets/profils/${file}.png`}
                  alt={name}
                  className="team-photo"
                />
                <div className="team-photo-overlay">
                  <span className="team-role-tag">{role}</span>
                  <span className="team-name">{name}</span>
                  <span className="team-desc">{desc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer">
        <p>© 2025 Lava Rush - Tous droits réservés</p>
      </div>
    </div>
  );
}
