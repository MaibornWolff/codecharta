import "./fileExtensionBar.component.scss"
import {SettingsService} from "../../state/settings.service";
import {Distribution, FileExtensionCalculator, FileExtensionDistribution} from "../../util/fileExtensionCalculator";
import {CCFile, CodeMapNode, DynamicSettings, KeyValuePair} from "../../codeCharta.model";
import {CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber} from "../codeMap/codeMap.preRender.service";
import {IRootScopeService} from "angular";



export class FileExtensionBarController implements CodeMapPreRenderServiceSubscriber {

	private _viewModel: {
		distribution: Distribution[]
	} = {
		distribution: []
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService
) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	public onRenderFileChanged(renderFile: CCFile, event: angular.IAngularEvent) {
		this.updateFileExtensionBar(renderFile.map)
	}

	public updateFileExtensionBar(map: CodeMapNode) {
		const s: DynamicSettings = this.settingsService.getSettings().dynamicSettings
		const metrics: string[] = [s.areaMetric]
		const distribution: FileExtensionDistribution[] = FileExtensionCalculator.getFileExtensionDistribution(map, metrics)
		const absoluteAreaDistribution: Distribution[] = distribution
			.find(x => x.metric === s.areaMetric).distribution
			.sort((a,b) => b.metricValue - a.metricValue)

		const sumOfAllMetricValues: number = absoluteAreaDistribution
			.map(x => x.metricValue)
			.reduce((partialSum, a) => partialSum + a)

		this._viewModel.distribution = absoluteAreaDistribution
			.map((x: Distribution) => {
				return {
					fileExtension: x.fileExtension,
					metricValue: (x.metricValue / sumOfAllMetricValues) * 100,
					color: this.getColorFromFileExtension(x.fileExtension)
				}
			})
	}

	private getColorFromFileExtension(fileExtension: string): string {
		return null
	}
}

export const fileExtensionBarComponent = {
	selector: "fileExtensionBarComponent",
	template: require("./fileExtensionBar.component.html"),
	controller: FileExtensionBarController
}
