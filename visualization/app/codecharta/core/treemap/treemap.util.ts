import {SquarifiedValuedCodeMapNode} from "./treemap.service";
import {node} from "../../ui/codeMap/rendering/node";

export class TreeMapUtils {

    public static countNodes(node: { children?: any }): number {
        let count = 1;
        if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                count += TreeMapUtils.countNodes(node.children[i]);
            }
        }
        return count;
    }

    public static isNodeLeaf(squaredNode: SquarifiedValuedCodeMapNode): boolean {
        return !(squaredNode.children && squaredNode.children.length > 0);
    }

    public static buildNodeFrom(squaredNode: SquarifiedValuedCodeMapNode,
                                heightScale: number,
                                heightValue: number,
                                depth: number,
                                parent: node,
                                heightKey: string,
                                minHeight: number,
                                folderHeight: number): node {
        return {
            name: squaredNode.data.name,
            width: squaredNode.x1 - squaredNode.x0,
            height: Math.abs(TreeMapUtils.isNodeLeaf(squaredNode) ? Math.max(heightScale * heightValue, minHeight) : folderHeight),
            length: squaredNode.y1 - squaredNode.y0,
            depth: depth,
            x0: squaredNode.x0,
            z0: depth * folderHeight,
            y0: squaredNode.y0,
            isLeaf: TreeMapUtils.isNodeLeaf(squaredNode),
            attributes: squaredNode.data.attributes,
            deltas: squaredNode.data.deltas,
            parent: parent,
            heightDelta: Math.abs(squaredNode.data.deltas && squaredNode.data.deltas[heightKey] ? heightScale * squaredNode.data.deltas[heightKey] : 0),
            visible: squaredNode.data.visible,
            path: squaredNode.data.path,
            origin: squaredNode.data.origin,
            link: squaredNode.data.link,
            children: [],
            markingColor: parseInt(squaredNode.data.markingColor)
        };
    }

}