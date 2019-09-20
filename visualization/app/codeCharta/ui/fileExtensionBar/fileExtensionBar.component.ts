import "./fileExtensionBar.component.scss"
import { SettingsService } from "../../state/settingsService/settings.service"
import { MetricDistribution, FileExtensionCalculator } from "../../util/fileExtensionCalculator"
import { CodeMapNode } from "../../codeCharta.model"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"
import { IRootScopeService } from "angular"

export class FileExtensionBarController implements CodeMapPreRenderServiceSubscriber {
	private _viewModel: {
		distribution: MetricDistribution[]
		isExtensiveMode: boolean
	} = {
		distribution: [],
		isExtensiveMode: false
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private settingsService: SettingsService) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	public onRenderMapChanged(map: CodeMapNode) {
		this.setNewDistribution(map)
		this.setColorForEachExtension()
		this.potentiallyAddNoneExtension()
	}

	public toggleExtensiveMode() {
		this._viewModel.isExtensiveMode = !this._viewModel.isExtensiveMode
	}

	private setNewDistribution(map: CodeMapNode) {
		const distributionMetric: string = this.settingsService.getSettings().dynamicSettings.distributionMetric
		this._viewModel.distribution = FileExtensionCalculator.getMetricDistribution(map, distributionMetric)
	}

	private setColorForEachExtension() {
		this._viewModel.distribution.forEach(x => {
			x.color = x.color ? x.color : this.numberToHsl(this.hashCode(x.fileExtension))
		})
	}

	private potentiallyAddNoneExtension() {
		if (this._viewModel.distribution.length === 0) {
			this._viewModel.distribution.push(this.getNoneExtension())
		}
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
		return "hsl(" + shortened + ", 40%, 50%)"
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
