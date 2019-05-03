import {Node} from "../../../codeCharta.model";
import {ColorConverter} from "../../../util/colorConverter";
import {Color} from "three";

export class RenderingUtil {


    public static getMaxNodeDepth(nodes: Node[]): number {
        let max = 0;
        nodes.forEach((node)=>{
            max = Math.max(node.depth, max);
        });
        return max;
    }

    public static gradient(startColor: string, endColor: string, steps: number): string[] {
        let start: Color = ColorConverter.convertHexToColorObject(startColor)
        let end: Color = ColorConverter.convertHexToColorObject(endColor)
        let diff: Color = end.sub(start)
        let stepsArray = [];

        for(let i = 0; i <= steps; i++) {
            let stepDiff = diff.clone().multiplyScalar(1 / steps * i)
            let step = start.clone().add(stepDiff)
            stepsArray[i] = ColorConverter.convertColorToHex(step)
        }
        return stepsArray

    }
}
