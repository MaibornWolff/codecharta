import {CodeMapNode, Exclude} from "../../core/data/model/CodeMap";
import {hierarchy} from "d3-hierarchy";
import * as d3 from "d3";
import {SettingsService} from "../../core/settings/settings.service";
import ignore from 'ignore';
import * as path from 'path';

export class CodeMapUtilService {

    public static SELECTOR = "codeMapUtilService";

    constructor(
        private settingsService: SettingsService
    ) {
    }

    private static transformPath(toTransform): string {
        return path.relative('/', toTransform);
    }

    public static numberOfBlacklistedNodes(nodes: Array<CodeMapNode>, blacklist: Array<Exclude>): number {
        const ig = ignore().add(blacklist.map(ex=>CodeMapUtilService.transformPath(ex.path)));
        return nodes.length - ig.filter(nodes.map(n=>CodeMapUtilService.transformPath(n.path))).length;
    }

    public static isBlacklisted(node: CodeMapNode, blacklist: Array<Exclude>): boolean {
        const ig = ignore().add(blacklist.map(ex=>CodeMapUtilService.transformPath(ex.path)));
        return ig.ignores(CodeMapUtilService.transformPath(node.path));
    }

    getCodeMapNodeFromPath(path: string, nodeType: string) {
        let res = null;
        hierarchy<CodeMapNode>(this.settingsService.settings.map.root).each((hierarchyNode) => {
            if (hierarchyNode.data.path === path && hierarchyNode.data.type === nodeType) {
                res = hierarchyNode.data;
            }
        });
        return res;
    }
}