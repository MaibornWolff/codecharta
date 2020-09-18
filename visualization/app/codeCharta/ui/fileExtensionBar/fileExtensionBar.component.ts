import "./fileExtensionBar.component.scss"
import { MetricDistribution, FileExtensionCalculator } from "../../util/fileExtensionCalculator"
import { CodeMapNode } from "../../codeCharta.model"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"

export class FileExtensionBarController implements CodeMapPreRenderServiceSubscriber {
	private _viewModel: {
		distribution: MetricDistribution[]
		isExtensiveMode: boolean
		isAbsoluteValueVisible: boolean
	} = {
		distribution: [],
		isExtensiveMode: false,
		isAbsoluteValueVisible: false
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService, private threeSceneService: ThreeSceneService) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	onRenderMapChanged(map: CodeMapNode) {
		this.setNewDistribution(map)
		this.setColorForEachExtension()
		this.potentiallyAddNoneExtension()
	}

	onHoverFileExtensionBar(hoveredExtension: string) {
		const { buildings } = this.threeSceneService.getMapMesh().getMeshDescription()

		const visibleFileExtensions = new Set()
		for (const metric of this._viewModel.distribution) {
			if (metric.fileExtension !== "other") {
				visibleFileExtensions.add(metric.fileExtension)
			}
		}

		for (const building of buildings) {
			if (building.node.isLeaf) {
				const buildingExtension = FileExtensionCalculator.estimateFileExtension(building.node.name)
				if (
					buildingExtension === hoveredExtension ||
					(hoveredExtension === "other" && !visibleFileExtensions.has(buildingExtension))
				) {
					this.threeSceneService.addBuildingToHighlightingList(building)
				}
			}
		}

		this.threeSceneService.highlightBuildings()
	}

	onUnhoverFileExtensionBar() {
		this.threeSceneService.clearHighlight()
	}

	toggleExtensiveMode() {
		this._viewModel.isExtensiveMode = !this._viewModel.isExtensiveMode
	}

	togglePercentageAbsoluteValues() {
		this._viewModel.isAbsoluteValueVisible = !this._viewModel.isAbsoluteValueVisible
	}

	private setNewDistribution(map: CodeMapNode) {
		const { distributionMetric } = this.storeService.getState().dynamicSettings
		this._viewModel.distribution = FileExtensionCalculator.getMetricDistribution(map, distributionMetric)
	}

	private setColorForEachExtension() {
		for (const metric of this._viewModel.distribution) {
			metric.color = metric.color ?? FileExtensionCalculator.numberToHsl(FileExtensionCalculator.hashCode(metric.fileExtension)).toString()
		}
	}

	private potentiallyAddNoneExtension() {
		if (this._viewModel.distribution.length === 0) {
			this._viewModel.distribution.push(FileExtensionCalculator.getNoneExtension())
		}
	}
}

export const fileExtensionBarComponent = {
	selector: "fileExtensionBarComponent",
	template: require("./fileExtensionBar.component.html"),
	controller: FileExtensionBarController
}
