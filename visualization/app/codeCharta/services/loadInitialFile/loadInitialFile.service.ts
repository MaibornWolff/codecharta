import { Injectable } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { HttpClient } from "@angular/common/http"
import { CcState, FileSettings, DynamicSettings, AppSettings } from "../../codeCharta.model"
import { getCCFiles } from "../../model/files/files.helper"
import { setDelta, setFiles, setStandard } from "../../state/store/files/files.actions"
import { ErrorDialogComponent } from "../../ui/dialogs/errorDialog/errorDialog.component"
import { LoadFileService } from "../loadFile/loadFile.service"
import { UrlExtractor } from "./urlExtractor"
import sample1 from "../../assets/sample1.cc.json"
import sample2 from "../../assets/sample2.cc.json"
import { ExportCCFile } from "../../codeCharta.api.model"
import { Store, State } from "@ngrx/store"
import { getNameDataPair } from "../loadFile/fileParser"
import { loadCcState } from "app/codeCharta/util/indexedDB/indexedDBWriter"
import stringify from "safe-stable-stringify"
import { setAttributeTypes } from "app/codeCharta/state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { setAttributeDescriptors } from "app/codeCharta/state/store/fileSettings/attributeDescriptors/attributeDescriptors.action"
import { setBlacklist } from "app/codeCharta/state/store/fileSettings/blacklist/blacklist.actions"
import { setEdges } from "app/codeCharta/state/store/fileSettings/edges/edges.actions"
import { setMarkedPackages } from "app/codeCharta/state/store/fileSettings/markedPackages/markedPackages.actions"
import { setAreaMetric } from "app/codeCharta/state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { setColorMetric } from "app/codeCharta/state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setEdgeMetric } from "app/codeCharta/state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { setHeightMetric } from "app/codeCharta/state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setMargin } from "app/codeCharta/state/store/dynamicSettings/margin/margin.actions"
import { setSearchPattern } from "app/codeCharta/state/store/dynamicSettings/searchPattern/searchPattern.actions"
import { setAllFocusedNodes } from "app/codeCharta/state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { setColorRange } from "app/codeCharta/state/store/dynamicSettings/colorRange/colorRange.actions"
import { setSortingOption } from "app/codeCharta/state/store/dynamicSettings/sortingOption/sortingOption.actions"
import { setColorMode } from "app/codeCharta/state/store/dynamicSettings/colorMode/colorMode.actions"
import { setAmountOfTopLabels } from "app/codeCharta/state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setScaling } from "app/codeCharta/state/store/appSettings/scaling/scaling.actions"

@Injectable({ providedIn: "root" })
export class LoadInitialFileService {
	private urlUtils = new UrlExtractor(this.httpClient)

	constructor(
		private store: Store,
		private state: State<CcState>,
		private dialog: MatDialog,
		private loadFileService: LoadFileService,
		private httpClient: HttpClient
	) {}

	async loadFilesOrSampleFiles() {
		const isFileQueryParameterPresent = this.checkFileQueryParameterPresent()
		if (isFileQueryParameterPresent) {
			this.loadFilesFromQueryParams()
		} else {
			this.loadFilesFromIndexedDB()
		}
	}

	private checkFileQueryParameterPresent() {
		return Boolean(this.urlUtils.getParameterByName("file"))
	}

	private async loadFilesFromQueryParams() {
		try {
			const data = await this.urlUtils.getFileDataFromQueryParam()
			this.loadFileService.loadFiles(data)
			this.setRenderStateFromUrl()
		} catch (error) {
			const title = this.createTitleErrorDialog(error as Error)
			const message = "Files could not be loaded from the given file URL parameter. Loaded sample files instead."
			this.showErrorDialog(title, message)
			this.loadSampleFiles()
		}
	}

