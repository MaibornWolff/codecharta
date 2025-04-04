import { ColorChangeStrategy } from "./colorChangeStrategy"

export class PositivePrintColorChangeStrategy implements ColorChangeStrategy {
    execute(numberOfColors, mesh) {
        if (numberOfColors < 4) {
            return false
        }
        const colorArray = [0, 1, 0]
        mesh.material.color.setRGB(colorArray[0], colorArray[1], colorArray[2])
        return true
    }
}
