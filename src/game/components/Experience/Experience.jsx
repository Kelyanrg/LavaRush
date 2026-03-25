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
    <Application 
    width={canvasSize.width} 
    height={canvasSize.height} 
    style={{ 
                width: `${canvasSize.width}px`, 
                height: `${canvasSize.height}px` 
            }}
    options={{ 
                resolution: window.devicePixelRatio || 2, 
                autoDensity: true,
                antialias: true
            }}>
      <MainContainer canvasSize={taille} onGameOver={onGameOver} />
    </Application>
  );
};
