import { FileValidator } from "./core/data/FileValidator"
import { CCFile, MetricData, RecursivePartial, Settings, RenderMode, ColorRange, CodeMapNode } from "./codeCharta.model"
import { DataDecoratorService } from "./core/data/data.decorator.service"
import { NameDataPair } from "./core/url/url.service"
import { SettingsService, SettingsServiceSubscriber } from "./core/settings/settings.service"
import { DeltaCalculatorService } from "./core/data/data.deltaCalculator.service"
import { IRootScopeService, IAngularEvent } from "angular"
import { MetricCalculator } from "./MetricCalculator"
import { CodeMapRenderService } from "./ui/codeMap/codeMap.render.service"

export interface ImportedFilesChangedSubscriber {
	onImportedFilesChanged(importedFiles: CCFile[], metrics: string[], metricData: MetricData[])
}

export class CodeChartaService implements SettingsServiceSubscriber {
	private importedFiles: CCFile[] = []
	private metrics: string[] = []
	private metricData: MetricData[] = []
	private _lastReferenceIndex = 0
	private _lastComparisonMap: CodeMapNode = null
	private _deltasEnabled = false
	private _lastDeltaState = false
	private renderMap: CodeMapNode
	//private importedScenarios: Scenario[]
	//private urlData: UrlData

	constructor(
		//private codeMapRenderService: CodeMapRenderService,
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		//private urlService: UrlService,
		private dataDecoratorService: DataDecoratorService,
		private deltaCalculatorService: DeltaCalculatorService,
		private codeMapRenderService: CodeMapRenderService
	) {
		SettingsService.subscribe(this.$rootScope, this)
	}

	public resetMaps(): any {
		throw new Error("Method not implemented.")
	}

	public getRenderMap(): CodeMapNode {
		return this.renderMap
	}

	public getImportedFiles(): CCFile[] {
		return this.importedFiles
	}

	public getMetrics(): string[] {
		return this.metrics
	}

	public onSettingsChanged(settings: Settings, event: IAngularEvent) {
		// TODO schleife ?
		if (this._lastDeltaState && settings.mapSettings.renderMode != RenderMode.Delta) {
			this._lastDeltaState = false
			this.onDeactivateDeltas()
		} else if (!this._lastDeltaState && settings.mapSettings.renderMode == RenderMode.Delta) {
			this._lastDeltaState = true
			this.onActivateDeltas()
		}
	}

