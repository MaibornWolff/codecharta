import "./fileExtensionBar.component.scss"
import { SettingsService } from "../../state/settings.service"
import { MetricDistribution, FileExtensionCalculator } from "../../util/fileExtensionCalculator"
import { CCFile, CodeMapNode } from "../../codeCharta.model"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"
import { IRootScopeService } from "angular"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapRenderService } from "../codeMap/codeMap.render.service"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"

export class FileExtensionBarController implements CodeMapPreRenderServiceSubscriber {
	private _viewModel: {
		distribution: MetricDistribution[]
		isExtensiveMode: boolean
	} = {
		distribution: [],
		isExtensiveMode: false
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private codeMapRenderService: CodeMapRenderService,
		private threeSceneService: ThreeSceneService
	) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	public onRenderFileChanged(renderFile: CCFile, event: angular.IAngularEvent) {
		this.updateFileExtensionBar(renderFile.map)
	}

	public highlightBarHoveredBuildings(extension: string) {
		let buildings: CodeMapBuilding[] = this.codeMapRenderService.mapMesh.getMeshDescription().buildings
		let toHighlightBuilding: CodeMapBuilding[] = []
		buildings.forEach(x => {
			if (FileExtensionCalculator.estimateFileExtension(x.node.name) === extension) {
				toHighlightBuilding.push(x)
			}
		})

		this.threeSceneService.getMapMesh().setHighlighted(toHighlightBuilding)
	}

	public clearHighlightedBarHoveredBuildings() {
		this.threeSceneService.getMapMesh().clearHighlight()
	}

	public toggleExtensiveMode() {
		this._viewModel.isExtensiveMode = !this._viewModel.isExtensiveMode
	}

	private updateFileExtensionBar(map: CodeMapNode) {
		const distributionMetric: string = this.settingsService.getSettings().dynamicSettings.distributionMetric
		const distribution: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, distributionMetric)

		distribution.forEach(x => {
			x.color = x.color ? x.color : this.numberToHsl(this.hashCode(x.fileExtension))
		})

		if (distribution.length === 0) {
			distribution.push(this.getNoneExtension())
		}
		this._viewModel.distribution = distribution
	}

	private hashCode(fileExtension: string): number {
		let hash: number = 0
		for (let i = 0; i < fileExtension.length; i++) {
			hash = fileExtension.charCodeAt(i) + ((hash << 5) - hash)
		}
		return hash
	}

	private numberToHsl(hashCode: number): string {
		let shortened = hashCode % 360
		return "hsla(" + shortened + ", 40%, 50%)"
	}

	private getNoneExtension(): MetricDistribution {
		return {
			fileExtension: "none",
			absoluteMetricValue: null,
			relativeMetricValue: 100,
			color: "#000000"
		}
	}
}

export const fileExtensionBarComponent = {
	selector: "fileExtensionBarComponent",
	template: require("./fileExtensionBar.component.html"),
	controller: FileExtensionBarController
}
