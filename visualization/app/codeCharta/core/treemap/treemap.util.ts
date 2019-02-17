import {SquarifiedValuedCodeMapNode, TreeMapSettings} from "./treemap.service";
import {Node} from "../../ui/codeMap/rendering/node";
import {CodeMapUtilService} from "../../ui/codeMap/codeMap.util.service";

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

    public static isNodeLeaf(node: { children?: any }): boolean {
        return !(node.children && node.children.length > 0);
    }

    public static buildNodeFrom(squaredNode: SquarifiedValuedCodeMapNode,
                                heightScale: number,
                                heightValue: number,
                                maxHeight: number,
                                depth: number,
                                parent: Node,
                                s: TreeMapSettings,
                                minHeight: number,
                                folderHeight: number): Node {

        let calculatedHeightValue = heightValue;                            
        if (s.invertHeight) {
            calculatedHeightValue = (maxHeight - heightValue);
        }

        const flattened = TreeMapUtils.isNodeToBeFlat(squaredNode, s);
        if (flattened) {
            calculatedHeightValue = minHeight;
        }

        return {
            name: squaredNode.data.name,
            width: squaredNode.x1 - squaredNode.x0,
            height: Math.abs(TreeMapUtils.isNodeLeaf(squaredNode) ? Math.max(heightScale * calculatedHeightValue, minHeight) : folderHeight),
            length: squaredNode.y1 - squaredNode.y0,
            depth: depth,
            x0: squaredNode.x0,
            z0: depth * folderHeight,
            y0: squaredNode.y0,
            isLeaf: TreeMapUtils.isNodeLeaf(squaredNode),
            attributes: squaredNode.data.attributes,
            deltas: squaredNode.data.deltas,
            parent: parent,
            heightDelta: squaredNode.data.deltas && squaredNode.data.deltas[s.heightKey] ? heightScale * squaredNode.data.deltas[s.heightKey] : 0,
            visible: squaredNode.data.visible && !(TreeMapUtils.isNodeLeaf(squaredNode) && s.hideFlatBuildings && flattened),
            path: squaredNode.data.path,
            origin: squaredNode.data.origin,
            link: squaredNode.data.link,
            children: [],
            markingColor: CodeMapUtilService.getMarkingColor(squaredNode.data, s.markedPackages),
            flat: flattened,
        };

    }

    private static isNodeToBeFlat(squaredNode: SquarifiedValuedCodeMapNode, s: TreeMapSettings): boolean {

        let flattened = false;
        if (s.visibleEdges && s.visibleEdges.length > 0) {
            flattened = this.nodeHasNoVisibleEdges(squaredNode, s);
        }

        if (s.searchedNodePaths && s.searchPattern && s.searchPattern.length > 0) {
            flattened = (s.searchedNodePaths.length == 0) ? true : this.isNodeNonSearched(squaredNode, s);
        }
        return flattened;
    }

    private static nodeHasNoVisibleEdges(squaredNode: SquarifiedValuedCodeMapNode, s: TreeMapSettings): boolean {
        return s.visibleEdges.filter(edge =>
            squaredNode.data.path === edge.fromNodeName ||
            squaredNode.data.path === edge.toNodeName).length == 0;
    }

    private static isNodeNonSearched(squaredNode: SquarifiedValuedCodeMapNode, s: TreeMapSettings): boolean {
        return s.searchedNodePaths.filter(path =>
            path == squaredNode.data.path).length == 0;
    }
}