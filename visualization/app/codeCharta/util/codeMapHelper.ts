import {hierarchy} from "d3-hierarchy";
import { MarkedPackage } from "../codeCharta.model";
import ignore from 'ignore';
import * as path from 'path';
import { CodeMapNode, BlacklistItem, BlacklistType } from "../codeCharta.model";

export class CodeMapHelper {

    public static getAnyCodeMapNodeFromPath(path: string, root: CodeMapNode): CodeMapNode {
        const firstTryNode = this.getCodeMapNodeFromPath(path, "File", root);
        if(!firstTryNode) {
            return this.getCodeMapNodeFromPath(path, "Folder", root);
        }
        return firstTryNode;
    }

    public static getCodeMapNodeFromPath(path: string, nodeType: string, root: CodeMapNode): CodeMapNode {
        let res = null;

        if (path === root.path) {
            return root;
        }

        hierarchy<CodeMapNode>(root).each((hierarchyNode) => {
            if (hierarchyNode.data.path === path && hierarchyNode.data.type === nodeType) {
                res = hierarchyNode.data;
            }
        });
        return res;
    }

    public static transformPath(toTransform: string): string {
        return path.relative('/', toTransform);
    }

    public static getNodesByGitignorePath(nodes: Array<CodeMapNode>, gitignorePath: string): CodeMapNode[] {
        const ignoredNodePaths = ignore()
            .add(CodeMapHelper.transformPath(gitignorePath))
            .filter(nodes.map(n => CodeMapHelper.transformPath(n.path)));
        return nodes.filter(n => !ignoredNodePaths.includes(CodeMapHelper.transformPath(n.path)));
    }

    public static numberOfBlacklistedNodes(nodes: Array<CodeMapNode>, blacklist: Array<BlacklistItem>): number {
        if (blacklist) {
            const ig = ignore().add(blacklist.map(ex => CodeMapHelper.transformPath(ex.path)));
            const filteredNodes = ig.filter(nodes.map(n => CodeMapHelper.transformPath(n.path)));
            return nodes.length - filteredNodes.length;
        } else {
            return 0;
        }
    }

    public static isBlacklisted(node: CodeMapNode, blacklist: Array<BlacklistItem>, type: BlacklistType): boolean {
        if(blacklist.length === 0) {
            return false
        }

        const ig = ignore().add(blacklist
            .filter(b => b.type === type)
            .map(ex => CodeMapHelper.transformPath(ex.path)));
        return ig.ignores(CodeMapHelper.transformPath(node.path));
    }

    public static getMarkingColor(node: CodeMapNode, markedPackages: MarkedPackage[]): string {
        let markingColor = null;

        if (markedPackages) {
            let markedParentPackages = markedPackages.filter(mp => node.path.includes(mp.path));

            if (markedParentPackages.length > 0) {
                let sortedMarkedParentPackages = markedParentPackages.sort((a, b) => b.path.length - a.path.length);
                markingColor = sortedMarkedParentPackages[0].color;
            }
        }
        return markingColor;
    }
}