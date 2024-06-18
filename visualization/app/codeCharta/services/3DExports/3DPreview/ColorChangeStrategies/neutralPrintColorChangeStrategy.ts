import { ColorChangeStrategy } from "./colorChangeStrategy"

export class NeutralPrintColorChangeStrategy implements ColorChangeStrategy {
    execute(numberOfColors, mesh) {
        const colorArray = numberOfColors >= 4 ? [1, 1, 0] : [1, 1, 1]
        mesh.material.color.setRGB(colorArray[0], colorArray[1], colorArray[2])
    }
}
