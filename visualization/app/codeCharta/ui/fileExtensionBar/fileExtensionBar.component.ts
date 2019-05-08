import "./fileExtensionBar.component.scss"
import {SettingsService} from "../../state/settings.service";
import {ExtensionAttribute, FileExtensionCalculator, MetricDistribution} from "../../util/fileExtensionCalculator";
import {CCFile, CodeMapNode, DynamicSettings, KeyValuePair} from "../../codeCharta.model";
import {CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber} from "../codeMap/codeMap.preRender.service";
import {IRootScopeService} from "angular";



export class FileExtensionBarController implements CodeMapPreRenderServiceSubscriber {

	private _viewModel: {
		distribution: ExtensionAttribute[]
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
		const distribution: MetricDistribution[] = FileExtensionCalculator.getRelativeFileExtensionDistribution(map, metrics)
		this._viewModel.distribution = distribution
			.find(x => x.metric === s.areaMetric).distribution
			.map(x => {
				return {
					fileExtension: x.fileExtension,
					relativeMetricValue: x.relativeMetricValue,
					absoluteMetricValue: x.absoluteMetricValue,
					color: this.getColorFromFileExtension(x.fileExtension)
				}
			})

		console.log(this._viewModel.distribution)
	}

	private getColorFromFileExtension(fileExtension: string): string {
		return this.numberToRGB(this.hashCode(fileExtension))
	}

	private hashCode(str): number {
		let hash: number = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		return hash;
	}

	private numberToRGB(hashCode: number): string {
		const c = hashCode.toString(16).toUpperCase();
		return "#" + "00000".substring(0, 6 - c.length) + c;
	}
}

export const fileExtensionBarComponent = {
	selector: "fileExtensionBarComponent",
	template: require("./fileExtensionBar.component.html"),
	controller: FileExtensionBarController
}
