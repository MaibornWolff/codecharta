import {CodeMapNode, Edge, Exclude, ExcludeType} from "../../core/data/model/CodeMap";
import {hierarchy} from "d3-hierarchy";
import {SettingsService} from "../../core/settings/settings.service";
import {ThreeOrbitControlsService} from "./threeViewer/threeOrbitControlsService";
import angular from "angular";

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

    hideNode(node: CodeMapNode) {
        this.pushItemToBlacklist({path: node.path, type: ExcludeType.hide});
        this.apply();
    }

    showNode(node: CodeMapNode) {
        this.removeBlacklistEntry({path: node.path, type: ExcludeType.hide});
        this.apply();
    }

    showAllNodes() {
        this.setVisibilityOfNodeAndDescendants(this.settingsService.settings.map.root, true);
        this.removeAllBlacklistItemsOfType([ExcludeType.isolate, ExcludeType.hide]);
        this.autoFit();
        this.apply();
    }

    isolateNode(node: CodeMapNode) {
        this.removeBlacklistEntry({path: node.path, type: ExcludeType.hide});
        this.removeAllBlacklistItemsOfType([ExcludeType.isolate]);
        this.pushItemToBlacklist({path: node.path, type: ExcludeType.isolate});
        this.autoFit();
        this.apply();
    }

    unisolateNode(node: CodeMapNode) {
        this.removeBlacklistEntry({path: node.path, type: ExcludeType.isolate});
        this.autoFit();
        this.apply();
    }

    excludeNode(node: CodeMapNode) {
        this.pushItemToBlacklist({path: node.path, type: ExcludeType.exclude});
        this.apply();
    }

    removeBlacklistEntry(entry: Exclude) {
        this.settingsService.settings.blacklist = this.settingsService.settings.blacklist.filter(obj =>
            !this.isEqualObjects(obj, entry));
        if (entry.type == ExcludeType.isolate) {
            this.autoFit();
        }
        this.apply();
    }

    pushItemToBlacklist(item: Exclude) {
        var foundDuplicate = this.settingsService.settings.blacklist.filter(obj => {
            return this.isEqualObjects(obj, item);
        });
        if (foundDuplicate.length == 0) {
            this.settingsService.settings.blacklist.push(item);
        }
    }

    showDependentEdges(node: CodeMapNode) {
        this.changeEdgesVisibility(true, node);
    }

    hideDependentEdges(node: CodeMapNode) {
        this.changeEdgesVisibility(false, node);
    }

    hideAllEdges() {
        this.changeEdgesVisibility(false);
    }

    isNodeIsolated(node: CodeMapNode) {
        var foundItem =  this.settingsService.settings.blacklist.filter(obj =>
            this.isEqualObjects(obj, {path: node.path, type: ExcludeType.isolate}));

        return foundItem.length == 1;
    }

    amountOfDependentEdges(node: CodeMapNode) {
        return this.settingsService.settings.map.edges.filter(edge => this.edgeContainsNode(edge, node)).length;
    }

    amountOfVisibleDependentEdges(node: CodeMapNode) {
        return this.settingsService.settings.map.edges.filter(edge => this.edgeContainsNode(edge, node) && edge.visible).length;
    }

    anyEdgeIsVisible() {
        return this.settingsService.settings.map.edges.filter(edge => edge.visible).length > 0;
    }

    private changeEdgesVisibility(visibility: boolean, node: CodeMapNode = null) {
        if (this.settingsService.settings.map.edges) {
            this.settingsService.settings.map.edges.forEach((edge) => {
                if (node == null || this.edgeContainsNode(edge, node)) {
                    edge.visible = visibility;
                }
            });
            this.apply();
        }
    }

    /*private removeBlacklistEntry(item) {
        if(this.settingsService.settings.blacklist) {
            var foundItem = this.settingsService.settings.blacklist.filter(obj => this.isEqualObjects(obj, item));
            if (foundItem.length != 0) {
                const indexToDelete = this.settingsService.settings.blacklist.indexOf(foundItem[0]);
                if (indexToDelete != -1) {
                    this.settingsService.settings.blacklist.splice(indexToDelete, 1);
                }
            }
        }
    }*/

    private removeAllBlacklistItemsOfType(excludeTypeArray: ExcludeType[]) {
        var remainingItems = [];
        this.settingsService.settings.blacklist.forEach((item)=> {
            if(!excludeTypeArray.includes(item.type)) {
                remainingItems.push(item);
            }
        });
        this.settingsService.settings.blacklist = remainingItems;
    }

    private edgeContainsNode(edge: Edge, node: CodeMapNode) {
        return (node.path == edge.fromNodeName || node.path == edge.toNodeName);
    }

    private isEqualObjects(obj1, obj2) {
        return JSON.stringify(angular.toJson(obj1)) === JSON.stringify(angular.toJson(obj2))
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