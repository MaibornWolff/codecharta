import {CodeMapNode, Edge, BlacklistItem, BlacklistType} from "../../core/data/model/CodeMap";
import {MarkedPackage, Settings, SettingsService} from "../../core/settings/settings.service";
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
        let s = this.settingsService.settings;
        const newMP: MarkedPackage = this.getNewMarkedPackage(node.path, color);
        const clickedMP: MarkedPackage = s.markedPackages.find(p => p.path == newMP.path);
        const parentMP: MarkedPackage = this.getParentMP(newMP.path, s);

        this.handleUpdatingMarkedPackages(s, newMP, clickedMP, parentMP);
        this.settingsService.applySettings(s);
    }

    private handleUpdatingMarkedPackages(s: Settings, newMP: MarkedPackage, clickedMP: MarkedPackage, parentMP: MarkedPackage): void {
        if (!clickedMP && this.packagesHaveDifferentColor(parentMP, newMP)) {
            this.addMarkedPackage(newMP, s);

        } else if (this.packagesHaveDifferentColor(clickedMP, newMP)) {
            this.removeMarkedPackage(clickedMP, s);

            if (this.packagesHaveDifferentColor(parentMP, newMP)) {
                this.addMarkedPackage(newMP, s);
            }
        }
        this.removeChildrenMPWithSameColor(newMP, s);
    }

    private packagesHaveDifferentColor(mp1: MarkedPackage, mp2: MarkedPackage): boolean {
        return !(mp1 && mp2 && mp1.color == mp2.color);
    }

    public unmarkFolder(node: CodeMapNode) {
        let s = this.settingsService.settings;
        let clickedMP: MarkedPackage = s.markedPackages.find(p => p.path == node.path);

        if (clickedMP) {
            this.removeMarkedPackage(clickedMP, s);
        } else {
            const parentMP: MarkedPackage = this.getParentMP(node.path, s);
            this.removeMarkedPackage(parentMP, s);
        }
        this.settingsService.applySettings(s);
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

    public getParentMP(path: string, s: Settings): MarkedPackage {
        const sortedParentMP = s.markedPackages
            .filter(p => path.includes(p.path) && p.path != path)
            .sort((a, b) => b.path.length - a.path.length);

        return sortedParentMP.length > 0 ? sortedParentMP[0] : null;
    }

    private getNewMarkedPackage(path: string, color: string, name: string = undefined): MarkedPackage {
        let coloredPackage: MarkedPackage = {
            path: path,
            color: color,
            attributes: {}
        };
        if (name) {
            coloredPackage.attributes.name = name;
        }
        return coloredPackage;
    }

    private removeChildrenMPWithSameColor(newMP: MarkedPackage, s: Settings) {
        const allChildrenMP: MarkedPackage[] = this.getAllChildrenMP(newMP.path, s);
        if (allChildrenMP.length > 0) {
            allChildrenMP.forEach(childPackage => {
                const parentMP = this.getParentMP(childPackage.path, s);
                if (parentMP && parentMP.color == childPackage.color) {
                    this.removeMarkedPackage(childPackage, s);
                }
            });
        }
    }

    private getAllChildrenMP(path: string, s: Settings): MarkedPackage[] {
        return s.markedPackages.filter(p =>
            p.path.includes(path) && p.path != path);
    }

    private addMarkedPackage(markedPackage: MarkedPackage, s: Settings) {
        s.markedPackages.push(markedPackage);
        this.settingsService.applySettings(s);
    }

    private removeMarkedPackage(markedPackage: MarkedPackage, s: Settings) {
        const indexToRemove = s.markedPackages.indexOf(markedPackage);
        if (indexToRemove > -1) {
            s.markedPackages.splice(indexToRemove, 1);
        }
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

    private edgeContainsNode(edge: Edge, node: CodeMapNode): boolean {
        return (node.path == edge.fromNodeName || node.path == edge.toNodeName);
    }

    private isEqualObjects(obj1, obj2): boolean {
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