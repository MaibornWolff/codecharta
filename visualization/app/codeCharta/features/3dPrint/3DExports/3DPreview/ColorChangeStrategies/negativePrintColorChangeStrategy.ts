import { ColorChangeStrategy } from "./colorChangeStrategy"

export class NegativePrintColorChangeStrategy implements ColorChangeStrategy {
    execute(numberOfColors, mesh) {
        if (numberOfColors < 4) {
            return false
        }
        const colorArray = [1, 0, 0]
        mesh.material.color.setRGB(colorArray[0], colorArray[1], colorArray[2])
        return true
    }
}