	private async loadFilesFromIndexedDB() {
		try {
			const loadedCcState = await loadCcState()
			if (!loadedCcState) {
				this.loadSampleFiles()
			} else {
				const fileStates = loadedCcState.files
				const nameDataPairs = fileStates.map(fileState => getNameDataPair(fileState.file))
				this.loadFileService.loadFiles(nameDataPairs)
				this.store.dispatch(setFiles({ value: fileStates }))
				this.applySettings(loadedCcState)
			}
		} catch (error) {
			const title = "Files could not be loaded from indexeddb. Loaded sample files instead."
			const message = (error as Error).message
			this.showErrorDialog(title, message)
			this.loadSampleFiles()
		}
	}

	private applySettings(loadedCcState: CcState) {
		const loadedFileSettings = loadedCcState.fileSettings
		const loadedDynamicSettings = loadedCcState.dynamicSettings
		const loadedAppSettings = loadedCcState.appSettings
		if (loadedFileSettings) {
			this.applyFileSettings(loadedFileSettings)
		}
		if (loadedDynamicSettings) {
			this.applyDynamicSettings(loadedDynamicSettings)
		}
		if (loadedAppSettings) {
			this.applyAppSettings(loadedAppSettings)
		}
	}

	private applyFileSettings(loadedFileSettings: FileSettings) {
		const currentFileSettings = (this.state.getValue() as CcState).fileSettings
		for (const [key, value] of Object.entries(currentFileSettings)) {
			const typedKey = key as keyof FileSettings
			if (!(typedKey in loadedFileSettings)) {
				// TODO: create warnings
			} else {
				const currentValue = stringify(value)
				const loadedValue = stringify(loadedFileSettings[typedKey])
				if (currentValue !== loadedValue) {
					this.mapFileSettingsKeyToAction(typedKey, value)
				}
			}
		}
	}

	private mapFileSettingsKeyToAction(key: keyof FileSettings, value: any) {
		switch (key) {
			case "attributeTypes":
				this.store.dispatch(setAttributeTypes({ value }))
				break
			case "attributeDescriptors":
				this.store.dispatch(setAttributeDescriptors({ value }))
				break
			case "blacklist":
				this.store.dispatch(setBlacklist({ value }))
				break
			case "edges":
				this.store.dispatch(setEdges({ value }))
				break
			case "markedPackages":
				this.store.dispatch(setMarkedPackages({ value }))
				break
			default: {
				const exhaustiveCheck: never = key
				throw new Error(`Unhandled key: ${exhaustiveCheck}`)
			}
		}
	}

	private applyDynamicSettings(dynamicSettings: DynamicSettings) {
		if (this.state.getValue().dynamicSettings.areaMetric !== dynamicSettings.areaMetric) {
			this.store.dispatch(setAreaMetric({ value: dynamicSettings.areaMetric }))
		}
		if (this.state.getValue().dynamicSettings.heightMetric !== dynamicSettings.heightMetric) {
			this.store.dispatch(setHeightMetric({ value: dynamicSettings.heightMetric }))
		}
		if (this.state.getValue().dynamicSettings.edgeMetric !== dynamicSettings.edgeMetric) {
			this.store.dispatch(setEdgeMetric({ value: dynamicSettings.edgeMetric }))
		}
		if (this.state.getValue().dynamicSettings.colorMetric !== dynamicSettings.colorMetric) {
			this.store.dispatch(setColorMetric({ value: dynamicSettings.colorMetric }))
		}

		if (stringify(this.state.getValue().dynamicSettings.colorMode) !== stringify(dynamicSettings.colorMode)) {
			this.store.dispatch(setColorMode({ value: dynamicSettings.colorMode }))
		}
		if (stringify(this.state.getValue().dynamicSettings.sortingOption) !== stringify(dynamicSettings.sortingOption)) {
			this.store.dispatch(setSortingOption({ value: dynamicSettings.sortingOption }))
		}
		if (stringify(this.state.getValue().dynamicSettings.colorRange) !== stringify(dynamicSettings.colorRange)) {
			this.store.dispatch(setColorRange({ value: dynamicSettings.colorRange }))
		}
		if (this.state.getValue().dynamicSettings.distributionMetric !== dynamicSettings.colorMetric) {
			this.store.dispatch(setColorMetric({ value: dynamicSettings.colorMetric }))
		}
		// TODO: check correct
		if (stringify(this.state.getValue().dynamicSettings.focusedNodePath) !== stringify(dynamicSettings.focusedNodePath)) {
			this.store.dispatch(setAllFocusedNodes({ value: dynamicSettings.focusedNodePath }))
		}
		if (this.state.getValue().dynamicSettings.searchPattern !== dynamicSettings.searchPattern) {
			this.store.dispatch(setSearchPattern({ value: dynamicSettings.searchPattern }))
		}
		if (this.state.getValue().dynamicSettings.margin !== dynamicSettings.margin) {
			this.store.dispatch(setMargin({ value: dynamicSettings.margin }))
		}
	}

