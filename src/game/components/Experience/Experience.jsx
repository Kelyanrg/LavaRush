import { useCallback, useEffect, useState } from "react"
import { calculateCanvasSize } from "../../helpers/common.js"
import { Application } from "@pixi/react"
import { MainContainer } from "./MainContainer/MainContainer.jsx"

export const Experience = () => {

    const [canvasSize, setCanvasSize] = useState(calculateCanvasSize());
    const updateCanvasSize = () => {
        setCanvasSize(calculateCanvasSize, []);
    }
    const taile = { "width": canvasSize.width / 2, "height": canvasSize.height }
    useEffect(() => {
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize)
    }, []);
    return (
        <Application width={canvasSize.width} height={canvasSize.height}>
            <MainContainer canvasSize={taile}>
            </MainContainer>
        </Application >
    )
}

