import { validate } from "./util/fileValidator"
import { AttributeTypes, CCFile, NameDataPair, BlacklistType, BlacklistItem } from "./codeCharta.model"
import _ from "lodash"
import { NodeDecorator } from "./util/nodeDecorator"
import { ExportBlacklistType, ExportCCFile, OldAttributeTypes } from "./codeCharta.api.model"
import { StoreService } from "./state/store.service"
import { addFile, setSingle } from "./state/store/files/files.actions"
import { getCCFiles } from "./model/files/files.helper"
import { DialogService } from "./ui/dialog/dialog.service"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setState } from "./state/store/state.actions"
import { ScenarioHelper } from "./util/scenarioHelper"
import { MetricService } from "./state/metric.service"

export class CodeChartaService {
	public static ROOT_NAME = "root"
	public static ROOT_PATH = "/" + CodeChartaService.ROOT_NAME
	public static readonly CC_FILE_EXTENSION = ".cc.json"

	constructor(private storeService: StoreService, private dialogService: DialogService, private metricService: MetricService) {}

	public loadFiles(nameDataPairs: NameDataPair[]) {
		let printErrors = true

		nameDataPairs.forEach((nameDataPair: NameDataPair) => {
			if (!printErrors) {
				return
			}

			try {
				validate(nameDataPair.content)
				this.addFile(nameDataPair.fileName, nameDataPair.content)
			} catch (e) {
				if (!_.isEmpty(e.error)) {
					this.dialogService.showValidationErrorDialog(e)
					printErrors = false
				}

				if (!_.isEmpty(e.warning)) {
					this.dialogService.showValidationWarningDialog(e)
				}

				this.storeService.dispatch(setIsLoadingFile(false))
			}
		})

		if (this.storeService.getState().files.length !== 0) {
			this.storeService.dispatch(setSingle(getCCFiles(this.storeService.getState().files)[0]))
			this.setDefaultScenario()
		}
	}

	private addFile(fileName: string, migratedFile: ExportCCFile) {
		const ccFile: CCFile = this.getCCFile(fileName, migratedFile)
		NodeDecorator.preDecorateFile(ccFile)
		this.storeService.dispatch(addFile(ccFile))
	}

	private getCCFile(fileName: string, fileContent: ExportCCFile): CCFile {
		return {
			fileMeta: {
				fileName,
				projectName: fileContent.projectName,
				apiVersion: fileContent.apiVersion
			},
			settings: {
				fileSettings: {
					edges: fileContent.edges || [],
					attributeTypes: this.getAttributeTypes(fileContent.attributeTypes),
					blacklist: this.potentiallyUpdateBlacklistTypes(fileContent.blacklist || []),
					markedPackages: fileContent.markedPackages || []
				}
			},
			map: fileContent.nodes[0]
		}
	}

	private getAttributeTypes(attributeTypes: AttributeTypes | OldAttributeTypes): AttributeTypes {
		if (_.isEmpty(attributeTypes) || !attributeTypes || Array.isArray(attributeTypes.nodes) || Array.isArray(attributeTypes.edges)) {
			return {
				nodes: {},
				edges: {}
			}
		}

		return {
			nodes: !attributeTypes.nodes ? {} : attributeTypes.nodes,
			edges: !attributeTypes.edges ? {} : attributeTypes.edges
		}
	}

	private potentiallyUpdateBlacklistTypes(blacklist): BlacklistItem[] {
		blacklist.forEach(x => {
			if (x.type === ExportBlacklistType.hide) {
				x.type = BlacklistType.flatten
			}
		})
		return blacklist
	}

	private setDefaultScenario() {
		const metricData = this.metricService.getMetricData()
		const { areaMetric, heightMetric, colorMetric } = ScenarioHelper.getDefaultScenarioSetting().dynamicSettings
		const names = [areaMetric, heightMetric, colorMetric]

		const existsInMetricData = (metric: string) => metricData.map(x => x.name).includes(metric)

		if (names.every(existsInMetricData)) {
			this.storeService.dispatch(setState(ScenarioHelper.getDefaultScenarioSetting()))
		}
	}
}
