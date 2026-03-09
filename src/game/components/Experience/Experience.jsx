import { useCallback, useEffect, useState } from "react"
import { calculateCanvasSize } from "../../helpers/common.js"
import { Application } from "@pixi/react"
import { MainContainer } from "./MainContainer/MainContainer.jsx"

export const Experience = () => {

    const [canvasSize, setCanvasSize] = useState(calculateCanvasSize());
    const updateCanvasSize = () => {
        setCanvasSize(calculateCanvasSize, []);
    }
    const taile = { "width": 900, "height": 1080 }
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

