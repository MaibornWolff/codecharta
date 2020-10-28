import { CodeMapNode, EdgeVisibility, MarkedPackage } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setEdges } from "../../state/store/fileSettings/edges/edges.actions"
import { unmarkPackage, setMarkedPackages } from "../../state/store/fileSettings/markedPackages/markedPackages.actions"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"
import { getParent } from "../../util/nodePathHelper"

export class CodeMapActionsService {
	constructor(private edgeMetricDataService: EdgeMetricDataService, private storeService: StoreService) {}

	markFolder({ path }: CodeMapNode, color: string) {
		const { markedPackages } = this.storeService.getState().fileSettings
		const markedPackagesMap = new Map(markedPackages.map(entry => [entry.path, entry]))

		const markedPackage = getParent(markedPackagesMap, path)

		if (!markedPackage || markedPackage.color !== color) {
			markedPackagesMap.set(path, {
				path,
				color
			})
		}

		for (const [key, markedPackage] of markedPackagesMap) {
			if (markedPackage.path === path) {
				if (markedPackage.color !== color) {
					markedPackagesMap.delete(key)
				}
			} else if (markedPackage.path.startsWith(path)) {
				// Remove marked packages with color identical to their parent marked package
				const markedPackageParent = getParent(markedPackagesMap, markedPackage.path)
				if (markedPackageParent && markedPackageParent.color === markedPackage.color) {
					markedPackagesMap.delete(key)
				}
			}
		}

		this.storeService.dispatch(setMarkedPackages([...markedPackagesMap.values()]))
	}

	unmarkFolder(node: CodeMapNode) {
		let index = this.storeService.getState().fileSettings.markedPackages.findIndex(mp => mp.path === node.path)

		if (index === -1) {
			index = this.getParentMarkedPackageIndex(node.path)
		}

		if (index !== -1) {
			this.storeService.dispatch(unmarkPackage(index))
		}
	}

	updateEdgePreviews() {
		const state = this.storeService.getState()
		const { edges } = state.fileSettings
		const { edgeMetric } = state.dynamicSettings
		const numberOfEdgesToDisplay = state.appSettings.amountOfEdgePreviews
		const edgePreviewNodes = new Set(this.edgeMetricDataService.getNodesWithHighestValue(edgeMetric, numberOfEdgesToDisplay))

		for (const edge of edges) {
			edge.visible = EdgeVisibility.none

			if (edge.attributes[edgeMetric] !== undefined) {
				const hasFromNodeEdgePreview = edgePreviewNodes.has(edge.fromNodeName)
				const hasToNodeEdgePreview = edgePreviewNodes.has(edge.toNodeName)

				if (hasFromNodeEdgePreview === hasToNodeEdgePreview) {
					if (hasFromNodeEdgePreview) {
						edge.visible = EdgeVisibility.both
					}
				} else if (hasFromNodeEdgePreview) {
					edge.visible = EdgeVisibility.from
				} else {
					edge.visible = EdgeVisibility.to
				}
			}
		}

		this.storeService.dispatch(setEdges(edges))
	}

	getParentMarkedPackageIndex(path: string) {
		const markedPackages: MarkedPackage[] = this.storeService.getState().fileSettings.markedPackages
		let index = -1
		for (let loopIndex = 0; loopIndex < markedPackages.length; loopIndex++) {
			const markedPackage = markedPackages[loopIndex]
			if (
				path.startsWith(markedPackage.path) &&
				path !== markedPackage.path &&
				(index === -1 || markedPackages[index].path.length < markedPackage.path.length)
			) {
				index = loopIndex
			}
		}

		return index
	}
}
