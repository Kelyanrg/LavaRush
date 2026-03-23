import { useEffect, useState } from "react";
import { calculateCanvasSize } from "../../helpers/common.js";
import { Application } from "@pixi/react";
import { MainContainer } from "./MainContainer/MainContainer.jsx";

export const Experience = ({ onGameOver, userId }) => {
  const [canvasSize, setCanvasSize] = useState(calculateCanvasSize());

  const updateCanvasSize = () => {
    setCanvasSize(calculateCanvasSize());
  };

  const taille = { width: canvasSize.width, height: canvasSize.height };

  useEffect(() => {
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  return (
    <Application width={canvasSize.width} height={canvasSize.height}>
      <MainContainer canvasSize={taille} onGameOver={onGameOver} />
    </Application>
  );
};
