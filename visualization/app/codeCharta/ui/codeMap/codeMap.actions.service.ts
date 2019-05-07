import { SettingsService } from "../../state/settings.service"
import { CodeMapNode, BlacklistType, BlacklistItem, Edge } from "../../codeCharta.model"
import { CodeChartaService } from "../../codeCharta.service"
import { MarkedPackage, Settings} from "../../codeCharta.model";
import angular from "angular";
import {ThreeOrbitControlsService} from "./threeViewer/threeOrbitControlsService";

export class CodeMapActionsService {
	public static SELECTOR = "codeMapActionsService"

	constructor(
		private settingsService: SettingsService,
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {}

	public toggleNodeVisibility(node: CodeMapNode) {
		if (node.visible) {
			this.hideNode(node)
		} else {
			this.showNode(node)
		}
	}

    public markFolder(node: CodeMapNode, color: string) {
        let s = this.settingsService.getSettings();
        const newMP: MarkedPackage = this.getNewMarkedPackage(node.path, color);
        const clickedMP: MarkedPackage = s.fileSettings.markedPackages.find(p => p.path === newMP.path);
        const parentMP: MarkedPackage = this.getParentMP(newMP.path, s);

        this.handleUpdatingMarkedPackages(s, newMP, clickedMP, parentMP);
		this.settingsService.updateSettings({
			fileSettings: {
				markedPackages: s.fileSettings.markedPackages
			}
		});
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
        return !(mp1 && mp2 && mp1.color === mp2.color);
    }

    public unmarkFolder(node: CodeMapNode) {
        let s = this.settingsService.getSettings();
        let clickedMP: MarkedPackage = s.fileSettings.markedPackages.find(p => p.path === node.path);

        if (clickedMP) {
            this.removeMarkedPackage(clickedMP, s);
        } else {
            const parentMP: MarkedPackage = this.getParentMP(node.path, s);
            this.removeMarkedPackage(parentMP, s);
        }
        this.settingsService.updateSettings({
			fileSettings: {
				markedPackages: s.fileSettings.markedPackages
			}
		});
    }

	public hideNode(node: CodeMapNode) {
		this.pushItemToBlacklist({ path: node.path, type: BlacklistType.hide })
	}

	public showNode(node: CodeMapNode) {
		this.removeBlacklistEntry({ path: node.path, type: BlacklistType.hide })
	}

	public focusNode(node: CodeMapNode) {
		if (node.path === CodeChartaService.ROOT_PATH) {
			this.removeFocusedNode()
		} else {
			this.settingsService.updateSettings({ dynamicSettings: { focusedNodePath: node.path } })
			this.autoFit()
		}
	}

	public removeFocusedNode() {
		this.settingsService.updateSettings({ dynamicSettings: { focusedNodePath: "" } })
		this.autoFit()
	}

	public excludeNode(node: CodeMapNode) {
		this.pushItemToBlacklist({ path: node.path, type: BlacklistType.exclude })
	}

	public removeBlacklistEntry(entry: BlacklistItem) {
		this.settingsService.updateSettings({
			fileSettings: {
				blacklist: this.settingsService.getSettings().fileSettings.blacklist.filter(obj => !this.isEqualObjects(obj, entry))
			}
		})
	}

	public pushItemToBlacklist(item: BlacklistItem) {
		const foundDuplicate = this.settingsService.getSettings().fileSettings.blacklist.filter(obj => {
			return this.isEqualObjects(obj, item)
		})
		if (foundDuplicate.length === 0) {
            this.settingsService.updateSettings({
				fileSettings: {
                    blacklist: [...this.settingsService.getSettings().fileSettings.blacklist, item]
                }
            })
		}
	}

	public showDependentEdges(node: CodeMapNode) {
		this.changeEdgesVisibility(true, node)
	}

	public hideDependentEdges(node: CodeMapNode) {
		this.changeEdgesVisibility(false, node)
	}

	public hideAllEdges() {
		this.changeEdgesVisibility(false)
	}

	public amountOfDependentEdges(node: CodeMapNode) {
		return this.settingsService.getSettings().fileSettings.edges.filter(edge => this.edgeContainsNode(edge, node)).length
	}

	public amountOfVisibleDependentEdges(node: CodeMapNode) {
		return this.settingsService.getSettings().fileSettings.edges.filter(edge => this.edgeContainsNode(edge, node) && edge.visible).length
	}

	public isAnyEdgeVisible() {
		return this.settingsService.getSettings().fileSettings.edges.filter(edge => edge.visible).length > 0
	}

    public getParentMP(path: string, s: Settings): MarkedPackage {
        const sortedParentMP = s.fileSettings.markedPackages
            .filter(p => path.includes(p.path) && p.path !== path)
            .sort((a, b) => b.path.length - a.path.length);

        return sortedParentMP.length > 0 ? sortedParentMP[0] : null;
    }

    private getNewMarkedPackage(path: string, color: string): MarkedPackage {
        let coloredPackage: MarkedPackage = {
            path: path,
            color: color,
            attributes: {}
        };

        return coloredPackage;
    }

    private removeChildrenMPWithSameColor(newMP: MarkedPackage, s: Settings) {
        const allChildrenMP: MarkedPackage[] = this.getAllChildrenMP(newMP.path, s);
            allChildrenMP.forEach(childPackage => {
                const parentMP = this.getParentMP(childPackage.path, s);
                if (parentMP && parentMP.color === childPackage.color) {
                    this.removeMarkedPackage(childPackage, s);
                }
            });
    }

    private getAllChildrenMP(path: string, s: Settings): MarkedPackage[] {
        return s.fileSettings.markedPackages.filter(p =>
            p.path.includes(path) && p.path != path);
    }

    private addMarkedPackage(markedPackage: MarkedPackage, s: Settings) {
        s.fileSettings.markedPackages.push(markedPackage);
		this.settingsService.updateSettings({
			fileSettings: {
				markedPackages: s.fileSettings.markedPackages
			}
		});
    }

    private removeMarkedPackage(markedPackage: MarkedPackage, s: Settings) {
        const indexToRemove = s.fileSettings.markedPackages.indexOf(markedPackage);
        if (indexToRemove > -1) {
            s.fileSettings.markedPackages.splice(indexToRemove, 1);
        }
    }

	private changeEdgesVisibility(visibility: boolean, node: CodeMapNode = null) {
		let edges = this.settingsService.getSettings().fileSettings.edges
		if (edges) {
			edges.forEach(edge => {
				if (node === null || this.edgeContainsNode(edge, node)) {
					edge.visible = visibility
				}
			})
			this.settingsService.updateSettings({
				fileSettings: {
					edges: edges
				}
			})
		}
	}

	private edgeContainsNode(edge: Edge, node: CodeMapNode): boolean {
		return node.path == edge.fromNodeName || node.path == edge.toNodeName
	}

	private isEqualObjects(obj1, obj2): boolean {
		return JSON.stringify(angular.toJson(obj1)) === JSON.stringify(angular.toJson(obj2))
	}

	private autoFit() {
		this.threeOrbitControlsService.autoFitTo()
	}
}
