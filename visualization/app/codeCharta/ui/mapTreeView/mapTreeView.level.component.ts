import {SettingsService} from "../../core/settings/settings.service";
import {IRootScopeService, IAngularEvent} from "angular";
import {CodeMapNode, BlacklistType} from "../../core/data/model/CodeMap";
import {NodeContextMenuController} from "../nodeContextMenu/nodeContextMenu.component";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";
import { CodeMapMouseEventServiceSubscriber, CodeMapBuildingTransition, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service";
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding";

export interface MapTreeViewHoverEventSubscriber {
    onShouldHoverNode(node: CodeMapNode);
    onShouldUnhoverNode(node: CodeMapNode);
}

export class MapTreeViewLevelController implements CodeMapMouseEventServiceSubscriber{

    public _isHoveredInCodeMap: boolean = false;
    public node: CodeMapNode = null;
    public depth: number = 0;
    public collapsed: boolean = true;

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private codeMapActionsService: CodeMapActionsService,
        private settingsService: SettingsService
    ) {
        CodeMapMouseEventService.subscribe(this.$rootScope, this);
    }

    public getMarkingColor() {
        let defaultColor = "#000";

        if(!this.node || this.node.type == "File") {
            return defaultColor;
        }
        const markingColor = CodeMapUtilService.getMarkingColor(this.node, this.settingsService.settings.markedPackages);
        return markingColor ? markingColor : defaultColor;
    }

    public onBuildingHovered(data: CodeMapBuildingTransition, event: IAngularEvent) {
        if(data.to && data.to.node && this.node && this.node.path && data.to.node.path === this.node.path) {
            this._isHoveredInCodeMap = true;
        } else {
            this._isHoveredInCodeMap = false;
        }
    }
    public onBuildingSelected(data: CodeMapBuildingTransition, event: IAngularEvent) {
        // unused
    }
    public onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number, event: IAngularEvent) {
        // unused
    }

    public onMouseEnter() {
        this.$rootScope.$broadcast("should-hover-node", this.node);
    }

    public onMouseLeave() {
        this.$rootScope.$broadcast("should-unhover-node", this.node);
    }

    public onRightClick($event) {
        NodeContextMenuController.broadcastHideEvent(this.$rootScope);
        NodeContextMenuController.broadcastShowEvent(this.$rootScope, this.node.path, this.node.type, $event.clientX, $event.clientY);
    }

    public onFolderClick() {
        this.collapsed = !this.collapsed;
    }

    public onLabelClick() {
        this.codeMapActionsService.focusNode(this.node);
    }

    public onEyeClick() {
        this.codeMapActionsService.toggleNodeVisibility(this.node);
    }

    public isLeaf(node: CodeMapNode = this.node): boolean {
        return !(node && node.children && node.children.length > 0);
    }

    public isBlacklisted(node: CodeMapNode): boolean {
        if (node != null) {
            return CodeMapUtilService.isBlacklisted(node, this.settingsService.settings.blacklist, BlacklistType.exclude)
        }
        return false;
    }

    public isSearched(node: CodeMapNode): boolean {
        if (node != null && this.settingsService.settings.searchedNodePaths) {
            return this.settingsService.settings.searchedNodePaths.filter(path =>
                path == node.path).length > 0;
        }
        return false;
    }

    public sortByFolder(node: CodeMapNode) {
        return (node && node.children && node.children.length > 0) ? 1 : 0;
    }

    public static subscribeToHoverEvents($rootScope: IRootScopeService, subscriber: MapTreeViewHoverEventSubscriber){
        $rootScope.$on("should-hover-node", (event, args)=>subscriber.onShouldHoverNode(args));
        $rootScope.$on("should-unhover-node", (event, args)=>subscriber.onShouldUnhoverNode(args));
    }

}

export const mapTreeViewLevelComponent = {
    selector: "mapTreeViewLevelComponent",
    template: require("./mapTreeView.level.component.html"),
    controller: MapTreeViewLevelController,
    bindings: {
        node: "<",
        depth: "<"
    }
};




