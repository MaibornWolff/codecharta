import "./nodeContextMenu.component.scss";
import angular from "angular";
import {highlightColors} from "../codeMap/rendering/renderSettings";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";
import {ColorService} from "../../core/color/color.service";
import {SettingsService} from "../../core/settings/settings.service";

export class NodeContextMenuController {
    public amountOfDependentEdges;
    public amountOfVisibleDependentEdges;
    public anyEdgeIsVisible;

    private contextMenuBuilding;
    private _markingColors = [];

    /* @ngInject */
    constructor(private $element: Element,
                private $timeout,
                private $window,
                private $rootScope,
                private codeMapActionsService: CodeMapActionsService,
                private codeMapUtilService: CodeMapUtilService,
                private colorService: ColorService,
                private settingsService: SettingsService) {

        this.$rootScope.$on("show-node-context-menu", (e, data) => {
            this.show(data.path, data.type, data.x, data.y)
        });
        this.$rootScope.$on("hide-node-context-menu", () => {
            this.hide()
        });
    }

    public show(path: string, nodeType: string, mouseX: number, mouseY: number) {
        this.$timeout(() => {
            this.contextMenuBuilding = this.codeMapUtilService.getCodeMapNodeFromPath(path, nodeType);
        }, 50).then(() => {
            this.amountOfDependentEdges = this.codeMapActionsService.amountOfDependentEdges(this.contextMenuBuilding);
            this.amountOfVisibleDependentEdges = this.codeMapActionsService.amountOfVisibleDependentEdges(this.contextMenuBuilding);
            this.anyEdgeIsVisible = this.codeMapActionsService.anyEdgeIsVisible();
            this._markingColors = this.getConvertedMarkingColor();
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
        if (!color || !this.contextMenuBuilding) {
            return false;
        }

        let s = this.settingsService.settings;
        const firstMarkedParentPackage = this.codeMapActionsService.getFirstMarkedParentPackage(this.contextMenuBuilding.path, s);
        const convertedColor = this.colorService.convertHexTo0xString(color);

        const thisBuildingIsMarked = s.markedPackages.filter(mp => mp.path == this.contextMenuBuilding.path).length == 1;
        const colorMatchesThisBuilding = s.markedPackages.filter(mp => mp.path == this.contextMenuBuilding.path && mp.color == convertedColor);
        const colorMatchesParentBuilding = s.markedPackages.filter(mp => firstMarkedParentPackage && mp.path == firstMarkedParentPackage.path && mp.color == convertedColor);

        if (thisBuildingIsMarked) {
            return colorMatchesThisBuilding.length == 1;
        } else {
            return colorMatchesParentBuilding.length == 1;
        }
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

    private getConvertedMarkingColor(): string[] {
        return highlightColors.map(color => this.colorService.convertNumberToHex(color));
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



