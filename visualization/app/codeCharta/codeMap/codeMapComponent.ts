import {codeMapBuilding} from "./rendering/codeMapBuilding"
import {ThreeCameraService} from "./threeViewer/threeCameraService";
import {IAngularEvent, IRootScopeService} from "angular";
import {ThreeViewerService} from "./threeViewer/threeViewerService";
import {CodeMapService} from "./codeMapService";

interface Coordinates {
    x: number,
    y: number
}

export interface CodeMapBuildingTransition {
    from: codeMapBuilding,
    to: codeMapBuilding
}

export interface CodeMapControllerSubscriber {
    onBuildingHovered(data: CodeMapBuildingTransition, event: IAngularEvent),
    onBuildingSelected(data: CodeMapBuildingTransition, event: IAngularEvent)
}

/**
 * Controls the codeMapDirective
 */
export class CodeMapController {

    private hovered;
    private selected;
    private mouse: Coordinates;

    /* @ngInject */
    constructor(
        private $rootScope,
        private threeCameraService: ThreeCameraService,
        private threeRendererService,
        private threeSceneService,
        private threeUpdateCycleService,
        private threeViewerService: ThreeViewerService,
        private $element: Element,
        private codeMapService: CodeMapService, //we need to call this service somewhere.
    ){

        /**
         * hovered mesh
         * @type {object}
         */
        this.hovered = null;

        /**
         * selected mesh
         * @type {object}
         */
        this.selected = null;

        /**
         * current mouse position
         * @type {{x: number, y: number}}
         */
        this.mouse = {x: 0, y: 0};

        document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false);
        document.addEventListener("click", this.onDocumentMouseDown.bind(this), false);

        threeUpdateCycleService.register(this.update.bind(this));
    }

    $postLink() {
        this.threeViewerService.init(this.$element[0]);
        this.threeViewerService.animate();
    }

    static subscribe($rootScope: IRootScopeService, subscriber: CodeMapControllerSubscriber) {

        $rootScope.$on("building-hovered", (e, data:CodeMapBuildingTransition) => {
            subscriber.onBuildingHovered(data, e);
        });

        $rootScope.$on("building-selected", (e, data:CodeMapBuildingTransition) => {
            subscriber.onBuildingSelected(data, e);
        });

    }

    /**
     * Update method which is bound to the {@link UpdateCycleService}
     */
    update() {
        this.threeCameraService.camera.updateMatrixWorld(false);

        if (this.threeSceneService.getMapMesh() != null)
        {
            let intersectionResult = this.threeSceneService.getMapMesh().checkMouseRayMeshIntersection(this.mouse, this.threeCameraService.camera);

            let from = this.hovered;
            let to = null;

            if (intersectionResult.intersectionFound == true)
            {
                to = intersectionResult.building;
            }
            else
            {
                to = null;
            }

            if (from != to)
            {
                this.onBuildingHovered(from, to);
                this.hovered = to;
            }
        }
    }

    /**
     * updates {CodeMapController.mouse} on mouse movement
     * @param {MouseEvent} event
     */
    onDocumentMouseMove (event) {
        this.mouse.x = ( event.clientX / this.threeRendererService.renderer.domElement.width ) * 2 - 1;
        this.mouse.y = -( event.clientY / this.threeRendererService.renderer.domElement.height ) * 2 + 1;
    }

    /**
     * updates {CodeMapController} on mouse down
     */
    onDocumentMouseDown() {
        var from = this.selected;

        if (this.hovered) {
            this.selected = this.hovered;
            this.onBuildingSelected(from, this.selected);
        }

        if(!this.hovered && this.selected) {
            this.selected = null;
            this.onBuildingSelected(from, null);
        }

    }

    /**
     * Called when a building is hovered.
     * @param from old building
     * @param to new building
     * @emits {building-hovered} on hover
     */
    onBuildingHovered(from: codeMapBuilding, to: codeMapBuilding){
        /*
         if the hovered node does not have useful data, then we should look at its parent. If the parent has useful data
         then this parent is a delta node which is made of two seperate, data-free nodes. This quick fix helps us to
         handle delta objects, until there is a method for mergng their meshes and materials correctly.
         See codeMapService.js
         */
        if(to && !to.node){
            if(to.parent && to.parent.node){
                to.node = to.parent.node;
            }
        }

        this.$rootScope.$broadcast("building-hovered", {to: to, from: from});

        if (to !== null)
        {
            this.threeSceneService.getMapMesh().setHighlighted([to]);
        }
        else
        {
            this.threeSceneService.getMapMesh().clearHighlight();
        }
    }

    /**
     * called when a building is selected.
     * @param from previously selected building
     * @param to currently selected building
     * @emits {building-selected} when building is selected
     */
    onBuildingSelected(from: codeMapBuilding, to: codeMapBuilding){
        this.$rootScope.$broadcast("building-selected", {to: to, from:from});

        if (to !== null)
        {
            this.threeSceneService.getMapMesh().setSelected([to]);
        }
        else
        {
            this.threeSceneService.getMapMesh().clearSelected();
        }
    }

};

export const codeMapComponent = {
    selector: "codeMapComponent",
    template: "<div id='#codeMap'></div>",
    controller: CodeMapController
};



