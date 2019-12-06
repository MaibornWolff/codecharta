import "./fileExtensionBar.component.scss"
import { SettingsService } from "../../state/settingsService/settings.service"
import { MetricDistribution, FileExtensionCalculator } from "../../util/fileExtensionCalculator"
import { CodeMapNode } from "../../codeCharta.model"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"
import { IRootScopeService } from "angular"
import { HSL } from "../../util/color/hsl"
import { StoreService } from "../../state/store.service"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"

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
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private storeService: StoreService,
		private threeSceneService: ThreeSceneService
	) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	public onRenderMapChanged(map: CodeMapNode) {
		this.setNewDistribution(map)
		this.setColorForEachExtension()
		this.potentiallyAddNoneExtension()
	}

	public highlightBarHoveredBuildings(extension: string) {
		const buildings = this.threeSceneService
			.getMapMesh()
			.getMeshDescription()
			.buildings.filter(building => building.node.isLeaf)
		if (extension === "other") {
			this.highlightBuildingsSummarizedInOtherDistribution(buildings)
		} else {
			buildings.forEach(building => {
				if (FileExtensionCalculator.estimateFileExtension(building.node.name) === extension) {
					this.threeSceneService.addBuildingToHighlightingList(building)
				}
			})
		}

		this.threeSceneService.highlightBuildings()
	}

	private highlightBuildingsSummarizedInOtherDistribution(mapBuildings: CodeMapBuilding[]) {
		const visibleDistributionEndings: string[] = this._viewModel.distribution
			.filter(metric => metric.fileExtension !== "other")
			.map(metric => metric.fileExtension)

		mapBuildings.forEach(building => {
			if (!visibleDistributionEndings.includes(FileExtensionCalculator.estimateFileExtension(building.node.name))) {
				this.threeSceneService.addBuildingToHighlightingList(building)
			}
		})
	}

	public clearHighlightedBarHoveredBuildings() {
		this.threeSceneService.clearHighlight()
	}

	public toggleExtensiveMode() {
		this._viewModel.isExtensiveMode = !this._viewModel.isExtensiveMode
	}

	public togglePercentageAbsoluteValues() {
		this._viewModel.isAbsoluteValueVisible = !this._viewModel.isAbsoluteValueVisible
	}

	private setNewDistribution(map: CodeMapNode) {
		const distributionMetric = this.settingsService.getSettings().dynamicSettings.distributionMetric
		const blacklist = this.storeService.getState().fileSettings.blacklist
		this._viewModel.distribution = FileExtensionCalculator.getMetricDistribution(map, distributionMetric, blacklist)
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
