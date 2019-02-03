import {CodeMapNode, Edge, BlacklistItem, BlacklistType} from "../../core/data/model/CodeMap";
import {MarkedPackage, Settings, SettingsService} from "../../core/settings/settings.service";
import {ThreeOrbitControlsService} from "./threeViewer/threeOrbitControlsService";
import angular from "angular";
import {ColorService} from "../../core/color/color.service";

export class CodeMapActionsService {

    public static SELECTOR = "codeMapActionsService";

    constructor(
        private settingsService: SettingsService,
        private threeOrbitControlsService: ThreeOrbitControlsService,
        private $timeout,
        private colorService: ColorService
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
        let s = this.settingsService.settings;
        let newMarkedPackage: MarkedPackage = this.getNewMarkedPackage(node.path, color);

        if (!s.markedPackages || s.markedPackages == []) {
            this.addFirstPackageToSettings(newMarkedPackage, s);
            return;
        }

        const matchingPackagesByPath = s.markedPackages.filter(p => p.path == newMarkedPackage.path);
        const matchingPackagesByPathAndColor = matchingPackagesByPath.filter(p => p.color == newMarkedPackage.color);
        const markedParentPackagesSorted = this.getSortedMarkedParentPackages(newMarkedPackage, s);
        const markedChildrenPackages = this.getMarkedChildrenPackages(newMarkedPackage, s);

        if (matchingPackagesByPath.length == 0 && (markedParentPackagesSorted.length == 0 || markedParentPackagesSorted[0].color != newMarkedPackage.color)) {
            this.addMarkedPackage(newMarkedPackage, s);

        } else if (matchingPackagesByPathAndColor.length == 0) {
            this.removeMarkedPackage(matchingPackagesByPath[0], s);

            if (markedParentPackagesSorted.length == 0 || markedParentPackagesSorted[0].color != newMarkedPackage.color) {
                this.addMarkedPackage(newMarkedPackage, s);
            }
            this.settingsService.applySettings(s);
        }

        if (markedChildrenPackages.length > 0) {
            this.removeMarkedChildrenPackagesWithSameColor(markedChildrenPackages, s);
        }
    }

    unmarkFolder(node: CodeMapNode) {
        let s = this.settingsService.settings;
        const matchingPackagesByPath = s.markedPackages.filter(p => p.path == node.path);
        this.removeMarkedPackage(matchingPackagesByPath[0], s);
        this.settingsService.applySettings(s);
    }

    private removeMarkedChildrenPackagesWithSameColor(markedChildrenPackages: MarkedPackage[], s: Settings) {
        markedChildrenPackages.forEach(childPackage => {
            const markedParentPackagesSorted = this.getSortedMarkedParentPackages(childPackage, s);
            if(markedParentPackagesSorted.length > 0 && markedParentPackagesSorted[0].color == childPackage.color) {
                this.removeMarkedPackage(childPackage, s);
            }
        });
        this.settingsService.applySettings(s);
    }

    private getSortedMarkedParentPackages(newMarkedPackage: MarkedPackage, s: Settings) {
        return s.markedPackages
            .filter(p => newMarkedPackage.path.includes(p.path) && p.path != newMarkedPackage.path)
            .sort((a, b) => a.path.length > b.path.length ? 0 : 1);
    }

    private getMarkedChildrenPackages(newMarkedPackage: MarkedPackage, s: Settings) {
        return s.markedPackages.filter(p =>
            p.path.includes(newMarkedPackage.path) && p.path != newMarkedPackage.path);
    }

    private addFirstPackageToSettings(markedPackage: MarkedPackage, s: Settings) {
        s.markedPackages = [];
        this.addMarkedPackage(markedPackage, s);
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

    hideNode(node: CodeMapNode) {
        this.pushItemToBlacklist({path: node.path, type: BlacklistType.hide});
        this.apply();
    }

    showNode(node: CodeMapNode) {
        this.removeBlacklistEntry({path: node.path, type: BlacklistType.hide});
        this.apply();
    }

    focusNode(node: CodeMapNode) {
        if (node.path == this.settingsService.settings.map.nodes.path) {
            this.removeFocusedNode()
        } else {
            this.settingsService.settings.focusedNodePath = node.path;
            this.autoFit();
            this.apply();
        }
    }

    removeFocusedNode() {
        this.settingsService.settings.focusedNodePath = null;
        this.autoFit();
        this.apply();
    }

    excludeNode(node: CodeMapNode) {
        this.pushItemToBlacklist({path: node.path, type: BlacklistType.exclude});
        this.apply();
    }

    removeBlacklistEntry(entry: BlacklistItem) {
        this.settingsService.settings.blacklist = this.settingsService.settings.blacklist.filter(obj =>
            !this.isEqualObjects(obj, entry));
        this.apply();
    }

    pushItemToBlacklist(item: BlacklistItem) {
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

    amountOfDependentEdges(node: CodeMapNode) {
        return this.settingsService.settings.map.edges.filter(edge => this.edgeContainsNode(edge, node)).length;
    }

    amountOfVisibleDependentEdges(node: CodeMapNode) {
        return this.settingsService.settings.map.edges.filter(edge => this.edgeContainsNode(edge, node) && edge.visible).length;
    }

    anyEdgeIsVisible() {
        return this.settingsService.settings.map.edges.filter(edge => edge.visible).length > 0;
    }

    private getNewMarkedPackage(path: string, color: string, name: string = undefined): MarkedPackage {
        let coloredPackage: MarkedPackage = {
            path: path,
            color: this.colorService.convertHashtagTo0xString(color),
            attributes: {}
        };
        if (name) {
            coloredPackage.attributes.name = name;
        }
        return coloredPackage;
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
            this.settingsService.onSettingsChanged();
        }, 50);
    }

    private autoFit() {
        this.$timeout(() => {
            this.threeOrbitControlsService.autoFitTo();
        }, 250);
    }

}