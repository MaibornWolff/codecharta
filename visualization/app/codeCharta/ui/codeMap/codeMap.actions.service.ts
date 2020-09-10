import { CodeMapNode, EdgeVisibility } from "../../codeCharta.model"
import { MarkedPackage } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setEdges } from "../../state/store/fileSettings/edges/edges.actions"
import { markPackage, unmarkPackage } from "../../state/store/fileSettings/markedPackages/markedPackages.actions"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"

export class CodeMapActionsService {
	constructor(private edgeMetricDataService: EdgeMetricDataService, private storeService: StoreService) {}

	public markFolder(node: CodeMapNode, color: string) {
		const newMP: MarkedPackage = this.getNewMarkedPackage(node.path, color)
		const clickedMP: MarkedPackage = this.storeService.getState().fileSettings.markedPackages.find(p => p.path === newMP.path)
		const parentMP: MarkedPackage = this.getParentMP(newMP.path)

		this.handleUpdatingMarkedPackages(newMP, clickedMP, parentMP)
	}

	private handleUpdatingMarkedPackages(newMP: MarkedPackage, clickedMP: MarkedPackage, parentMP: MarkedPackage): void {
		if (!clickedMP && this.packagesHaveDifferentColor(parentMP, newMP)) {
			this.addMarkedPackage(newMP)
		} else if (this.packagesHaveDifferentColor(clickedMP, newMP)) {
			this.removeMarkedPackage(clickedMP)

			if (this.packagesHaveDifferentColor(parentMP, newMP)) {
				this.addMarkedPackage(newMP)
			}
		}
		this.removeChildrenMPWithSameColor(newMP)
	}

	private packagesHaveDifferentColor(mp1: MarkedPackage, mp2: MarkedPackage): boolean {
		return !(mp1 && mp2 && mp1.color === mp2.color)
	}

	public unmarkFolder(node: CodeMapNode) {
		const clickedMP: MarkedPackage = this.storeService.getState().fileSettings.markedPackages.find(p => p.path === node.path)

		if (clickedMP) {
			this.removeMarkedPackage(clickedMP)
		} else {
			const parentMP: MarkedPackage = this.getParentMP(node.path)
			this.removeMarkedPackage(parentMP)
		}
	}

	public updateEdgePreviews() {
		const state = this.storeService.getState()
		const edges = state.fileSettings.edges
		const edgeMetric = state.dynamicSettings.edgeMetric
		const numberOfEdgesToDisplay = state.appSettings.amountOfEdgePreviews
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

		this.storeService.dispatch(setEdges(edges))
	}

	public getParentMP(path: string): MarkedPackage {
		const sortedParentMP = this.storeService
			.getState()
			.fileSettings.markedPackages.filter(p => path.includes(p.path) && p.path !== path)
			.sort((a, b) => b.path.length - a.path.length)

		return sortedParentMP.length > 0 ? sortedParentMP[0] : null
	}

	private getNewMarkedPackage(path: string, color: string): MarkedPackage {
		return {
			path,
			color
		}
	}

	private removeChildrenMPWithSameColor(newMP: MarkedPackage) {
		const allChildrenMP: MarkedPackage[] = this.getAllChildrenMP(newMP.path)
		allChildrenMP.forEach(childPackage => {
			const parentMP = this.getParentMP(childPackage.path)
			if (parentMP && parentMP.color === childPackage.color) {
				this.removeMarkedPackage(childPackage)
			}
		})
	}

	private getAllChildrenMP(path: string): MarkedPackage[] {
		return this.storeService.getState().fileSettings.markedPackages.filter(p => p.path.includes(path) && p.path != path)
	}

	private addMarkedPackage(markedPackage: MarkedPackage) {
		this.storeService.getState().fileSettings.markedPackages.push(markedPackage)
		this.storeService.dispatch(markPackage(markedPackage))
	}

	private removeMarkedPackage(markedPackage: MarkedPackage) {
		const indexToRemove = this.storeService.getState().fileSettings.markedPackages.indexOf(markedPackage)
		if (indexToRemove > -1) {
			this.storeService.getState().fileSettings.markedPackages.splice(indexToRemove, 1)
		}
		this.storeService.dispatch(unmarkPackage(markedPackage))
	}
}
