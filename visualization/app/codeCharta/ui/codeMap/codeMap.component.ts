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
import {CodeMapNode} from "../../core/data/model/CodeMap";
import {ThreeOrbitControlsService} from "./threeViewer/threeOrbitControlsService";
import {NodeContextMenuComponent} from "../nodeContextMenu/nodeContextMenu.component";

export class CodeMapController implements CodeMapMouseEventServiceSubscriber {

    private contextMenuBuilding: CodeMapNode;

    /* @ngInject */
    constructor(private threeViewerService: ThreeViewerService,
                private $element: Element,
                private $rootScope,
                private $timeout,
                private $window,
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
        NodeContextMenuComponent.hide(this.$rootScope);
        if (building) {
            const nodeType = (building.node.isLeaf) ? "File" : "Folder";
            NodeContextMenuComponent.show(this.$rootScope, building.node.path, nodeType, x, y);
        }
    }

    onBuildingHovered(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
    }

    onBuildingSelected(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
    }

}

export const codeMapComponent = {
    selector: "codeMapComponent",
    template: require("./codeMap.component.html"),
    controller: CodeMapController
};



