import {codeMapBuilding} from "./rendering/codeMapBuilding";
import {ThreeViewerService} from "./threeViewer/threeViewerService";
import {
    CodeMapBuildingTransition, CodeMapMouseEventService,
    CodeMapMouseEventServiceSubscriber
} from "./codeMap.mouseEvent.service";
import {CodeMapRenderService} from "./codeMap.render.service";

import "./codeMap.component.scss";

import angular from "angular";
import {SettingsService} from "../../core/settings/settings.service";
import {hierarchy} from "d3-hierarchy";
import {CodeMapNode} from "../../core/data/model/CodeMap";
import {ThreeOrbitControlsService} from "./threeViewer/threeOrbitControlsService";

export class CodeMapController implements CodeMapMouseEventServiceSubscriber {

    private contextMenuBuilding: CodeMapNode;

    /* @ngInject */
    constructor(private threeViewerService: ThreeViewerService,
                private $element: Element,
                private $rootScope,
                private $timeout,
                private settingsService: SettingsService,
                private codeMapMouseEventService: CodeMapMouseEventService,
                private threeOrbitControlsService: ThreeOrbitControlsService,
                private codeMapRenderService: CodeMapRenderService, //we need to call this service somewhere.
    ) {
        CodeMapMouseEventService.subscribe($rootScope, this);
    }

    $postLink() {
        this.threeViewerService.init(this.$element[0].children[0]);
        this.threeViewerService.animate();
        this.codeMapMouseEventService.start();
    }

    onBuildingRightClicked(building: codeMapBuilding, x: number, y: number, event: angular.IAngularEvent) {
        this.hideContextMenu();
        if(building) {
            this.showContextMenu(building, x, y);
        }
    }

    onBuildingHovered(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
    }

    onBuildingSelected(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
    }

    showContextMenu(building: codeMapBuilding, x, y) {
        this.$timeout(()=>{
            this.contextMenuBuilding = this.getCodeMapNodeFromCodeMapBuilding(building);
            angular.element(this.$element[0].children[1]).css("top", y + "px");
            angular.element(this.$element[0].children[1]).css("left", x + "px");
        }, 50);
    }

    hideNode() {
        this.contextMenuBuilding.visible = false;
        hierarchy<CodeMapNode>(this.contextMenuBuilding).descendants().forEach((hierarchyNode)=>{
            hierarchyNode.data.visible = false;
        });
        this.hideContextMenu();
        this.apply();
    }

    markFolder() {
        this.contextMenuBuilding.highlighted = true;
        this.hideContextMenu();
        this.apply();
    }

    unmarkFolder() {
        this.contextMenuBuilding.highlighted = false;
        this.hideContextMenu();
        this.apply();
    }

    nodeIsFolder() {
        return this.contextMenuBuilding.children && this.contextMenuBuilding.children.length > 0;
    }

    isolateNode() {
        this.settingsService.settings.map.root.visible = false;
        hierarchy<CodeMapNode>(this.settingsService.settings.map.root).descendants().forEach((hierarchyNode)=>{
            hierarchyNode.data.visible = false;
        });
        this.contextMenuBuilding.visible = true;
        hierarchy<CodeMapNode>(this.contextMenuBuilding).descendants().forEach((hierarchyNode)=>{
            hierarchyNode.data.visible = true;
        });
        this.$timeout(()=> {
            this.threeOrbitControlsService.autoFitTo();
        },250);
        this.hideContextMenu();
        this.apply();
    }

    showAllNodes() {
        this.settingsService.settings.map.root.visible = true;
        hierarchy<CodeMapNode>(this.settingsService.settings.map.root).descendants().forEach((hierarchyNode)=>{
            hierarchyNode.data.visible = true;
        });
        this.$timeout(()=> {
            this.threeOrbitControlsService.autoFitTo();
        },250);
        this.hideContextMenu();
        this.apply();
    }

    hideContextMenu() {
        this.$timeout(()=>{
            this.contextMenuBuilding = null;
        }, 50);
    }

    getCodeMapNodeFromCodeMapBuilding(building: codeMapBuilding){
        let path = building.node.path;
        let res = null;
        hierarchy<CodeMapNode>(this.settingsService.settings.map.root).each((hierarchyNode)=>{
           if(hierarchyNode.data.path === path) {
               res = hierarchyNode.data;
           }
        });
        return res;
    }

    apply() {
        this.$timeout(()=>{
            this.settingsService.onSettingsChanged();
        }, 50);
    }

}

export const codeMapComponent = {
    selector: "codeMapComponent",
    template: require("./codeMap.component.html"),
    controller: CodeMapController
};



