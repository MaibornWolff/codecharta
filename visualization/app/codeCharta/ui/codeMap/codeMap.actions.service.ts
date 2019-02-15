import {CodeMapNode, Edge, BlacklistItem, BlacklistType} from "../../core/data/model/CodeMap";
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

    public toggleNodeVisibility(node: CodeMapNode) {
        if(node.visible){
            this.hideNode(node);
        } else {
            this.showNode(node);
        }
    }

    public markFolder(node: CodeMapNode, color: string) {
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

    public unmarkFolder(node: CodeMapNode) {
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

    public hideNode(node: CodeMapNode) {
        this.pushItemToBlacklist({path: node.path, type: BlacklistType.hide});
        this.apply();
    }

    public showNode(node: CodeMapNode) {
        this.removeBlacklistEntry({path: node.path, type: BlacklistType.hide});
        this.apply();
    }

    public focusNode(node: CodeMapNode) {
        if (node.path == this.settingsService.settings.map.nodes.path) {
            this.removeFocusedNode()
        } else {
            this.settingsService.settings.focusedNodePath = node.path;
            this.autoFit();
            this.apply();
        }
    }

    public removeFocusedNode() {
        this.settingsService.settings.focusedNodePath = null;
        this.autoFit();
        this.apply();
    }

    public excludeNode(node: CodeMapNode) {
        this.pushItemToBlacklist({path: node.path, type: BlacklistType.exclude});
        this.apply();
    }

    public removeBlacklistEntry(entry: BlacklistItem) {
        this.settingsService.settings.blacklist = this.settingsService.settings.blacklist.filter(obj =>
            !this.isEqualObjects(obj, entry));
        this.apply();
    }

    public pushItemToBlacklist(item: BlacklistItem) {
        const foundDuplicate = this.settingsService.settings.blacklist.filter(obj => {
            return this.isEqualObjects(obj, item);
        });
        if (foundDuplicate.length == 0) {
            this.settingsService.settings.blacklist.push(item);
        }
    }

    public showDependentEdges(node: CodeMapNode) {
        this.changeEdgesVisibility(true, node);
    }

    public hideDependentEdges(node: CodeMapNode) {
        this.changeEdgesVisibility(false, node);
    }

    public hideAllEdges() {
        this.changeEdgesVisibility(false);
    }

    public amountOfDependentEdges(node: CodeMapNode) {
        return this.settingsService.settings.map.edges.filter(edge => this.edgeContainsNode(edge, node)).length;
    }

    public amountOfVisibleDependentEdges(node: CodeMapNode) {
        return this.settingsService.settings.map.edges.filter(edge => this.edgeContainsNode(edge, node) && edge.visible).length;
    }

    public anyEdgeIsVisible() {
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

    private edgeContainsNode(edge: Edge, node: CodeMapNode) {
        return (node.path == edge.fromNodeName || node.path == edge.toNodeName);
    }

    private isEqualObjects(obj1, obj2) {
        return JSON.stringify(angular.toJson(obj1)) === JSON.stringify(angular.toJson(obj2))
    }

    private apply() {
        this.$timeout(() => {
            this.settingsService.applySettings();
        }, 50);
    }

    private autoFit() {
        this.$timeout(() => {
            this.threeOrbitControlsService.autoFitTo();
        }, 250);
    }

}