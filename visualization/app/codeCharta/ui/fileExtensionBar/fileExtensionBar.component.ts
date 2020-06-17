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

	public onRenderMapChanged(map: CodeMapNode) {
		this.setNewDistribution(map)
		this.setColorForEachExtension()
		this.potentiallyAddNoneExtension()
	}

	public onHoverFileExtensionBar(hoveredExtension: string) {
		const buildings = this.threeSceneService
			.getMapMesh()
			.getMeshDescription()
			.buildings.filter(building => building.node.isLeaf)

		const visibleFileExtensions: string[] = this._viewModel.distribution
			.filter(metric => metric.fileExtension !== "other")
			.map(metric => metric.fileExtension)

		buildings.forEach(building => {
			const buildingExtension = FileExtensionCalculator.estimateFileExtension(building.node.name)
			if (
				buildingExtension === hoveredExtension ||
				(hoveredExtension === "other" && !visibleFileExtensions.includes(buildingExtension))
			) {
				this.threeSceneService.addBuildingToHighlightingList(building)
			}
		})
		this.threeSceneService.highlightBuildings()
	}

	public onUnhoverFileExtensionBar() {
		this.threeSceneService.clearHighlight()
	}

	public toggleExtensiveMode() {
		this._viewModel.isExtensiveMode = !this._viewModel.isExtensiveMode
	}

	public togglePercentageAbsoluteValues() {
		this._viewModel.isAbsoluteValueVisible = !this._viewModel.isAbsoluteValueVisible
	}

	private setNewDistribution(map: CodeMapNode) {
		const distributionMetric = this.storeService.getState().dynamicSettings.distributionMetric
		this._viewModel.distribution = FileExtensionCalculator.getMetricDistribution(map, distributionMetric)
	}

	private setColorForEachExtension() {
		this._viewModel.distribution.forEach(x => {
			x.color = x.color ? x.color : FileExtensionCalculator.numberToHsl(FileExtensionCalculator.hashCode(x.fileExtension)).toString()
		})
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
