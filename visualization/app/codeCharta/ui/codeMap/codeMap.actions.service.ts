import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapNode, BlacklistType, BlacklistItem, EdgeVisibility } from "../../codeCharta.model"
import { CodeChartaService } from "../../codeCharta.service"
import { MarkedPackage, Settings } from "../../codeCharta.model"
import angular from "angular"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"
import { StoreService } from "../../state/store.service"
import { addBlacklistItem, removeBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { focusNode, unfocusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { setEdges } from "../../state/store/fileSettings/edges/edges.actions"
import { markPackage, unmarkPackage } from "../../state/store/fileSettings/markedPackages/markedPackages.actions"

export class CodeMapActionsService {
	constructor(
		private settingsService: SettingsService,
		private edgeMetricDataService: EdgeMetricDataService,
		private storeService: StoreService
	) {}

	public toggleNodeVisibility(node: CodeMapNode) {
		if (node.visible) {
			this.flattenNode(node)
		} else {
			this.showNode(node)
		}
	}

	public markFolder(node: CodeMapNode, color: string) {
		let s = this.settingsService.getSettings()
		const newMP: MarkedPackage = this.getNewMarkedPackage(node.path, color)
		const clickedMP: MarkedPackage = s.fileSettings.markedPackages.find(p => p.path === newMP.path)
		const parentMP: MarkedPackage = this.getParentMP(newMP.path, s)

		this.handleUpdatingMarkedPackages(s, newMP, clickedMP, parentMP)
		// this settings update is dispatched in the store using separate actions inside handleUpdatingMarkedPackages
		this.settingsService.updateSettings({
			fileSettings: {
				markedPackages: s.fileSettings.markedPackages
			}
		})
	}

	private handleUpdatingMarkedPackages(s: Settings, newMP: MarkedPackage, clickedMP: MarkedPackage, parentMP: MarkedPackage): void {
		if (!clickedMP && this.packagesHaveDifferentColor(parentMP, newMP)) {
			this.addMarkedPackage(newMP, s)
		} else if (this.packagesHaveDifferentColor(clickedMP, newMP)) {
			this.removeMarkedPackage(clickedMP, s)

			if (this.packagesHaveDifferentColor(parentMP, newMP)) {
				this.addMarkedPackage(newMP, s)
			}
		}
		this.removeChildrenMPWithSameColor(newMP, s)
	}

	private packagesHaveDifferentColor(mp1: MarkedPackage, mp2: MarkedPackage): boolean {
		return !(mp1 && mp2 && mp1.color === mp2.color)
	}

	public unmarkFolder(node: CodeMapNode) {
		let s = this.settingsService.getSettings()
		let clickedMP: MarkedPackage = s.fileSettings.markedPackages.find(p => p.path === node.path)

		if (clickedMP) {
			this.removeMarkedPackage(clickedMP, s)
		} else {
			const parentMP: MarkedPackage = this.getParentMP(node.path, s)
			this.removeMarkedPackage(parentMP, s)
		}
		// this settings update is dispatched in the store separately using the unmark action
		this.settingsService.updateSettings({
			fileSettings: {
				markedPackages: s.fileSettings.markedPackages
			}
		})
	}

	public flattenNode(node: CodeMapNode) {
		this.pushItemToBlacklist({ path: node.path, type: BlacklistType.flatten })
	}

	public showNode(node: CodeMapNode) {
		this.removeBlacklistEntry({ path: node.path, type: BlacklistType.flatten })
	}

	public focusNode(node: CodeMapNode) {
		if (node.path === CodeChartaService.ROOT_PATH) {
			this.removeFocusedNode()
		} else {
			this.settingsService.updateSettings({ dynamicSettings: { focusedNodePath: node.path } })
			this.storeService.dispatch(focusNode(node.path))
		}
	}

	public removeFocusedNode() {
		this.settingsService.updateSettings({ dynamicSettings: { focusedNodePath: "" } })
		this.storeService.dispatch(unfocusNode())
	}

	public excludeNode(node: CodeMapNode) {
		this.pushItemToBlacklist({ path: node.path, type: BlacklistType.exclude })
	}

	public removeBlacklistEntry(entry: BlacklistItem) {
		this.storeService.dispatch(removeBlacklistItem(entry))
	}

	public pushItemToBlacklist(item: BlacklistItem) {
		const foundDuplicate = this.storeService.getState().fileSettings.blacklist.filter(obj => {
			return this.isEqualObjects(obj, item)
		})
		if (foundDuplicate.length === 0) {
			this.storeService.dispatch(addBlacklistItem(item))
		}
	}

	public updateEdgePreviews() {
		const settings = this.settingsService.getSettings()
		const edges = settings.fileSettings.edges
		const edgeMetric = settings.dynamicSettings.edgeMetric
		const numberOfEdgesToDisplay = settings.appSettings.amountOfEdgePreviews
		const edgePreviewNodes = this.edgeMetricDataService.getNodesWithHighestValue(edgeMetric, numberOfEdgesToDisplay)

		edges.forEach(edge => {
			if (
				(edgePreviewNodes.includes(edge.fromNodeName) || edgePreviewNodes.includes(edge.toNodeName)) &&
				Object.keys(edge.attributes).includes(edgeMetric)
			) {
				edge.visible = EdgeVisibility.both
				if (!edgePreviewNodes.includes(edge.fromNodeName)) {
					edge.visible = EdgeVisibility.to
				} else if (!edgePreviewNodes.includes(edge.toNodeName)) {
					edge.visible = EdgeVisibility.from
				}
			} else {
				edge.visible = EdgeVisibility.none
			}
		})

		this.settingsService.updateSettings({
			fileSettings: {
				edges: edges
			}
		})
		this.storeService.dispatch(setEdges(edges))
	}

	public getParentMP(path: string, s: Settings): MarkedPackage {
		const sortedParentMP = s.fileSettings.markedPackages
			.filter(p => path.includes(p.path) && p.path !== path)
			.sort((a, b) => b.path.length - a.path.length)

		return sortedParentMP.length > 0 ? sortedParentMP[0] : null
	}

	private getNewMarkedPackage(path: string, color: string): MarkedPackage {
		let coloredPackage: MarkedPackage = {
			path: path,
			color: color,
			attributes: {}
		}

		return coloredPackage
	}

	private removeChildrenMPWithSameColor(newMP: MarkedPackage, s: Settings) {
		const allChildrenMP: MarkedPackage[] = this.getAllChildrenMP(newMP.path, s)
		allChildrenMP.forEach(childPackage => {
			const parentMP = this.getParentMP(childPackage.path, s)
			if (parentMP && parentMP.color === childPackage.color) {
				this.removeMarkedPackage(childPackage, s)
			}
		})
	}

	private getAllChildrenMP(path: string, s: Settings): MarkedPackage[] {
		return s.fileSettings.markedPackages.filter(p => p.path.includes(path) && p.path != path)
	}

	private addMarkedPackage(markedPackage: MarkedPackage, s: Settings) {
		s.fileSettings.markedPackages.push(markedPackage)
		this.settingsService.updateSettings({
			fileSettings: {
				markedPackages: s.fileSettings.markedPackages
			}
		})
		this.storeService.dispatch(markPackage(markedPackage))
	}

	private removeMarkedPackage(markedPackage: MarkedPackage, s: Settings) {
		const indexToRemove = s.fileSettings.markedPackages.indexOf(markedPackage)
		if (indexToRemove > -1) {
			s.fileSettings.markedPackages.splice(indexToRemove, 1)
		}
		this.storeService.dispatch(unmarkPackage(markedPackage))
	}

	private isEqualObjects(obj1, obj2): boolean {
		return JSON.stringify(angular.toJson(obj1)) === JSON.stringify(angular.toJson(obj2))
	}
}
