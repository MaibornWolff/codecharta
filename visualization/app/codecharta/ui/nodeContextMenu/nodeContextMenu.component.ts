import "./nodeContextMenu.component.scss";
import {CodeMapNode} from "../../core/data/model/CodeMap";
import {codeMapBuilding} from "../codeMap/rendering/codeMapBuilding";
import {hierarchy} from "d3-hierarchy";
import {SettingsService} from "../../core/settings/settings.service";
import {ThreeOrbitControlsService} from "../codeMap/threeViewer/threeOrbitControlsService";

import angular from "angular";
import {highlightColors, MapColors} from "../codeMap/rendering/renderSettings";

export class NodeContextMenuComponent {

    private contextMenuBuilding;

    private colors = highlightColors;

    /* @ngInject */
    constructor(private $element: Element,
                private $timeout,
                private $window,
                private $rootScope,
                private settingsService: SettingsService,
                private threeOrbitControlsService: ThreeOrbitControlsService,
    ) {
        this.$rootScope.$on("show-node-context-menu",(e, data)=>{
            this.showContextMenu(data.path, data.x, data.y)
        });
        this.$rootScope.$on("hide-node-context-menu",()=>{
            this.hideContextMenu()
        });
    }

    public getFilteredColors(){
        return this.colors.filter((x) => {
            let color = parseInt("0x"+x.substring(1),16);
            if(this.contextMenuBuilding && this.contextMenuBuilding.markingColor && parseInt(this.contextMenuBuilding.markingColor,16) === color) {
                return false;
            } else {
                return true;
            }
        });
    }

    public static show($rootScope, path: string, x, y) {
        $rootScope.$broadcast("show-node-context-menu", {path: path, x:x, y:y});
    }

    public static hide($rootScope) {
        $rootScope.$broadcast("hide-node-context-menu");
    }

    // TODO all these node methods propably need to go to one of the codemap.*.service components
    showContextMenu(path: string, x, y) {
        //TODO find a better way to do this
        this.$timeout(() => {
            this.contextMenuBuilding = this.getCodeMapNodeFromPath(path);
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

    markFolder(color: string) {
        this.hideContextMenu();

        let startingColor = this.contextMenuBuilding.markingColor;

        let recFn = (current: CodeMapNode)=>{
            if(!current.markingColor || current.markingColor === startingColor) {
                current.markingColor = "0x"+color.substr(1);
                if(current.children){
                    current.children.forEach(recFn);
                }
            }
        };

        recFn(this.contextMenuBuilding);

        this.apply();
    }

    unmarkFolder() {
        this.hideContextMenu();

        let startingColor = this.contextMenuBuilding.markingColor;

        let recFn = (current: CodeMapNode)=>{
            if(current.markingColor === startingColor) {
                current.markingColor = null;
                if(current.children){
                    current.children.forEach(recFn);
                }
            }
        };

        recFn(this.contextMenuBuilding);

        this.apply();
    }

    nodeIsFolder() {
        return this.contextMenuBuilding && this.contextMenuBuilding.children && this.contextMenuBuilding.children.length > 0;
    }

    isolateNode() {
        this.hideContextMenu();
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

        this.apply();
    }

    showAllNodes() {
        this.hideContextMenu();
        this.settingsService.settings.map.root.visible = true;
        hierarchy<CodeMapNode>(this.settingsService.settings.map.root).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = true;
        });
        this.$timeout(() => {
            this.threeOrbitControlsService.autoFitTo();
        }, 250);

        this.apply();
    }

    hideContextMenu() {
        this.$timeout(() => {
            this.contextMenuBuilding = null;
        }, 0);
    }

    getCodeMapNodeFromPath(path: string) {
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



