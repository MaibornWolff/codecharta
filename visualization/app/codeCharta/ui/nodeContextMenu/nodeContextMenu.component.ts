import "./nodeContextMenu.component.scss";
import angular from "angular";
import {highlightColors} from "../codeMap/rendering/renderSettings";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";

export class NodeContextMenuController {
    public amountOfDependentEdges;
    public amountOfVisibleDependentEdges;
    public anyEdgeIsVisible;

    private contextMenuBuilding;

    private _colors = highlightColors;

    /* @ngInject */
    constructor(private $element: Element,
                private $timeout,
                private $window,
                private $rootScope,
                private codeMapActionsService: CodeMapActionsService,
                private codeMapUtilService: CodeMapUtilService) {

        this.$rootScope.$on("show-node-context-menu", (e, data) => {
            this.show(data.path, data.type, data.x, data.y)
        });
        this.$rootScope.$on("hide-node-context-menu", () => {
            this.hide()
        });

        document.body.addEventListener("click", () => NodeContextMenuController.broadcastHideEvent(this.$rootScope), true)

    }

    public show(path: string, nodeType: string, mouseX: number, mouseY: number) {
        this.$timeout(() => {
            this.contextMenuBuilding = this.codeMapUtilService.getCodeMapNodeFromPath(path, nodeType);
        }, 50).then(() => {
            this.amountOfDependentEdges = this.codeMapActionsService.amountOfDependentEdges(this.contextMenuBuilding);
            this.amountOfVisibleDependentEdges = this.codeMapActionsService.amountOfVisibleDependentEdges(this.contextMenuBuilding);
            this.anyEdgeIsVisible = this.codeMapActionsService.anyEdgeIsVisible();
            const {x, y} = this.calculatePosition(mouseX, mouseY);
            this.setPosition(x, y);
        });
    }

    public calculatePosition(mouseX: number, mouseY: number) {
        const w = this.$element[0].children[0].clientWidth;
        const h = this.$element[0].children[0].clientHeight;
        return {
            x: Math.min(mouseX, this.$window.innerWidth - w),
            y: Math.min(mouseY, this.$window.innerHeight - h)
        }
    }

    public setPosition(x: number, y: number) {
        angular.element(this.$element[0].children[0]).css("top", y + "px");
        angular.element(this.$element[0].children[0]).css("left", x + "px");
    }

    public hideNode() {
        this.hide();
        this.codeMapActionsService.hideNode(this.contextMenuBuilding);
    }

    public showNode() {
        this.hide();
        this.codeMapActionsService.showNode(this.contextMenuBuilding);
    }

    public clickColor(color: string) {
        if (this.currentFolderIsMarkedWithColor(color)) {
            this.unmarkFolder();
        } else {
            this.markFolder(color);
        }
    }

    public currentFolderIsMarkedWithColor(color: string) {
        return color
        && this.contextMenuBuilding
        && this.contextMenuBuilding.markingColor
        && color.substring(1) === this.contextMenuBuilding.markingColor.substring(2);
    }

    public markFolder(color: string) {
        this.hide();
        this.codeMapActionsService.markFolder(this.contextMenuBuilding, color);
    }

    public unmarkFolder() {
        this.hide();
        this.codeMapActionsService.unmarkFolder(this.contextMenuBuilding);
    }

    public focusNode() {
        this.hide();
        this.codeMapActionsService.focusNode(this.contextMenuBuilding);
    }

    public hide() {
        this.$timeout(() => {
            this.contextMenuBuilding = null;
        }, 0);
    }

    public showDependentEdges() {
        this.hide();
        this.codeMapActionsService.showDependentEdges(this.contextMenuBuilding);
    }

    public hideDependentEdges() {
        this.hide();
        this.codeMapActionsService.hideDependentEdges(this.contextMenuBuilding);
    }

    public hideAllEdges() {
        this.hide();
        this.codeMapActionsService.hideAllEdges();
    }

    public excludeNode() {
        this.hide();
        this.codeMapActionsService.excludeNode(this.contextMenuBuilding)
    }

    public nodeIsFolder() {
        return this.contextMenuBuilding && this.contextMenuBuilding.children && this.contextMenuBuilding.children.length > 0;
    }

    public static broadcastShowEvent($rootScope, path: string, type: string, x, y) {
        $rootScope.$broadcast("show-node-context-menu", {path: path, type: type, x: x, y: y});
    }

    public static broadcastHideEvent($rootScope) {
        $rootScope.$broadcast("hide-node-context-menu");
    }

}

export const nodeContextMenuComponent = {
    selector: "nodeContextMenuComponent",
    template: require("./nodeContextMenu.component.html"),
    controller: NodeContextMenuController
};



