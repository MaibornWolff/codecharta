import "./fileExtensionBar.component.scss"
import { SettingsService } from "../../state/settings.service"
import { ExtensionAttribute, FileExtensionCalculator, MetricDistributionPair } from "../../util/fileExtensionCalculator"
import { CCFile, DynamicSettings } from "../../codeCharta.model"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"
import { IRootScopeService } from "angular"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapRenderService } from "../codeMap/codeMap.render.service"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"

export class FileExtensionBarController implements CodeMapPreRenderServiceSubscriber {
	private _viewModel: {
		distribution: ExtensionAttribute[]
	} = {
		distribution: []
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private codeMapPreRenderService: CodeMapPreRenderService,
		private codeMapRenderService: CodeMapRenderService,
		private threeSceneService: ThreeSceneService
	) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	public onRenderFileChanged(renderFile: CCFile, event: angular.IAngularEvent) {
		this.updateFileExtensionBar()
	}

	// SUCHE HIER EINE MÖGLICHKEIT DAS ENTSPRECHENDE GEBÄUDE ZU MARKIEREN!!!
	public highlightBarHoveredBuildings(extension: string) {
		let buildings: CodeMapBuilding[] = this.codeMapRenderService.mapMesh.getMeshDescription().buildings
		let toHighlightBuilding: CodeMapBuilding[] = []
		let counter = 0
		// d3 und hierarchy wurden importiert richtig so??

		buildings.forEach(x => {
			if (FileExtensionCalculator.estimateFileExtension(x.node.name) === extension) {
				counter += 1
				toHighlightBuilding.push(x)
			}
		})

		this.threeSceneService.getMapMesh().setHighlighted(toHighlightBuilding)
	}

	public hoverIn(extension: string) {
		this.highlightBarHoveredBuildings(extension)
	}

	public hoverOut() {
		this.threeSceneService.getMapMesh().clearHighlight()
	}

	private updateFileExtensionBar() {
		const s: DynamicSettings = this.settingsService.getSettings().dynamicSettings
		const metrics: string[] = [s.distributionMetric]
		const distribution: MetricDistributionPair = FileExtensionCalculator.getRelativeFileExtensionDistribution(
			this.codeMapPreRenderService.getRenderFile().map,
			metrics
		)
		const otherExtension: ExtensionAttribute = {
			fileExtension: "other",
			absoluteMetricValue: null,
			relativeMetricValue: 0,
			color: "#676867"
		}
		const visibleExtensions: ExtensionAttribute[] = []
		distribution[s.distributionMetric].forEach(x => {
			if (x.relativeMetricValue < 5) {
				otherExtension.relativeMetricValue += x.relativeMetricValue
			} else {
				x.color = this.numberToHsl(this.hashCode(x.fileExtension))
				visibleExtensions.push(x)
			}
		})
		if (otherExtension.relativeMetricValue > 0) {
			visibleExtensions.push(otherExtension)
		}
		this._viewModel.distribution = visibleExtensions
	}

	private hashCode(str): number {
		let hash: number = 0
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash)
		}
		return hash
	}

	private numberToHsl(hashCode: number): string {
		let shortened = hashCode % 360
		return "hsla(" + shortened + ", 40%, 50%)"
	}
}

export const fileExtensionBarComponent = {
	selector: "fileExtensionBarComponent",
	template: require("./fileExtensionBar.component.html"),
	controller: FileExtensionBarController
}
