import { validate } from "./util/fileValidator"
import { NameDataPair } from "./codeCharta.model"
import { NodeDecorator } from "./util/nodeDecorator"
import { StoreService } from "./state/store.service"
import { resetFiles, setFiles, setSingle } from "./state/store/files/files.actions"
import { getCCFiles } from "./model/files/files.helper"
import { DialogService } from "./ui/dialog/dialog.service"
import { setState } from "./state/store/state.actions"
import { ScenarioHelper } from "./util/scenarioHelper"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { FileSelectionState, FileState } from "./model/files/files"
import { getCCFile } from "./util/fileHelper"

export class CodeChartaService {
	static ROOT_NAME = "root"
	static ROOT_PATH = `/${CodeChartaService.ROOT_NAME}`
	static readonly CC_FILE_EXTENSION = ".cc.json"
	private fileStates: FileState[] = []

	constructor(private storeService: StoreService, private dialogService: DialogService) {}

	loadFiles(nameDataPairs: NameDataPair[]) {
		for (const nameDataPair of nameDataPairs) {
			try {
				validate(nameDataPair.content)
				this.addFile(nameDataPair)
			} catch (error) {
				if (error.error.length > 0) {
					this.fileStates = []
					this.storeService.dispatch(setIsLoadingFile(false))
					this.dialogService.showValidationErrorDialog(error)
					break
				}

				if (error.warning.length > 0) {
					this.addFile(nameDataPair)
					this.dialogService.showValidationWarningDialog(error)
				}
			}
		}

		if (this.fileStates.length > 0) {
			this.storeService.dispatch(resetFiles())
			this.storeService.dispatch(setFiles(this.fileStates))
			this.fileStates = []
			this.storeService.dispatch(setSingle(getCCFiles(this.storeService.getState().files)[0]))
			const rootName = this.storeService.getState().files[0].file.map.name
			CodeChartaService.updateRootData(rootName)
			this.setDefaultScenario()
		}
	}

	private addFile(file: NameDataPair) {
		const ccFile = getCCFile(file)
		NodeDecorator.decorateMapWithPathAttribute(ccFile)
		this.fileStates.push({ file: ccFile, selectedAs: FileSelectionState.None })
	}

	private setDefaultScenario() {
		const { areaMetric, heightMetric, colorMetric } = ScenarioHelper.getDefaultScenarioSetting().dynamicSettings
		const names = [areaMetric, heightMetric, colorMetric]
		const metricNames = new Set(this.storeService.getState().metricData.nodeMetricData.map(x => x.name))

		if (names.every(metric => metricNames.has(metric))) {
			this.storeService.dispatch(setState(ScenarioHelper.getDefaultScenarioSetting()))
		}
	}

	static updateRootData(rootName: string) {
		CodeChartaService.ROOT_NAME = rootName
		CodeChartaService.ROOT_PATH = `/${CodeChartaService.ROOT_NAME}`
	}
}