	private applyAppSettings(appSettings: AppSettings) {
		if (this.state.getValue().appSettings.amountOfTopLabels !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.amountOfEdgePreviews !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.edgeHeight !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (stringify(this.state.getValue().appSettings.scaling) !== stringify(appSettings.scaling)) {
			this.store.dispatch(setScaling({ value: appSettings.scaling }))
		}
		if (this.state.getValue().appSettings.hideFlatBuildings !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.invertHeight !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.invertArea !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.isWhiteBackground !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (stringify(this.state.getValue().appSettings.mapColors) !== stringify(appSettings.scaling)) {
			this.store.dispatch(setScaling({ value: appSettings.scaling }))
		}
		if (this.state.getValue().appSettings.isPresentationMode !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.showOnlyBuildingsWithEdges !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.isEdgeMetricVisible !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.resetCameraIfNewFileIsLoaded !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		// TODO isLoadingMap: boolean
		// TODO isLoadingFile: boolean
		if (this.state.getValue().appSettings.sortingOrderAscending !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.isSearchPanelPinned !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.showMetricLabelNameValue !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.showMetricLabelNodeName !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (stringify(this.state.getValue().appSettings.layoutAlgorithm) !== stringify(appSettings.scaling)) {
			this.store.dispatch(setScaling({ value: appSettings.scaling }))
		}
		if (this.state.getValue().appSettings.maxTreeMapFiles !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (stringify(this.state.getValue().appSettings.sharpnessMode) !== stringify(appSettings.scaling)) {
			this.store.dispatch(setScaling({ value: appSettings.scaling }))
		}
		if (this.state.getValue().appSettings.experimentalFeaturesEnabled !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.screenshotToClipboardEnabled !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (stringify(this.state.getValue().appSettings.colorLabels) !== stringify(appSettings.scaling)) {
			this.store.dispatch(setScaling({ value: appSettings.scaling }))
		}
		if (this.state.getValue().appSettings.isColorMetricLinkedToHeightMetric !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
		if (this.state.getValue().appSettings.isColorMetricLinkedToHeightMetric !== appSettings.amountOfTopLabels) {
			this.store.dispatch(setAmountOfTopLabels({ value: appSettings.amountOfTopLabels }))
		}
	}

	private loadSampleFiles() {
		this.loadFileService.loadFiles([
			{ fileName: "sample1.cc.json", fileSize: 3 * 1024, content: sample1 as ExportCCFile },
			{ fileName: "sample2.cc.json", fileSize: 2 * 1024, content: sample2 as ExportCCFile }
		])
	}

	private showErrorDialog(title: string, message: string) {
		this.dialog.open(ErrorDialogComponent, {
			data: { title, message }
		})
	}

	private createTitleErrorDialog(error: Error & { statusText?: string; status?: number }) {
		let title = "Error"
		if (error.message) {
			title += ` (${error.message})`
		} else if (error.statusText && error.status) {
			title += ` (${error.status}: ${error.statusText})`
		}
		return title
	}

	// TODO: Please make sure that this function works fine on Github pages with
	//  the updated file selection (no more single mode!)
	private setRenderStateFromUrl() {
		const renderState = this.urlUtils.getParameterByName("mode")
		const files = getCCFiles(this.state.getValue().files)

		if (renderState === "Delta" && files.length >= 2) {
			this.store.dispatch(setDelta({ referenceFile: files[0], comparisonFile: files[1] }))
		} else {
			this.store.dispatch(setStandard({ files }))
		}
	}
}
