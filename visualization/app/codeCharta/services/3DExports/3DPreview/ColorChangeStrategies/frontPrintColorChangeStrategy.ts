import { ColorChangeStrategy } from "./colorChangeStrategy"

export class FrontPrintColorChangeStrategy implements ColorChangeStrategy {
    execute(numberOfColors, mesh) {
        let colorArray
        if (numberOfColors < 4) {
            colorArray = [1, 1, 1]
        } else if (numberOfColors === 4) {
            colorArray = [1, 1, 0]
        } else {
            colorArray = [1, 1, 1]
        }
        mesh.material.color.setRGB(colorArray[0], colorArray[1], colorArray[2])
        return true
    }
}
