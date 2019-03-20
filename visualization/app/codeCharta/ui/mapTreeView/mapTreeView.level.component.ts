import {SettingsService} from "../../state/settings.service";
import {IRootScopeService, IAngularEvent} from "angular";
import {NodeContextMenuController} from "../nodeContextMenu/nodeContextMenu.component";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";
import { CodeMapMouseEventServiceSubscriber, CodeMapBuildingTransition, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service";
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding";
import { CodeMapNode, BlacklistType } from "../../codeCharta.model";

export interface MapTreeViewHoverEventSubscriber {
    onShouldHoverNode(node: CodeMapNode);
    onShouldUnhoverNode(node: CodeMapNode);
}

export class MapTreeViewLevelController implements CodeMapMouseEventServiceSubscriber{

    private node: CodeMapNode = null
    private depth: number = 0

    private _viewModel: {
        isHoveredInCodeMap: boolean,
        collapsed: boolean
    } = {
        isHoveredInCodeMap: false,
        collapsed: true
    }


    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private codeMapActionsService: CodeMapActionsService,
        private settingsService: SettingsService
    ) {
        CodeMapMouseEventService.subscribe(this.$rootScope, this);
    }

    public getMarkingColor() {
        let defaultColor = "#000000";

        if(!this._viewModel.node || this._viewModel.node.type == "File") {
            return defaultColor;
        }
        const markingColor = CodeMapUtilService.getMarkingColor(this.node, this.settingsService.getSettings().fileSettings.markedPackages);
        return markingColor ? markingColor : defaultColor;
    }

    public onBuildingHovered(data: CodeMapBuildingTransition, event: IAngularEvent) {
        if(data.to && data.to.node && this.node && this.node.path && data.to.node.path === this.node.path) {
            this._viewModel.isHoveredInCodeMap = true;
        } else {
            this._viewModel.isHoveredInCodeMap = false;
        }
    }

    public onBuildingSelected(data: CodeMapBuildingTransition, event: IAngularEvent) {
    }

    public onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number, event: IAngularEvent) {
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
        this._viewModel.collapsed = !this._viewModel.collapsed;
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
        if (node) {
            return CodeMapUtilService.isBlacklisted(node, this.settingsService.getSettings().fileSettings.blacklist, BlacklistType.exclude)
        }
        return false;
    }

    public isSearched(node: CodeMapNode): boolean {
        if (node != null && this.settingsService.getSettings().dynamicSettings.searchedNodePaths) {
            return this.settingsService.getSettings().dynamicSettings.searchedNodePaths
                .filter(path => path == node.path).length > 0;
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




