import {CodeMapNode, BlacklistItem, BlacklistType} from "../../core/data/model/CodeMap";
import {hierarchy} from "d3-hierarchy";
import {SettingsService} from "../../core/settings/settings.service";
import ignore from 'ignore';
import * as path from 'path';

export class CodeMapUtilService {

    public static SELECTOR = "codeMapUtilService";

    constructor(
        private settingsService: SettingsService
    ) {
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

    getAnyCodeMapNodeFromPath(path: string) {
        var firstTryNode = this.getCodeMapNodeFromPath(path, "File");
        if(!firstTryNode) {
            return this.getCodeMapNodeFromPath(path, "Folder");
        }
        return firstTryNode;
    }

    getCodeMapNodeFromPath(path: string, nodeType: string) {
        let res = null;
        const rootNode = this.settingsService.settings.map.root;

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
}