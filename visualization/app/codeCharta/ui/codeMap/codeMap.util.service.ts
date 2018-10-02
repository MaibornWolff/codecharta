import {CodeMapNode} from "../../core/data/model/CodeMap";
import {hierarchy} from "d3-hierarchy";
import {SettingsService} from "../../core/settings/settings.service";

export class CodeMapUtilService {

    public static SELECTOR = "codeMapUtilService";

    constructor(
        private settingsService: SettingsService
    ) {
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