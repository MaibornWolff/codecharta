import { FileValidator } from "./core/data/FileValidator"
import {
	CCFile,
	MetricData,
	ColorRange,
} from "./codeCharta.model"
import { NameDataPair } from "./util/urlUtils"
import { SettingsService } from "./state/settings.service"
import { IRootScopeService } from "angular"
import { MetricCalculator } from "./MetricCalculator"
import { FileStateService } from "./state/fileState.service";

export interface ImportedFilesChangedSubscriber {
	onImportedFilesChanged(importedFiles: CCFile[], metrics: string[], metricData: MetricData[])
}

export class CodeChartaService {

	public static ROOT_NAME = "root"
	public static ROOT_PATH =  "/" + CodeChartaService.ROOT_NAME
	private static IMPORTED_FILES_CHANGED_EVENT = "imported-files-changed";

	public metrics: string[] = []
	public metricData: MetricData[] = []

	//private importedScenarios: Scenario[]
	//private urlData: UrlData

	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		//private urlService: UrlUtils,
		//private dataDecoratorService: CodeMapNodeDecoratorService,
		//private deltaCalculatorService: DeltaCalculatorService,
		private fileStateService: FileStateService
	) {
	}

	public resetMaps(): any {
		throw new Error("Method not implemented.")
	}

	public getImportedFiles(): CCFile[] {
		return this.fileStateService.getCCFiles()
	}

	public getMetrics(): string[] {
		return this.metrics
	}

	private getAdaptedRange(colorMetric: string, flipped: boolean): ColorRange {
		const maxMetricValue = MetricCalculator.getMaxMetricInAllRevisions(this.fileStateService.getCCFiles(), colorMetric)
		const firstThird = Math.round((maxMetricValue / 3) * 100) / 100
		const secondThird = Math.round(firstThird * 2 * 100) / 100

		return {
			flipped: flipped,
			from: firstThird,
			to: secondThird
		}
	}

	public loadFiles(nameDataPairs: NameDataPair[]): Promise<void> {
		return new Promise((resolve, reject) => {
			nameDataPairs.forEach((nameDataPair) => {
				const errors = FileValidator.validate(nameDataPair.data as any)
				if (errors.length === 0) {
					const ccFile = this.getCCFile(nameDataPair.name, nameDataPair.data)
					this.fileStateService.addFile(ccFile)
				} else {
					reject(errors)
				}
			})

			this.saveMetricsFromAllMaps()

			/*this.settingsService.updateSettings({
				dynamicSettings: {
					areaMetric: this.getMetricByIndexElseLast(0, this.metrics),
					heightMetric: this.getMetricByIndexElseLast(1, this.metrics),
					colorMetric: this.getMetricByIndexElseLast(2, this.metrics),
					neutralColorRange: this.getAdaptedRange(this.getMetricByIndexElseLast(2, this.metrics), false)
				}
			})*/

			// TODO #136
			//if(applyScenarioOnce) {
			//    this.scenarioService.applyScenarioOnce(this.scenarioService.getDefaultScenario());
			//} else {
			//    this.scenarioService.applyScenario(this.scenarioService.getDefaultScenario());
			//}

			this.fileStateService.setSingle(this.fileStateService.getCCFiles()[0])
			this.settingsService.updateSettings(this.settingsService.getDefaultSettings())

			// TODO this.settingsService.updateSettingsFromUrl();
			resolve()
		})
	}

	private saveMetricsFromAllMaps() {
		const metricResult = MetricCalculator.calculateMetrics(this.fileStateService.getCCFiles())
		this.metrics = metricResult.metrics
		this.metricData = metricResult.data
	}


	private getCCFile(fileName: string, fileContent: any): CCFile {
		return {
			fileMeta: {
				fileName: fileName,
				projectName: fileContent.projectName,
				apiVersion: fileContent.apiVersion
			},
			settings: {
				fileSettings: {
					edges: fileContent.edges || [],
					attributeTypes: fileContent.attributeTypes || {},
					blacklist: fileContent.blacklist || [],
				}
			},
			map: fileContent.nodes[0]
		}
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: ImportedFilesChangedSubscriber) {
		$rootScope.$on(CodeChartaService.IMPORTED_FILES_CHANGED_EVENT, (event, data) => {
			subscriber.onImportedFilesChanged(data.files, data.metrics, data.metricData)
		})
	}

	/*public setComparisonMap(index: number) {
		if (this.files[index] != null) {
			this._lastComparisonMap = this.files[index].map
			this.processDeltas()
			//this.dataDecoratorService.decorateMapWithCompactMiddlePackages(this.files[index])
			this.callOthers()
		}
	}

	public setReferenceMap(index: number) {
		if (this.files[index] != null) {
			this._lastReferenceIndex = index
			this.renderMap = this.files[index].map
			this.processDeltas()
			//this.dataDecoratorService.decorateMapWithCompactMiddlePackages(this.files[index])
			this.callOthers()
		}
	}

	public onActivateDeltas() {
		if (!this._deltasEnabled) {
			this._deltasEnabled = true
			this.setComparisonMap(this._lastReferenceIndex)
		}
	}

	public onDeactivateDeltas() {
		if (this._deltasEnabled) {
			this._deltasEnabled = false
			this.setComparisonMap(this._lastReferenceIndex)
		}
	}

	private callOthers() {

		// TODO remove event completely
		this.$rootScope.$broadcast(CodeChartaService.IMPORTED_FILES_CHANGED_EVENT, {
			files: this.fileStateService.getCCFiles(),
			metrics: this.metrics,
			metricData: this.metricData
		})

		// TODO: somewhere else, maybe metricChooser?
		const mapSettings = this.settingsService.getSettings().dynamicSettings
		const settingsUpdate: RecursivePartial<Settings> = {
			dynamicSettings: {
				// TODO blacklist: this.renderMap.blacklist
				areaMetric: mapSettings.areaMetric,
				heightMetric: mapSettings.heightMetric,
				colorMetric: mapSettings.colorMetric
			}
		}

		if (this.isMetricNotAvailable(mapSettings.areaMetric)) {
			settingsUpdate.dynamicSettings.areaMetric = this.getMetricByIndexElseLast(0, this.metrics)
		}

		if (this.isMetricNotAvailable(mapSettings.heightMetric)) {
			settingsUpdate.dynamicSettings.heightMetric = this.getMetricByIndexElseLast(1, this.metrics)
		}

		if (this.isMetricNotAvailable(mapSettings.colorMetric)) {
			settingsUpdate.dynamicSettings.colorMetric = this.getMetricByIndexElseLast(2, this.metrics)
		}

		this.settingsService.updateSettings(settingsUpdate)
	}

	private getMetricByIndexElseLast(index: number, metrics: string[]): string {
		return metrics[Math.min(index, metrics.length - 1)]
	}

	private isMetricNotAvailable(metric: string) {
		return this.metrics.indexOf(metric) === -1
	}

	private processDeltas() {
		if (this.renderMap) {
			this.deltaCalculatorService.removeCrossOriginNodes(this.renderMap)
		}
		if (this._deltasEnabled && this.renderMap && this._lastComparisonMap) {
			this.deltaCalculatorService.provideDeltas(this.renderMap, this._lastComparisonMap, this.metrics)
		}
	} */
}
