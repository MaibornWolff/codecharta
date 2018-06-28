import {CodeMapNode} from "../../core/data/model/CodeMap";
import {hierarchy} from "d3-hierarchy";
import {SettingsService} from "../../core/settings/settings.service";
import {ThreeOrbitControlsService} from "./threeViewer/threeOrbitControlsService";

export class CodeMapActionsService {

    public static SELECTOR = "codeMapActionsService";

    constructor(private settingsService: SettingsService, private threeOrbitControlsService: ThreeOrbitControlsService, private $timeout) {

    }

    toggleNodeVisibility(node: CodeMapNode) {
        if(node.visible){
            this.hideNode(node);
        } else {
            this.showNode(node);
        }
    }

    hideNode(node: CodeMapNode) {
        node.visible = false;
        hierarchy<CodeMapNode>(node).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = false;
        });
        this.apply();
    }

    showNode(node: CodeMapNode) {
        node.visible = true;
        hierarchy<CodeMapNode>(node).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = true;
        });
        this.apply();
    }

    markFolder(node: CodeMapNode, color: string) {
        let startingColor = node.markingColor;
        let recFn = (current: CodeMapNode)=>{
            if(!current.markingColor || current.markingColor === startingColor) {
                current.markingColor = "0x"+color.substr(1);
                if(current.children){
                    current.children.forEach(recFn);
                }
            }
        };
        recFn(node);
        this.apply();
    }

    unmarkFolder(node: CodeMapNode) {
        let startingColor = node.markingColor;
        let recFn = (current: CodeMapNode)=>{
            if(current.markingColor === startingColor) {
                current.markingColor = null;
                if(current.children){
                    current.children.forEach(recFn);
                }
            }
        };
        recFn(node);
        this.apply();
    }



    isolateNode(node: CodeMapNode) {
        this.settingsService.settings.map.root.visible = false;
        hierarchy<CodeMapNode>(this.settingsService.settings.map.root).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = false;
        });
        node.visible = true;
        hierarchy<CodeMapNode>(node).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = true;
        });
        this.$timeout(() => {
            this.threeOrbitControlsService.autoFitTo();
        }, 250);
        this.apply();
    }

    showAllNodes() {
        this.settingsService.settings.map.root.visible = true;
        hierarchy<CodeMapNode>(this.settingsService.settings.map.root).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = true;
        });
        this.$timeout(() => {
            this.threeOrbitControlsService.autoFitTo();
        }, 250);
        this.apply();
    }

    apply() {
        this.$timeout(() => {
            this.settingsService.onSettingsChanged();
        }, 50);
    }

}