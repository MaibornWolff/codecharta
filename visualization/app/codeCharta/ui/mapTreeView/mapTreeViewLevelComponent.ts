import {SettingsService} from "../../core/settings/settings.service";
import {IRootScopeService} from "angular";
import {CodeMapNode, ExcludeType} from "../../core/data/model/CodeMap";
import {NodeContextMenuController} from "../nodeContextMenu/nodeContextMenu.component";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";

export interface MapTreeViewHoverEventSubscriber {
    onShouldHoverNode(node: CodeMapNode);
    onShouldUnhoverNode(node: CodeMapNode);
}

export class MapTreeViewLevelController {

    public node: CodeMapNode = null;
    public depth: number = 0;
    public collapsed: boolean = true;

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private codeMapActionsService: CodeMapActionsService,
        private settingsService: SettingsService
    ) {

    }

    static subscribeToHoverEvents($rootScope: IRootScopeService, subscriber: MapTreeViewHoverEventSubscriber){
        $rootScope.$on("should-hover-node", (event, args)=>subscriber.onShouldHoverNode(args));
        $rootScope.$on("should-unhover-node", (event, args)=>subscriber.onShouldUnhoverNode(args));
    }

    getFolderColor() {
        if(!this.node) {
            return "#000";
        }
        return this.node.markingColor ? "#" + this.node.markingColor.substr(2) : "#000";
    }

    onMouseEnter() {
        this.$rootScope.$broadcast("should-hover-node", this.node);
    }

    onMouseLeave() {
        this.$rootScope.$broadcast("should-unhover-node", this.node);
    }

    onRightClick($event) {
        NodeContextMenuController.broadcastHideEvent(this.$rootScope);
        NodeContextMenuController.broadcastShowEvent(this.$rootScope, this.node.path, this.node.type, $event.clientX, $event.clientY);
    }

    onFolderClick() {
        this.collapsed = !this.collapsed;
    }

    onLabelClick() {
        this.codeMapActionsService.focusNode(this.node);
    }

    onEyeClick() {
        this.codeMapActionsService.toggleNodeVisibility(this.node);
    }

    isLeaf(node: CodeMapNode = this.node): boolean {
        return !(node && node.children && node.children.length > 0);
    }

    isBlacklisted(node: CodeMapNode): boolean {
        if (node != null) {
            return CodeMapUtilService.isBlacklisted(node, this.settingsService.settings.blacklist, ExcludeType.exclude)
        }
        return false;
    }

    isSearched(node: CodeMapNode): boolean {
        if (node != null && this.settingsService.settings.searchedNodePaths) {
            return this.settingsService.settings.searchedNodePaths.filter(path =>
                path == node.path).length > 0;
        }
        return false;
    }

    sortByFolder(node: CodeMapNode) {
        return (node && node.children && node.children.length > 0) ? 1 : 0;
    }

}

export const mapTreeViewLevelComponent = {
    selector: "mapTreeViewLevelComponent",
    template: require("./mapTreeViewLevel.html"),
    controller: MapTreeViewLevelController,
    bindings: {
        node: "<",
        depth: "<"
    }
};