	private getAdaptedRange(colorMetric: string, flipped: boolean): ColorRange {
		const maxMetricValue = MetricCalculator.getMaxMetricInAllRevisions(this.importedFiles, colorMetric)
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
			nameDataPairs.forEach((nameDataPair, revision) => {
				const errors = FileValidator.validate(nameDataPair.data as any)
				if (errors.length === 0) {
					const ccFile = this.getCCFile(nameDataPair.name, nameDataPair.data)
					this.importedFiles.push(ccFile)
					this.dataDecoratorService.preDecorateFile(ccFile)
					const metricResult = MetricCalculator.calculateMetrics(this.importedFiles)
					this.metrics = metricResult.metrics
					this.metricData = metricResult.data
					this.settingsService.updateSettings({
						mapSettings: {
							areaMetric: this.getMetricByIndexElseLast(0, this.metrics),
							heightMetric: this.getMetricByIndexElseLast(1, this.metrics),
							colorMetric: this.getMetricByIndexElseLast(2, this.metrics)
						},
						appSettings: {
							neutralColorRange: this.getAdaptedRange(this.getMetricByIndexElseLast(2, this.metrics), false)
						}
					})
					this.dataDecoratorService.postDecorateFiles(this.importedFiles, this.metrics)
					this.setReferenceMap(revision)
				} else {
					reject(errors)
				}
			})

			// TODO #136
			//if(applyScenarioOnce) {
			//    this.scenarioService.applyScenarioOnce(this.scenarioService.getDefaultScenario());
			//} else {
			//    this.scenarioService.applyScenario(this.scenarioService.getDefaultScenario());
			//}

			this.setComparisonMap(0)
			this.setReferenceMap(0)
			// TODO this.settingsService.updateSettingsFromUrl();
			resolve()
		})
	}

	public setComparisonMap(index: number) {
		if (this.importedFiles[index] != null) {
			this._lastComparisonMap = this.importedFiles[index].map
			this.processDeltas()
			this.dataDecoratorService.decorateMapWithCompactMiddlePackages(this.importedFiles[index]) // TODO not sure if this is the correct file
			this.callOthers()
		}
	}

	public setReferenceMap(index: number) {
		if (this.importedFiles[index] != null) {
			this._lastReferenceIndex = index
			this.renderMap = this.importedFiles[index].map
			this.processDeltas()
			this.dataDecoratorService.decorateMapWithCompactMiddlePackages(this.importedFiles[index])
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
		this.$rootScope.$broadcast("imported-files-changed", {
			importedFiles: this.importedFiles,
			metrics: this.metrics,
			metricData: this.metricData
		})

		const mapSettings = this.settingsService.getSettings().mapSettings
		const settingsUpdate: RecursivePartial<Settings> = {
			mapSettings: {
				// TODO blacklist: this.renderMap.blacklist
				areaMetric: mapSettings.areaMetric,
				heightMetric: mapSettings.heightMetric,
				colorMetric: mapSettings.colorMetric
			}
		}

		if (this.isMetricNotAvailable(mapSettings.areaMetric)) {
			settingsUpdate.mapSettings.areaMetric = this.getMetricByIndexElseLast(0, this.metrics)
		}

		if (this.isMetricNotAvailable(mapSettings.heightMetric)) {
			settingsUpdate.mapSettings.heightMetric = this.getMetricByIndexElseLast(1, this.metrics)
		}

		if (this.isMetricNotAvailable(mapSettings.colorMetric)) {
			settingsUpdate.mapSettings.colorMetric = this.getMetricByIndexElseLast(2, this.metrics)
		}

		this.settingsService.updateSettings(settingsUpdate)

		this.codeMapRenderService.render({
			renderMap: this.renderMap,
			fileName: "fileName", //TODO
			importedFiles: this.importedFiles,
			settings: this.settingsService.getSettings()
		})
	}

	private getMetricByIndexElseLast(index: number, metrics: string[]): string {
		return metrics[Math.min(index, metrics.length - 1)]
	}

	private isMetricNotAvailable(metric: string) {
		return this.metrics.indexOf(metric) === -1
	}

	private processDeltas() {
		//if (this.renderMap) {
		//	this.deltaCalculatorService.removeCrossOriginNodes(this.renderMap)
		//}
		//if (this._deltasEnabled && this.renderMap && this._lastComparisonMap) {
		//	this.deltaCalculatorService.provideDeltas(this.renderMap, this._lastComparisonMap, this.metrics)
		//}
	}

	private getCCFile(fileName: string, fileContent: any): CCFile {
		return {
			fileMeta: {
				fileName: fileName,
				projectName: fileContent.projectName,
				apiVersion: fileContent.apiVersion
			},
			settings: {
				mapSettings: {
					edges: fileContent.edges || [],
					attributeTypes: fileContent.attributeTypes || {},
					blacklist: fileContent.blacklist || []
				}
			},
			map: fileContent.nodes[0]
		}
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: ImportedFilesChangedSubscriber) {
		$rootScope.$on("imported-files-changed", (event, data) => {
			subscriber.onImportedFilesChanged(data.importedFiles, data.metrics, data.metricData)
		})
	}

	/*

	/*
	onChangeRenderMode() {
		this.resetMapRelatedSettings()
		const usedFiles: File[] = this.importedFiles.filter(f => f.settings.mapSettings.renderMode)
		const mergedSettings: Settings = this.settingsService.mergeMapRelatedSettings(usedFiles)
		this.updateRenderSettings(mergedSettings)
		this.updateRenderSettings(this.urlData.settings)
		this.renderMap()
	}

	onSelectScenario(scenarioName: string) {
		const scenario: Scenario[] = this.importedScenarios.filter(scenario => scenario.name == scenarioName)
		this.updateRenderSettings(scenario[0].settings)
		this.renderMap()
	}

	onLoad() {
		this.setRenderSettings(this.getDefaultSettings())
		this.updateRenderSettings(this.importedFiles[0].settings)
		this.updateRenderSettings(this.urlData.settings)
		this.renderMap()
	}

	updateRenderSettings(partialSettings: Partial<Settings>) {
		this.renderSettings = {...this.renderSettings, ...partialSettings}
	}

	renderMap() {
		this.codeMapRenderService.updateMapGeometry(this.renderSettings, this.importedFiles)
	}
*/
}
