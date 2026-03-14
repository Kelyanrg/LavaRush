import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./login.css";
import { Helmet } from "react-helmet-async";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Connexion classique (E-mail / Password)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError("Email ou mot de passe incorrect");
    else navigate("/game");

    setLoading(false);
  };

  // 2. Connexion Invité (Anonyme)
  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      setError("Erreur lors de la connexion invité : " + error.message);
    } else {
      navigate("/game");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <Helmet>
        <title>LavaRush - Connexion</title>
        <link rel="icon" href="./assets/ui/lavarush_petio_icon.svg" />
      </Helmet>

      {/* Topbar inchangée */}
      <div className="topbar">
        <button className="topbar-logo" onClick={() => navigate("/")}>
          <img
            src="./assets/ui/lavarush_petio_icon.svg"
            alt="Logo"
            className="logo-img"
          />
        </button>
        <div className="topbar-links">
          <button className="topbar-btn" onClick={() => navigate("/")}>
            Accueil
          </button>
          <button
            className="topbar-btn"
            onClick={() => navigate("/leaderboard")}
          >
            Leaderboard
          </button>
          <button
            className="topbar-btn topbar-login"
            onClick={() => navigate("/signup")}
          >
            S&apos;inscrire
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="background">
          <img
            src="/assets/backgrounds/world_background.png"
            alt="Mondes"
            className="background-img"
          />
        </div>

        <div className="login-content">
          <div className="login-frame">
            <span>Connectez-vous à votre aventure</span>

            {error && (
              <p style={{ color: "#ff4444", fontSize: "0.8rem" }}>{error}</p>
            )}

            <span className="login-label">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse e-mail"
            />

            <span className="login-label">Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
            />

            <button onClick={handleSubmit} disabled={loading}>
              {loading ? "Chargement..." : "Se connecter"}
            </button>

            <p>
              Pas de compte ? <Link to="/signup"> Créer un compte</Link>
            </p>

            <span className="login-label">ou</span>

            <p>
              <button
                onClick={handleGuestLogin} // Cette fois, elle existe !
                disabled={loading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff9a40",
                  cursor: "pointer",
                  textDecoration: "underline",
                  font: "inherit",
                }}
              >
                Jouer en tant qu'invité
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>&copy; 2025 Lava Rush - Tous droits réservés</p>
      </div>
    </div>
  );
}
