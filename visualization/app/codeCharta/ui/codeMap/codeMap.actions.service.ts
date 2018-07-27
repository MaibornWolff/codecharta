import {CodeMapNode} from "../../core/data/model/CodeMap";
import {hierarchy} from "d3-hierarchy";
import {MarkingPackages, SettingsService} from "../../core/settings/settings.service";
import {ThreeOrbitControlsService} from "./threeViewer/threeOrbitControlsService";

export class CodeMapActionsService {

    public static SELECTOR = "codeMapActionsService";

    constructor(
        private settingsService: SettingsService,
        private threeOrbitControlsService: ThreeOrbitControlsService,
        private $timeout
    ) {

    }

    toggleNodeVisibility(node: CodeMapNode) {
        if(node.visible){
            this.hideNode(node);
        } else {
            this.showNode(node);
        }
    }

    hideNode(node: CodeMapNode) {
        this.setVisibilityOfNodeAndDescendants(node, false);
        this.apply();
    }

    showNode(node: CodeMapNode) {
        this.setVisibilityOfNodeAndDescendants(node, true);
        this.apply();
    }

    markFolder(node: CodeMapNode, color: string) {
        let startingColor = node.markingColor;
        let recFn = (current: CodeMapNode)=>{
            if(!current.markingColor || current.markingColor === startingColor) {
                current.markingColor = "0x" + color.substr(1);
                if(current.children){
                    current.children.forEach(recFn);
                }
            }
        };
        recFn(node);
        this.addPackageLabelToLegend(node, color.substr(1));
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
        this.removePackageLabelFromLegend(node);
        this.apply();
    }

    private addPackageLabelToLegend(node: CodeMapNode, newColor: string) {
        const markingPackages = this.settingsService.settings.markingPackages;
        const markingPackageItem : MarkingPackages = {
            markingColor: newColor,
            packageItem: [{name: node.name, path: node.path}]
        };

        if(markingPackages) {
            for(const pl of markingPackages) {
                if (pl.packageItem[0].name == markingPackageItem.packageItem[0].name) {
                    const index = markingPackages.indexOf(pl);
                    this.settingsService.settings.markingPackages.splice(index);
                }
            }
            this.settingsService.settings.markingPackages.push(markingPackageItem);
        } else {
            this.settingsService.settings.markingPackages = [markingPackageItem];
        }
    }

    private removePackageLabelFromLegend(node: CodeMapNode) {
        const markingPackages = this.settingsService.settings.markingPackages;

        if(markingPackages) {
            for(var i = 0; i < markingPackages.length; i++) {

                if( markingPackages[i].packageItem[0].path.indexOf(node.path) >= 0){
                    const index = markingPackages.indexOf(markingPackages[i]);
                    this.settingsService.settings.markingPackages.splice(index);
                }
            }
        }
    }

    isolateNode(node: CodeMapNode) {
        this.setVisibilityOfNodeAndDescendants(this.settingsService.settings.map.root, false);
        this.setVisibilityOfNodeAndDescendants(node, true);
        this.autoFit();
        this.apply();
    }

    showAllNodes() {
        this.setVisibilityOfNodeAndDescendants(this.settingsService.settings.map.root, true);
        this.autoFit();
        this.apply();
    }

    private apply() {
        this.$timeout(() => {
            this.settingsService.onSettingsChanged();
        }, 50);
    }

    private autoFit() {
        this.$timeout(() => {
            this.threeOrbitControlsService.autoFitTo();
        }, 250);
    }

    private setVisibilityOfNodeAndDescendants(node: CodeMapNode, visibility: boolean) {
        node.visible = visibility;
        hierarchy<CodeMapNode>(node).descendants().forEach((hierarchyNode) => {
            hierarchyNode.data.visible = visibility;
        });
    }

}