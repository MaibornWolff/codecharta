import {MapTreeViewHoverEventSubscriber, MapTreeViewLevelController} from "../mapTreeView/mapTreeView.level.component";
import {ThreeCameraService} from "./threeViewer/threeCameraService";
import {IAngularEvent, IRootScopeService} from "angular";
import {CodeMapNode} from "../../core/data/model/CodeMap";
import {CodeMapBuilding} from "./rendering/codeMapBuilding";
import {CodeMapRenderService} from "./codeMap.render.service";
import $ from "jquery";
import {
    ViewCubeEventPropagationSubscriber,
    ViewCubeMouseEventsService
} from "../viewCube/viewCube.mouseEvents.service";

interface Coordinates {
    x: number;
    y: number;
}

export interface CodeMapBuildingTransition {
    from: CodeMapBuilding;
    to: CodeMapBuilding;
}

export interface CodeMapMouseEventServiceSubscriber {
    onBuildingHovered(data: CodeMapBuildingTransition, event: IAngularEvent);
    onBuildingSelected(data: CodeMapBuildingTransition, event: IAngularEvent);
    onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number, event: IAngularEvent);
}

export class CodeMapMouseEventService
    implements
        MapTreeViewHoverEventSubscriber,
        ViewCubeEventPropagationSubscriber {
    public static SELECTOR = "codeMapMouseEventService";

    private hovered = null;
    private selected = null;
    private mouse: Coordinates = { x: 0, y: 0 };
    private dragOrClickFlag = 0;

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private $window,
        private threeCameraService: ThreeCameraService,
        private threeRendererService,
        private threeSceneService,
        private threeUpdateCycleService,
        private codeMapRenderService: CodeMapRenderService
    ) {
        this.threeUpdateCycleService.register(this.update.bind(this));
        MapTreeViewLevelController.subscribeToHoverEvents($rootScope, this);
    }

    public start() {
        this.threeRendererService.renderer.domElement.addEventListener(
            "mousemove",
            this.onDocumentMouseMove.bind(this),
            false
        );
        this.threeRendererService.renderer.domElement.addEventListener(
            "mouseup",
            this.onDocumentMouseUp.bind(this),
            false
        );
        this.threeRendererService.renderer.domElement.addEventListener(
            "mousedown",
            this.onDocumentMouseDown.bind(this),
            false
        );
        this.threeRendererService.renderer.domElement.addEventListener(
            "dblclick",
            this.onDocumentDoubleClick.bind(this),
            false
        );
        ViewCubeMouseEventsService.subscribeToEventPropagation(
            this.$rootScope,
            this
        );
    }

    public onViewCubeEventPropagation(eventType: string, event: MouseEvent) {
        switch (eventType) {
            case "mousemove":
                this.onDocumentMouseMove(event);
                break;
            case "mouseup":
                this.onDocumentMouseUp();
                break;
            case "mousedown":
                this.onDocumentMouseDown(event);
                break;
            case "dblclick":
                this.onDocumentDoubleClick(event);
                break;
        }
    }

    public update() {
        this.threeCameraService.camera.updateMatrixWorld(false);

        if (this.threeSceneService.getMapMesh() != null) {
            let intersectionResult = this.threeSceneService
                .getMapMesh()
                .checkMouseRayMeshIntersection(
                    this.mouse,
                    this.threeCameraService.camera
                );

            let from = this.hovered;
            let to = null;

            if (intersectionResult.intersectionFound == true) {
                to = intersectionResult.building;
            } else {
                to = null;
            }

            if (from != to) {
                this.onBuildingHovered(from, to);
                this.hovered = to;
            }
        }
    }

    public onDocumentMouseMove(event) {
        const topOffset = $(this.threeRendererService.renderer.domElement).offset().top - $(window).scrollTop();
        this.mouse.x = ( event.clientX / this.threeRendererService.renderer.domElement.width ) * 2 - 1;
        this.mouse.y = -( (event.clientY - topOffset) / this.threeRendererService.renderer.domElement.height ) * 2 + 1;
        this.dragOrClickFlag = 1;
    }

    public onDocumentMouseUp() {

        if (this.dragOrClickFlag === 0) {
            let from = this.selected;

            if (this.hovered) {
                this.selected = this.hovered;
                this.onBuildingSelected(from, this.selected);
            }

            if (!this.hovered && this.selected) {
                this.selected = null;
                this.onBuildingSelected(from, null);
            }
        } else if (this.dragOrClickFlag === 1) {
            //drag
        }
    }

    public onDocumentMouseDown(event) {
        if (event.button === 0) {
            this.onLeftClick(event);
        } else if (event.button === 2) {
            this.onRightClick(event);
        }
    }

    public onRightClick(event) {
        this.$rootScope.$broadcast("building-right-clicked", {
            building: this.hovered,
            x: event.clientX,
            y: event.clientY,
            event: event
        });
    }

    public onLeftClick(event) {
        this.dragOrClickFlag = 0;
    }

    public onDocumentDoubleClick(event) {
        if (!this.hovered) {
            return;
        }
        let fileSourceLink = this.hovered.node.link;

        if (fileSourceLink) {
            this.$window.open(fileSourceLink, "_blank");
        }
    }

    public onBuildingHovered(from: CodeMapBuilding, to: CodeMapBuilding) {
        /*
         if the hovered node does not have useful data, then we should look at its parent. If the parent has useful data
         then this parent is a delta node which is made of two seperate, data-free nodes. This quick fix helps us to
         handle delta objects, until there is a method for mergng their meshes and materials correctly.
         See codeMapRenderService.js
         */
        if (to && !to.node) {
            if (to.parent && to.parent.node) {
                to.node = to.parent.node;
            }
        }

        this.$rootScope.$broadcast("building-hovered", { to: to, from: from });

        if (to !== null) {
            this.threeSceneService.getMapMesh().setHighlighted([to]);
        } else {
            this.threeSceneService.getMapMesh().clearHighlight();
        }
    }

    public onBuildingSelected(from: CodeMapBuilding, to: CodeMapBuilding) {
        this.$rootScope.$broadcast("building-selected", {to: to, from: from});

        if (to !== null) {
            this.threeSceneService.getMapMesh().setSelected([to]);
        } else {
            this.threeSceneService.getMapMesh().clearSelected();
        }
    }

    public onShouldHoverNode(node: CodeMapNode) {
        let buildings: CodeMapBuilding[] = this.codeMapRenderService.mapMesh.getMeshDescription().buildings;
        buildings.forEach((building) => {
            if (building.node.path === node.path) {
                this.onBuildingHovered(this.hovered, building);
            }
        });
    }

    public onShouldUnhoverNode(node: CodeMapNode) {
        this.onBuildingHovered(this.hovered, null);
    }

    public static subscribe($rootScope: IRootScopeService, subscriber: CodeMapMouseEventServiceSubscriber) {

        $rootScope.$on("building-hovered", (e, data: CodeMapBuildingTransition) => {
            subscriber.onBuildingHovered(data, e);
        });

        $rootScope.$on("building-selected", (e, data: CodeMapBuildingTransition) => {
            subscriber.onBuildingSelected(data, e);
        });

        $rootScope.$on("building-right-clicked", (e, data) => {
            subscriber.onBuildingRightClicked(data.building, data.x, data.y, e);
        });

    }

}
