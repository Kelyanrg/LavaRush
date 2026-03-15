import { useCallback, useEffect, useState } from "react"
import { calculateCanvasSize } from "../../helpers/common.js"
import { Application, extend } from "@pixi/react"
import { TilingSprite, Assets } from "pixi.js"
import { MainContainer } from "./MainContainer/MainContainer.jsx"

extend({ TilingSprite })

export const Experience = () => {
    const [canvasSize, setCanvasSize] = useState(calculateCanvasSize());
        
    const updateCanvasSize = () => {
        setCanvasSize(calculateCanvasSize, []);
    }

    const taille = { "width": canvasSize.width, "height": canvasSize.height }
    
    useEffect(() => {
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize)
    }, [])

    return (
        <Application width={canvasSize.width} height={canvasSize.height}>
            <MainContainer canvasSize={taille} />
        </Application>
    )
}

