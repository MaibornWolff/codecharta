import {codeMapBuilding} from "./rendering/codeMapBuilding";
import {ThreeCameraService} from "./threeViewer/threeCameraService";
import {IAngularEvent, IRootScopeService} from "angular";
import {ThreeViewerService} from "./threeViewer/threeViewerService";
import {MapTreeViewHoverEventSubscriber, MapTreeViewLevelController} from "../mapTreeView/mapTreeViewLevelComponent";
import {CodeMapNode} from "../../core/data/model/CodeMap";
import {CodeMapMouseEventService} from "./codeMap.MouseEvent.service";
import {CodeMapRenderService} from "./codeMap.render.service";

export class CodeMapController {

    /* @ngInject */
    constructor(
        private threeViewerService: ThreeViewerService,
        private $element: Element,
        private codeMapMouseEventService: CodeMapMouseEventService,
        private codeMapRenderService: CodeMapRenderService, //we need to call this service somewhere.
    ){
    }

    $postLink() {
        this.threeViewerService.init(this.$element[0]);
        this.threeViewerService.animate();
        this.codeMapMouseEventService.start();
    }

}

export const codeMapComponent = {
    selector: "codeMapComponent",
    template: "<div id='#codeMap'></div>",
    controller: CodeMapController
};



