import {CodeMapBuilding} from "./rendering/codeMapBuilding";
import {ThreeViewerService} from "./threeViewer/threeViewerService";
import {
    CodeMapBuildingTransition, CodeMapMouseEventService,
    CodeMapMouseEventServiceSubscriber
} from "./codeMap.mouseEvent.service";

import "./codeMap.component.scss";

import angular from "angular";
import {NodeContextMenuController} from "../nodeContextMenu/nodeContextMenu.component";

export class CodeMapController implements CodeMapMouseEventServiceSubscriber {

    /* @ngInject */
    constructor(private threeViewerService: ThreeViewerService,
                private $element: Element,
                private $rootScope,
                private codeMapMouseEventService: CodeMapMouseEventService,
    ) {
        CodeMapMouseEventService.subscribe($rootScope, this);
    }

    public $postLink() {
        this.threeViewerService.init(this.$element[0].children[0]);
        this.threeViewerService.animate();
        this.codeMapMouseEventService.start();
    }

    public onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number, event: angular.IAngularEvent) {
        NodeContextMenuController.broadcastHideEvent(this.$rootScope);
        if (building) {
            const nodeType = (building.node.isLeaf) ? "File" : "Folder";
            NodeContextMenuController.broadcastShowEvent(this.$rootScope, building.node.path, nodeType, x, y);
        }
    }

    public onBuildingHovered(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
    }

    public onBuildingSelected(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
    }

}

export const codeMapComponent = {
    selector: "codeMapComponent",
    template: require("./codeMap.component.html"),
    controller: CodeMapController
};



