import {CodeMapNode, BlacklistItem, BlacklistType} from "../../core/data/model/CodeMap";
import {hierarchy} from "d3-hierarchy";
import {MarkedPackage, SettingsService} from "../../core/settings/settings.service";
import ignore from 'ignore';
import * as path from 'path';
import {SquarifiedValuedCodeMapNode, TreeMapSettings} from "../../core/treemap/treemap.service";

export class CodeMapUtilService {

    public static SELECTOR = "codeMapUtilService";

    constructor(
        private settingsService: SettingsService
    ) {
    }

    public getAnyCodeMapNodeFromPath(path: string) {
        const firstTryNode = this.getCodeMapNodeFromPath(path, "File");
        if(!firstTryNode) {
            return this.getCodeMapNodeFromPath(path, "Folder");
        }
        return firstTryNode;
    }

    public getCodeMapNodeFromPath(path: string, nodeType: string) {
        let res = null;
        const rootNode = this.settingsService.settings.map.nodes;

        if (path == rootNode.path) {
            return rootNode;
        }

        hierarchy<CodeMapNode>(rootNode).each((hierarchyNode) => {
            if (hierarchyNode.data.path === path && hierarchyNode.data.type === nodeType) {
                res = hierarchyNode.data;
            }
        });
        return res;
    }

    public static transformPath(toTransform): string {
        return path.relative('/', toTransform);
    }

    public static resolvePath(toResolve): string {
        return path.resolve(toResolve);
    }

    public static getNodesByGitignorePath(nodes: Array<CodeMapNode>, gitignorePath: string): CodeMapNode[] {
        const ig = ignore().add(CodeMapUtilService.transformPath(gitignorePath));
        const ignoredNodePaths: string[] =  ig.filter(nodes.map(n => CodeMapUtilService.transformPath(n.path)));
        const matchingNodes: CodeMapNode[] =  nodes.filter(n => !ignoredNodePaths.includes(CodeMapUtilService.transformPath(n.path)));
        return matchingNodes;
    }

    public static numberOfBlacklistedNodes(nodes: Array<CodeMapNode>, blacklist: Array<BlacklistItem>): number {
        if (blacklist) {
            const ig = ignore().add(blacklist.map(ex => CodeMapUtilService.transformPath(ex.path)));
            const filteredNodes = ig.filter(nodes.map(n => CodeMapUtilService.transformPath(n.path)));
            return nodes.length - filteredNodes.length;
        } else {
            return 0;
        }
    }

    public static isBlacklisted(node: CodeMapNode, blacklist: Array<BlacklistItem>, type: BlacklistType): boolean {
        const ig = ignore().add(blacklist
            .filter(b => b.type == type)
            .map(ex => CodeMapUtilService.transformPath(ex.path)));
        return ig.ignores(CodeMapUtilService.transformPath(node.path));
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