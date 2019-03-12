import { FileValidator } from "./core/data/FileValidator"
import { CCFile } from "./codeCharta.model"
import { NameDataPair } from "./util/urlUtils"
import { SettingsService } from "./state/settings.service"
import { IRootScopeService } from "angular"
import { FileStateService } from "./state/fileState.service";

export class CodeChartaService {

	public static ROOT_NAME = "root"
	public static ROOT_PATH =  "/" + CodeChartaService.ROOT_NAME

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

	public loadFiles(nameDataPairs: NameDataPair[]): Promise<void> {
		return new Promise((resolve, reject) => {

			this.settingsService.updateSettings(this.settingsService.getDefaultSettings())

			nameDataPairs.forEach((nameDataPair) => {
				const errors = FileValidator.validate(nameDataPair.data as any)
				if (errors.length === 0) {
					const ccFile = this.getCCFile(nameDataPair.name, nameDataPair.data)
					this.fileStateService.addFile(ccFile)
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

			this.fileStateService.setSingle(this.fileStateService.getCCFiles()[0])

			// TODO this.settingsService.updateSettingsFromUrl();
			resolve()
		})
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
