import "./nodeContextMenu.component.scss";
import {SettingsService} from "../../core/settings/settings.service";
import angular from "angular";
import {highlightColors} from "../codeMap/rendering/renderSettings";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";
import {ExcludeType} from "../../core/data/model/CodeMap";

export class NodeContextMenuComponent {

    private contextMenuBuilding;
    public nodeHasEdges;
    public allDependentEdgesAreVisible;
    public anyEdgeIsVisible;

    private colors = highlightColors;

    /* @ngInject */
    constructor(private $element: Element,
                private $timeout,
                private $window,
                private $rootScope,
                private settingsService: SettingsService,
                private codeMapActionsService: CodeMapActionsService,
                private codeMapUtilService: CodeMapUtilService) {
        this.$rootScope.$on("show-node-context-menu", (e, data) => {
            this.showContextMenu(data.path, data.type, data.x, data.y)
        });
        this.$rootScope.$on("hide-node-context-menu", () => {
            this.hideContextMenu()
        });
    }

    public static show($rootScope, path: string, type: string, x, y) {
        $rootScope.$broadcast("show-node-context-menu", {path: path, type: type, x: x, y: y});
    }

    public static hide($rootScope) {
        $rootScope.$broadcast("hide-node-context-menu");
    }

    showContextMenu(path: string, nodeType: string, x, y) {
        this.$timeout(() => {
            this.contextMenuBuilding = this.codeMapUtilService.getCodeMapNodeFromPath(path, nodeType);
        }, 50).then(() => {
            this.nodeHasEdges = this.codeMapActionsService.nodeHasEdges(this.contextMenuBuilding);
            this.allDependentEdgesAreVisible = this.codeMapActionsService.allDependentEdgesAreVisible(this.contextMenuBuilding);
            this.anyEdgeIsVisible = this.codeMapActionsService.anyEdgeIsVisible();

            let w = this.$element[0].children[0].clientWidth;
            let h = this.$element[0].children[0].clientHeight;
            let resX = Math.min(x, this.$window.innerWidth - w);
            let resY = Math.min(y, this.$window.innerHeight - h);
            angular.element(this.$element[0].children[0]).css("top", resY + "px");
            angular.element(this.$element[0].children[0]).css("left", resX + "px");
        });
    }

    hideNode() {
        this.hideContextMenu();
        this.codeMapActionsService.hideNode(this.contextMenuBuilding);
    }

    clickColor(color: string) {
        if (this.currentFolderIsMarkedWithColor(color)) {
            this.unmarkFolder();
        } else {
            this.markFolder(color);
        }
    }

    currentFolderIsMarkedWithColor(color: string) {
        return color
        && this.contextMenuBuilding
        && this.contextMenuBuilding.markingColor
        && color.substring(1) === this.contextMenuBuilding.markingColor.substring(2);
    }

    markFolder(color: string) {
        this.hideContextMenu();
        this.codeMapActionsService.markFolder(this.contextMenuBuilding, color);
    }

    unmarkFolder() {
        this.hideContextMenu();
        this.codeMapActionsService.unmarkFolder(this.contextMenuBuilding);
    }

    isolateNode() {
        this.hideContextMenu();
        this.codeMapActionsService.isolateNode(this.contextMenuBuilding);
    }

    showAllNodes() {
        this.hideContextMenu();
        this.codeMapActionsService.showAllNodes();
    }

    hideContextMenu() {
        this.$timeout(() => {
            this.contextMenuBuilding = null;
        }, 0);
    }

    showDependentEdges() {
        this.hideContextMenu();
        this.codeMapActionsService.showDependentEdges(this.contextMenuBuilding);
    }

    hideDependentEdges() {
        this.hideContextMenu();
        this.codeMapActionsService.hideDependentEdges(this.contextMenuBuilding);
    }

    hideAllEdges() {
        this.hideContextMenu();
        this.codeMapActionsService.hideAllEdges();
    }

    excludeNode() {
        this.hideContextMenu();
        this.codeMapActionsService.excludeNode(this.contextMenuBuilding)
    }

    nodeIsFolder() {
        return this.contextMenuBuilding && this.contextMenuBuilding.children && this.contextMenuBuilding.children.length > 0;
    }

}

export const nodeContextMenuComponent = {
    selector: "nodeContextMenuComponent",
    template: require("./nodeContextMenu.component.html"),
    controller: NodeContextMenuComponent
};



