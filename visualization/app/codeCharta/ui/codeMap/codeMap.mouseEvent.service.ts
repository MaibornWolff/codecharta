import {MapTreeViewHoverEventSubscriber, MapTreeViewLevelController} from "../mapTreeView/mapTreeViewLevelComponent";
import {ThreeCameraService} from "./threeViewer/threeCameraService";
import {ThreeViewerService} from "./threeViewer/threeViewerService";
import {IAngularEvent, IRootScopeService} from "angular";
import {CodeMapNode} from "../../core/data/model/CodeMap";
import {codeMapBuilding} from "./rendering/codeMapBuilding";
import {CodeMapRenderService} from "./codeMap.render.service";

interface Coordinates {
    x: number,
    y: number
}

export interface CodeMapBuildingTransition {
    from: codeMapBuilding,
    to: codeMapBuilding
}

export interface CodeMapMouseEventServiceSubscriber {
    onBuildingHovered(data: CodeMapBuildingTransition, event: IAngularEvent),
    onBuildingSelected(data: CodeMapBuildingTransition, event: IAngularEvent)
}

export class CodeMapMouseEventService implements MapTreeViewHoverEventSubscriber {

    public static SELECTOR = "codeMapMouseEventService";

    private hovered = null;
    private selected = null;
    private mouse: Coordinates = {x:0,y:0};
    private dragOrClickFlag = 0;

    /* @ngInject */
    constructor(
        private $rootScope,
        private threeCameraService: ThreeCameraService,
        private threeRendererService,
        private threeSceneService,
        private threeUpdateCycleService,
        private threeViewerService: ThreeViewerService,
        private codeMapRenderService: CodeMapRenderService
    ){
        threeUpdateCycleService.register(this.update.bind(this));
        MapTreeViewLevelController.subscribeToHoverEvents($rootScope, this);
    }

    static subscribe($rootScope: IRootScopeService, subscriber: CodeMapMouseEventServiceSubscriber) {

        $rootScope.$on("building-hovered", (e, data:CodeMapBuildingTransition) => {
            subscriber.onBuildingHovered(data, e);
        });

        $rootScope.$on("building-selected", (e, data:CodeMapBuildingTransition) => {
            subscriber.onBuildingSelected(data, e);
        });

    }

    start() {
        this.threeRendererService.renderer.domElement.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false);
        this.threeRendererService.renderer.domElement.addEventListener("mouseup", this.onDocumentMouseUp.bind(this), false);
        this.threeRendererService.renderer.domElement.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false);
    }

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

    onDocumentMouseMove (event) {
        this.mouse.x = ( event.clientX / this.threeRendererService.renderer.domElement.width ) * 2 - 1;
        this.mouse.y = -( event.clientY / this.threeRendererService.renderer.domElement.height ) * 2 + 1;
        this.dragOrClickFlag = 1;
    }

    onDocumentMouseUp() {

        if(this.dragOrClickFlag === 0) {

            var from = this.selected;

            if (this.hovered) {
                this.selected = this.hovered;
                this.onBuildingSelected(from, this.selected);
            }

            if(!this.hovered && this.selected) {
                this.selected = null;
                this.onBuildingSelected(from, null);
            }

        } else if (this.dragOrClickFlag === 1){
            //drag
        }

    }

    onDocumentMouseDown(event) {
        if(event.button === 0) {
            this.onLeftClick(event);
        } else if (event.button === 2) {
            this.onRightClick(event);
        }
    }

    onRightClick(event) {
        console.log("right click");
    }

    onLeftClick(event) {
        this.dragOrClickFlag = 0;
    }

    onBuildingHovered(from: codeMapBuilding, to: codeMapBuilding){
        /*
         if the hovered node does not have useful data, then we should look at its parent. If the parent has useful data
         then this parent is a delta node which is made of two seperate, data-free nodes. This quick fix helps us to
         handle delta objects, until there is a method for mergng their meshes and materials correctly.
         See codeMapRenderService.js
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

    onShouldHoverNode(node: CodeMapNode) {
        let buildings: codeMapBuilding[] = this.codeMapRenderService.mapMesh.getMeshDescription().buildings;
        buildings.forEach((building)=>{
            if(building.node.path === node.path){
                this.onBuildingHovered(this.hovered, building);
            }
        });
    }

    onShouldUnhoverNode(node: CodeMapNode) {
        this.onBuildingHovered(this.hovered, null);
    }

};