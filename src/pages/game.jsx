import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Game() {
  return (
    <div>
      <h1>Game</h1>
      <p>Le jeu sera ici.</p>
    </div>
  );
}
