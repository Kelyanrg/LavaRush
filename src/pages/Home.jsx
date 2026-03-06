import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Lava Rush</h1>
      <p>Monte le plus haut possible avant d'être rattrapé par la lave.</p>
      <button onClick={() => navigate("/login")}>Se connecter</button>
      <button onClick={() => navigate("/signup")}>S'inscrire</button>
    </div>
  );
}
