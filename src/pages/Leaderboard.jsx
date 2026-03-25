import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Helmet } from "react-helmet-async";
import "../pages/leaderboard.css";

const MEDALS = ["🥇", "🥈", "🥉"];
const PAGE_SIZE = 20;

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const displayName =
    user?.user_metadata?.username || user?.email?.split("@")[0];

  /* ── fetch ─────────────────────────────── */
  const fetchLeaderboard = useCallback(async (page) => {
    setLoading(true);
    setError(null);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const {
        data: scoresData,
        error: scoresError,
        count,
      } = await supabase
        .from("scores")
        .select("user_id, altitude", { count: "exact" })
        .order("altitude", { ascending: false })
        .range(from, to);

      if (scoresError) throw scoresError;
      setTotalCount(count ?? 0);

      if (!scoresData?.length) {
        setScores([]);
        return;
      }

      const userIds = scoresData.map((s) => s.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const profileMap = Object.fromEntries(
        (profilesData || []).map((p) => [p.id, p.username]),
      );

      setScores(
        scoresData.map((s) => ({
          ...s,
          username: profileMap[s.user_id] || null,
        })),
      );
    } catch (err) {
      setError("Impossible de charger le classement.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(currentPage);
    // Scroll vers le haut à chaque changement de page
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, fetchLeaderboard]);

  /* ── helpers ─────────────────────────────── */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getUsername = (score, rank) =>
    score.username || `Joueur_${score.user_id?.slice(0, 5) ?? rank}`;

  const globalOffset = (currentPage - 1) * PAGE_SIZE;
  const topHalf = scores.slice(0, 10);
  const botHalf = scores.slice(10, 20);

  /* ── render ─────────────────────────────── */
  return (
    <div className="leaderboard-page">
      <Helmet>
        <title>LavaRush – Classement</title>
        <link rel="icon" href="/assets/ui/lavarush_petio_icon.svg" />
      </Helmet>

      {/* ── Topbar ── */}
      <div className="topbar">
        <button className="topbar-logo" onClick={() => navigate("/")}>
          <img
            src="/assets/ui/lavarush_petio_icon.svg"
            alt="Logo"
            className="logo-img"
          />
        </button>

        {user && (
          <div className="topbar-user-info">
            Connecté en tant que : &nbsp;
            <span className="user-highlight">{displayName}</span>
          </div>
        )}

        <div className="topbar-links">
          <button className="topbar-btn" onClick={() => navigate("/")}>
            Accueil
          </button>
          {user ? (
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

      {/* ── Titre ── */}
      <h1 className="leaderboard-title">CLASSEMENT</h1>

      {/* ── Contenu ── */}
      {loading ? (
        <div className="leaderboard-feedback">
          <span className="leaderboard-spinner" />
          Chargement…
        </div>
      ) : error ? (
        <div className="leaderboard-feedback leaderboard-error">{error}</div>
      ) : scores.length === 0 ? (
        <div className="leaderboard-feedback">
          Aucun score pour l'instant — sois le premier !
        </div>
      ) : (
        <>
          <div className="leaderboard-panels">
            {/* Panel gauche */}
            <div className="leaderboard-panel">
              {topHalf.map((score, i) => {
                const rank = globalOffset + i + 1;
                const isTop3 = rank <= 3;
                const isMe = user && score.user_id === user.id;
                return (
                  <div
                    key={score.user_id}
                    className={[
                      "leaderboard-row",
                      isTop3
                        ? `rank-${rank}`
                        : i % 2 === 0
                          ? "row-even"
                          : "row-odd",
                      isMe ? "row-me" : "",
                    ]
                      .join(" ")
                      .trim()}
                  >
                    <span className="rank-cell">
                      {isTop3 ? (
                        <span className="medal">{MEDALS[rank - 1]}</span>
                      ) : (
                        rank
                      )}
                    </span>
                    <span className="username-cell">
                      {getUsername(score, rank)}
                      {isMe && <span className="me-badge">toi</span>}
                    </span>
                    <span className="score-cell">{score.altitude}m</span>
                  </div>
                );
              })}
            </div>

            {/* Panel droit */}
            {botHalf.length > 0 && (
              <div className="leaderboard-panel">
                {botHalf.map((score, i) => {
                  const rank = globalOffset + 10 + i + 1;
                  const isMe = user && score.user_id === user.id;
                  return (
                    <div
                      key={score.user_id}
                      className={[
                        "leaderboard-row",
                        i % 2 === 0 ? "row-even" : "row-odd",
                        isMe ? "row-me" : "",
                      ]
                        .join(" ")
                        .trim()}
                    >
                      <span className="rank-cell">{rank}</span>
                      <span className="username-cell">
                        {getUsername(score, rank)}
                        {isMe && <span className="me-badge">toi</span>}
                      </span>
                      <span className="score-cell">{score.altitude}m</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`page-btn${page === currentPage ? " page-btn--active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                className="page-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Boutons d'action (inline, pas fixed) ── */}
      <div className="leaderboard-actions">
        <button
          className="action-btn action-btn--home"
          onClick={() => navigate("/")}
        >
          ← Menu Principal
        </button>
        <button
          className="action-btn action-btn--play"
          onClick={() => navigate("/game")}
        >
          Jouer
        </button>
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        © 2025 Lava Rush — Tous droits réservés
      </footer>
    </div>
  );
}
