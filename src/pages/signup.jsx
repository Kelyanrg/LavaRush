import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./signup.css";
import { Helmet } from "react-helmet-async";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pendingScore = location.state?.pendingScore ?? null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ── Validation côté client ──
    if (!username.trim()) {
      setError("Le pseudo est requis.");
      return;
    }
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username.trim())) {
      setError("Pseudo : 3 à 20 caractères (lettres, chiffres, _ ou -).");
      return;
    }
    if (!email.trim()) {
      setError("L'adresse email est requise.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username: username.trim() } },
    });

    if (signUpError) {
      setError("Inscription impossible. Vérifie tes informations.");
      setLoading(false);
      return;
    }

    // Si un score est en attente (vient d'une partie en guest), on le sauvegarde
    if (pendingScore !== null && pendingScore > 0 && data.user) {
      await supabase.from("scores").upsert(
        { user_id: data.user.id, altitude: pendingScore },
        { onConflict: "user_id" }
      );
    }

    setLoading(false);
    navigate("/game");
  };

  return (
    <div className="signup-page">
      <Helmet>
        <title>LavaRush - Inscription</title>
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
            onClick={() => navigate("/login")}
          >
            Se connecter
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
        <div className="signup-content">
          <div className="signup-frame">
            <span>Inscrivez vous pour rejoindre l'aventure</span>

            {error && <p style={{ color: "#ff4444", fontSize: "0.85rem" }}>{error}</p>}

            <form onSubmit={handleSubmit} noValidate>
              <span className="signup-label">Pseudo</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Pseudo"
                autoComplete="username"
              />

              <span className="signup-label">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
              />
              <span className="signup-label">Mot de passe</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe (min. 6 caractères)"
                autoComplete="new-password"
              />
              <button type="submit" disabled={loading}>
                {loading ? "Inscription..." : "S'inscrire"}
              </button>
            </form>
            <p>
              Déjà un compte ? <Link to="/login">Se connecter</Link>
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
