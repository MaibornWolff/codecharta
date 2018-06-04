import "./nodeContextMenu.component.scss";
import {CodeMapNode} from "../../core/data/model/CodeMap";
import {codeMapBuilding} from "../codeMap/rendering/codeMapBuilding";
import {hierarchy} from "d3-hierarchy";
import {SettingsService} from "../../core/settings/settings.service";
import {ThreeOrbitControlsService} from "../codeMap/threeViewer/threeOrbitControlsService";

import angular from "angular";
import {MapColors} from "../codeMap/rendering/renderSettings";

export class NodeContextMenuComponent {

    private contextMenuBuilding;

    /* @ngInject */
    constructor(private $element: Element,
                private $timeout,
                private $window,
                private $rootScope,
                private settingsService: SettingsService,
                private threeOrbitControlsService: ThreeOrbitControlsService,
    ) {
        this.$rootScope.$on("show-node-context-menu",(e, data)=>{
            this.showContextMenu(data.building, data.x, data.y)
        });
        this.$rootScope.$on("hide-node-context-menu",()=>{
            this.hideContextMenu()
        });
    }

    public static show($rootScope, building: codeMapBuilding, x, y) {
        $rootScope.$broadcast("show-node-context-menu", {building: building, x:x, y:y});
    }

    public static hide($rootScope) {
        $rootScope.$broadcast("hide-node-context-menu");
    }

    showContextMenu(building: codeMapBuilding, x, y) {
        //TODO find a better way to do this
        this.$timeout(() => {
            this.contextMenuBuilding = this.getCodeMapNodeFromCodeMapBuilding(building);
        }, 50).then(()=>{
            this.$timeout(() => {
                let w = this.$element[0].children[0].clientWidth;
                let h = this.$element[0].children[0].clientHeight;
                let resX = Math.min(x, this.$window.innerWidth - w);
                let resY = Math.min(y, this.$window.innerHeight - h);
                angular.element(this.$element[0].children[0]).css("top", resY + "px");
                angular.element(this.$element[0].children[0]).css("left", resX + "px");
            },50);
        });
    }

    hideNode() {
        this.contextMenuBuilding.visible = false;
        hierarchy<CodeMapNode>(this.contextMenuBuilding).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = false;
        });
        this.hideContextMenu();
        this.apply();
    }

    markFolder(color: number) {

        this.contextMenuBuilding.markingColor = color+"";

        hierarchy<CodeMapNode>(this.contextMenuBuilding).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.markingColor = color+"";
        });
        this.hideContextMenu();
        this.apply();
    }

    markFolderPink() {
        this.markFolder(MapColors.highlight_pink);
    }

    markFolderBlue() {
        this.markFolder(MapColors.highlight_blue);
    }

    markFolderGreen() {
        this.markFolder(MapColors.highlight_green);
    }

    unmarkFolder() {
        this.contextMenuBuilding.markingColor = null;
        hierarchy<CodeMapNode>(this.contextMenuBuilding).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.markingColor = null;
        });
        this.hideContextMenu();
        this.apply();
    }

    nodeIsFolder() {
        return this.contextMenuBuilding && this.contextMenuBuilding.children && this.contextMenuBuilding.children.length > 0;
    }

    isolateNode() {
        this.settingsService.settings.map.root.visible = false;
        hierarchy<CodeMapNode>(this.settingsService.settings.map.root).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = false;
        });
        this.contextMenuBuilding.visible = true;
        hierarchy<CodeMapNode>(this.contextMenuBuilding).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = true;
        });
        this.$timeout(() => {
            this.threeOrbitControlsService.autoFitTo();
        }, 250);
        this.hideContextMenu();
        this.apply();
    }

    showAllNodes() {
        this.settingsService.settings.map.root.visible = true;
        hierarchy<CodeMapNode>(this.settingsService.settings.map.root).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = true;
        });
        this.$timeout(() => {
            this.threeOrbitControlsService.autoFitTo();
        }, 250);
        this.hideContextMenu();
        this.apply();
    }

    hideContextMenu() {
        this.$timeout(() => {
            this.contextMenuBuilding = null;
        }, 50);
    }

    getCodeMapNodeFromCodeMapBuilding(building: codeMapBuilding) {
        let path = building.node.path;
        let res = null;
        hierarchy<CodeMapNode>(this.settingsService.settings.map.root).each((hierarchyNode) => {
            if (hierarchyNode.data.path === path) {
                res = hierarchyNode.data;
            }
        });
        return res;
    }

    apply() {
        this.$timeout(() => {
            this.settingsService.onSettingsChanged();
        }, 50);
    }


}

export const nodeContextMenuComponent = {
    selector: "nodeContextMenuComponent",
    template: require("./nodeContextMenu.component.html"),
    controller: NodeContextMenuComponent
};



