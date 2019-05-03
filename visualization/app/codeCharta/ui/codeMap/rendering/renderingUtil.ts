import {Node} from "../../../codeCharta.model";

export class RenderingUtil {


    public static getMaxNodeDepth(nodes: Node[]): number {
        let max = 0;
        nodes.forEach((node)=>{
            max = Math.max(node.depth, max);
        });
        return max;
    }


}
