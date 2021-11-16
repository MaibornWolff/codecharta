import { validate } from "./util/fileValidator"
import { NameDataPair } from "./codeCharta.model"
import { NodeDecorator } from "./util/nodeDecorator"
import { StoreService } from "./state/store.service"
import { setFiles, setMultipleByNames } from "./state/store/files/files.actions"
import { DialogService } from "./ui/dialog/dialog.service"
import { setState } from "./state/store/state.actions"
import { ScenarioHelper } from "./util/scenarioHelper"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { FileSelectionState, FileState } from "./model/files/files"
import { getCCFile } from "./util/fileHelper"
import { setRecentFiles } from "./state/store/dynamicSettings/recentFiles/recentFiles.actions"

export class CodeChartaService {
	static ROOT_NAME = "root"
	static ROOT_PATH = `/${CodeChartaService.ROOT_NAME}`
	static readonly CC_FILE_EXTENSION = ".cc.json"
	private fileStates: FileState[] = []
	private recentFiles: string[] = []

	constructor(private storeService: StoreService, private dialogService: DialogService) {
		"ngInject"
	}

	async loadFiles(nameDataPairs: NameDataPair[]) {
		this.fileStates = this.storeService.getState().files
		for (const nameDataPair of nameDataPairs) {
			try {
				validate(nameDataPair, this.storeService)
				this.addFile(nameDataPair)
				this.addRecentFile(nameDataPair.fileName)
			} catch (error) {
				if (error.error.length > 0) {
					this.fileStates = []
					this.recentFiles = []
					this.storeService.dispatch(setIsLoadingFile(false))
					await this.dialogService.showValidationErrorDialog(error)
					break
				}

				if (error.warning.length > 0) {
					this.addFile(nameDataPair)
					this.addRecentFile(nameDataPair.fileName)
					this.storeService.dispatch(setIsLoadingFile(false))
					await this.dialogService.showValidationWarningDialog(error)
				}
			}
		}

		if (this.fileStates.length > 0) {
			this.storeService.dispatch(setRecentFiles(this.recentFiles))
			this.storeService.dispatch(setFiles(this.fileStates))

			this.fileStates = []
			this.recentFiles = []

			const recentFile = this.storeService.getState().dynamicSettings.recentFiles[0]
			const rootName = this.storeService.getState().files.find(f => f.file.fileMeta.fileName === recentFile).file.map.name

			this.storeService.dispatch(setMultipleByNames([recentFile]))
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

	private addRecentFile(fileName: string) {
		this.recentFiles.push(fileName)
	}
}
