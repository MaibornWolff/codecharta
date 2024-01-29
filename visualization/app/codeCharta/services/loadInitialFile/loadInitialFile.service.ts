import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { State, Store } from "@ngrx/store"
import stringify from "safe-stable-stringify"
import { setAmountOfTopLabels } from "../../../../app/codeCharta/state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setColorLabels } from "../../../../app/codeCharta/state/store/appSettings/colorLabels/colorLabels.actions"
import { setEdgeHeight } from "../../../../app/codeCharta/state/store/appSettings/edgeHeight/edgeHeight.actions"
import { setScreenshotToClipboardEnabled } from "../../../../app/codeCharta/state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.actions"
import { setExperimentalFeaturesEnabled } from "../../../../app/codeCharta/state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setEnableFloorLabels } from "../../../../app/codeCharta/state/store/appSettings/enableFloorLabels/enableFloorLabels.actions"
import { setHideFlatBuildings } from "../../../../app/codeCharta/state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { setInvertArea } from "../../../../app/codeCharta/state/store/appSettings/invertArea/invertArea.actions"
import { setInvertHeight } from "../../../../app/codeCharta/state/store/appSettings/invertHeight/invertHeight.actions"
import { setIsEdgeMetricVisible } from "../../../../app/codeCharta/state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"
import { setIsColorMetricLinkedToHeightMetricAction } from "../../../../app/codeCharta/state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
import { setPresentationMode } from "../../../../app/codeCharta/state/store/appSettings/isPresentationMode/isPresentationMode.actions"
import { setIsSearchPanelPinned } from "../../../../app/codeCharta/state/store/appSettings/isSearchPanelPinned/isSearchPanelPinned.actions"
import { setIsWhiteBackground } from "../../../../app/codeCharta/state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { setLayoutAlgorithm } from "../../../../app/codeCharta/state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { setMapColors } from "../../../../app/codeCharta/state/store/appSettings/mapColors/mapColors.actions"
import { setMaxTreeMapFiles } from "../../../../app/codeCharta/state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { setResetCameraIfNewFileIsLoaded } from "../../../../app/codeCharta/state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setScaling } from "../../../../app/codeCharta/state/store/appSettings/scaling/scaling.actions"
import { setSharpnessMode } from "../../../../app/codeCharta/state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { setShowMetricLabelNameValue } from "../../../../app/codeCharta/state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { setShowMetricLabelNodeName } from "../../../../app/codeCharta/state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { setShowOnlyBuildingsWithEdges } from "../../../../app/codeCharta/state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import { setSortingOrderAscending } from "../../../../app/codeCharta/state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { setAreaMetric } from "../../../../app/codeCharta/state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { setColorMetric } from "../../../../app/codeCharta/state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setColorMode } from "../../../../app/codeCharta/state/store/dynamicSettings/colorMode/colorMode.actions"
import { setColorRange } from "../../../../app/codeCharta/state/store/dynamicSettings/colorRange/colorRange.actions"
import { setDistributionMetric } from "../../../../app/codeCharta/state/store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { setEdgeMetric } from "../../../../app/codeCharta/state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { setAllFocusedNodes } from "../../../../app/codeCharta/state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { setHeightMetric } from "../../../../app/codeCharta/state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setMargin } from "../../../../app/codeCharta/state/store/dynamicSettings/margin/margin.actions"
import { setSearchPattern } from "../../../../app/codeCharta/state/store/dynamicSettings/searchPattern/searchPattern.actions"
import { setSortingOption } from "../../../../app/codeCharta/state/store/dynamicSettings/sortingOption/sortingOption.actions"
import { setAttributeDescriptors } from "../../../../app/codeCharta/state/store/fileSettings/attributeDescriptors/attributeDescriptors.action"
import { setAttributeTypes } from "../../../../app/codeCharta/state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { setBlacklist } from "../../../../app/codeCharta/state/store/fileSettings/blacklist/blacklist.actions"
import { setEdges } from "../../../../app/codeCharta/state/store/fileSettings/edges/edges.actions"
import { setMarkedPackages } from "../../../../app/codeCharta/state/store/fileSettings/markedPackages/markedPackages.actions"
import { readCcState } from "../../../../app/codeCharta/util/indexedDB/indexedDBWriter"
import sample1 from "../../assets/sample1.cc.json"
import sample2 from "../../assets/sample2.cc.json"
import { ExportCCFile } from "../../codeCharta.api.model"
import { AppSettings, CcState, DynamicSettings, FileSettings } from "../../codeCharta.model"
import { getCCFiles, isDeltaState } from "../../model/files/files.helper"
import { setDelta, setFiles } from "../../state/store/files/files.actions"
import { ErrorDialogComponent } from "../../ui/dialogs/errorDialog/errorDialog.component"
import { getNameDataPair } from "../loadFile/fileParser"
import { LoadFileService } from "../loadFile/loadFile.service"
import { UrlExtractor } from "./urlExtractor"

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
			const urlNameDataPairs = await this.urlUtils.getFileDataFromQueryParam()
			const savedCcState = await readCcState()
			if (!savedCcState) {
				this.setRenderStateFromUrl()
				this.loadFileService.loadFiles(urlNameDataPairs)
			} else {
				const savedFileStates = savedCcState.files
				const savedNameDataPairs = savedFileStates.map(fileState => getNameDataPair(fileState.file))
				const urlNameDataPairCheckSums = urlNameDataPairs.map(urlNameDataPair => urlNameDataPair.content.fileChecksum)
				const savedNameDataPairCheckSums = savedNameDataPairs.map(savedNameDataPair => savedNameDataPair.content.fileChecksum)
				if (stringify(urlNameDataPairCheckSums) === stringify(savedNameDataPairCheckSums)) {
					this.loadFileService.loadFiles(savedNameDataPairs)
					this.store.dispatch(setFiles({ value: savedFileStates }))
					this.applySettings(savedCcState)
					this.setRenderStateFromUrlIfDeltaStateNotSaved()
				} else {
					this.applySettings(savedCcState)
					this.loadFileService.loadFiles(urlNameDataPairs)
					this.setRenderStateFromUrl()
				}
			}
		} catch (error) {
			const title = this.createTitleErrorDialog(error as Error)
			const message = "Files could not be loaded from the given file URL parameter. Loaded sample files instead."
			this.showErrorDialog(title, message)
			this.loadSampleFiles()
		}
	}

	private async loadFilesFromIndexedDB() {
		try {
			const savedCcState = await readCcState()
			if (!savedCcState) {
				this.loadSampleFiles()
			} else {
				const savedFileStates = savedCcState.files
				const savedNameDataPairs = savedFileStates.map(fileState => getNameDataPair(fileState.file))
				this.loadFileService.loadFiles(savedNameDataPairs)
				this.store.dispatch(setFiles({ value: savedFileStates }))
				this.applySettings(savedCcState)
			}
		} catch (error) {
			const title = "Files could not be loaded from indexeddb. Loaded sample files instead."
			const message = (error as Error).message
			this.showErrorDialog(title, message)
			this.loadSampleFiles()
		}
	}

	private async applySettings(loadedCcState: CcState) {
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
					this.mapFileSettingToAction(typedKey, loadedFileSettings[typedKey])
				}
			}
		}
	}

	private applyDynamicSettings(loadedDynamicSettings: DynamicSettings) {
		const currentDynamicSettings = (this.state.getValue() as CcState).dynamicSettings
		for (const [key, value] of Object.entries(currentDynamicSettings)) {
			const typedKey = key as keyof DynamicSettings
			if (!(typedKey in loadedDynamicSettings)) {
				// TODO: create warnings
			} else {
				const currentValue = stringify(value)
				const loadedValue = stringify(loadedDynamicSettings[typedKey])
				if (currentValue !== loadedValue) {
					this.mapDynamicSettingToAction(typedKey, loadedDynamicSettings[typedKey])
				}
			}
		}
	}

	private applyAppSettings(loadedAppSettings: AppSettings) {
		const currentAppSettings = (this.state.getValue() as CcState).appSettings
		for (const [key, value] of Object.entries(currentAppSettings)) {
			const typedKey = key as keyof AppSettings
			if (!(typedKey in loadedAppSettings)) {
				// TODO: create warnings
			} else {
				const currentValue = stringify(value)
				const loadedValue = stringify(loadedAppSettings[typedKey])
				if (currentValue !== loadedValue) {
					this.mapAppSettingToAction(typedKey, loadedAppSettings[typedKey])
				}
			}
		}
	}

	private mapFileSettingToAction(key: keyof FileSettings, value: any) {
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

	private mapDynamicSettingToAction(key: keyof DynamicSettings, value: any) {
		switch (key) {
			case "areaMetric":
				this.store.dispatch(setAreaMetric({ value }))
				break
			case "heightMetric":
				this.store.dispatch(setHeightMetric({ value }))
				break
			case "edgeMetric":
				this.store.dispatch(setEdgeMetric({ value }))
				break
			case "colorMetric":
				this.store.dispatch(setColorMetric({ value }))
				break
			case "colorMode":
				this.store.dispatch(setColorMode({ value }))
				break
			case "sortingOption":
				this.store.dispatch(setSortingOption({ value }))
				break
			case "colorRange":
				this.store.dispatch(setColorRange({ value }))
				break
			case "distributionMetric":
				this.store.dispatch(setDistributionMetric({ value }))
				break
			case "focusedNodePath":
				this.store.dispatch(setAllFocusedNodes({ value }))
				break
			case "searchPattern":
				this.store.dispatch(setSearchPattern({ value }))
				break
			case "margin":
				this.store.dispatch(setMargin({ value }))
				break
			default: {
				const exhaustiveCheck: never = key
				throw new Error(`Unhandled key: ${exhaustiveCheck}`)
			}
		}
	}

	private mapAppSettingToAction(key: keyof AppSettings, value: any) {
		switch (key) {
			case "amountOfTopLabels":
				this.store.dispatch(setAmountOfTopLabels({ value }))
				break
			case "amountOfEdgePreviews":
				this.store.dispatch(setAmountOfTopLabels({ value }))
				break
			case "edgeHeight":
				this.store.dispatch(setEdgeHeight({ value }))
				break
			case "scaling":
				this.store.dispatch(setScaling({ value }))
				break
			case "hideFlatBuildings":
				this.store.dispatch(setHideFlatBuildings({ value }))
				break
			case "invertHeight":
				this.store.dispatch(setInvertHeight({ value }))
				break
			case "invertArea":
				this.store.dispatch(setInvertArea({ value }))
				break
			case "isWhiteBackground":
				this.store.dispatch(setIsWhiteBackground({ value }))
				break
			case "mapColors":
				this.store.dispatch(setMapColors({ value }))
				break
			case "isPresentationMode":
				this.store.dispatch(setPresentationMode({ value }))
				break
			case "showOnlyBuildingsWithEdges":
				this.store.dispatch(setShowOnlyBuildingsWithEdges({ value }))
				break
			case "isEdgeMetricVisible":
				this.store.dispatch(setIsEdgeMetricVisible({ value }))
				break
			case "resetCameraIfNewFileIsLoaded":
				this.store.dispatch(setResetCameraIfNewFileIsLoaded({ value }))
				break
			case "isLoadingMap":
				// TODO
				break
			case "isLoadingFile":
				// TODO
				break
			case "sortingOrderAscending":
				this.store.dispatch(setSortingOrderAscending({ value }))
				break
			case "isSearchPanelPinned":
				this.store.dispatch(setIsSearchPanelPinned({ value }))
				break
			case "showMetricLabelNameValue":
				this.store.dispatch(setShowMetricLabelNameValue({ value }))
				break
			case "showMetricLabelNodeName":
				this.store.dispatch(setShowMetricLabelNodeName({ value }))
				break
			case "layoutAlgorithm":
				this.store.dispatch(setLayoutAlgorithm({ value }))
				break
			case "maxTreeMapFiles":
				this.store.dispatch(setMaxTreeMapFiles({ value }))
				break
			case "sharpnessMode":
				this.store.dispatch(setSharpnessMode({ value }))
				break
			case "experimentalFeaturesEnabled":
				this.store.dispatch(setExperimentalFeaturesEnabled({ value }))
				break
			case "screenshotToClipboardEnabled":
				this.store.dispatch(setScreenshotToClipboardEnabled({ value }))
				break
			case "colorLabels":
				this.store.dispatch(setColorLabels({ value }))
				break
			case "isColorMetricLinkedToHeightMetric":
				this.store.dispatch(setIsColorMetricLinkedToHeightMetricAction({ value }))
				break
			case "enableFloorLabels":
				this.store.dispatch(setEnableFloorLabels({ value }))
				break
			default: {
				const exhaustiveCheck: never = key
				throw new Error(`Unhandled key: ${exhaustiveCheck}`)
			}
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
		}
	}

	private setRenderStateFromUrlIfDeltaStateNotSaved() {
		const currentCcStates = this.state.getValue().files
		const currentFiles = getCCFiles(this.state.getValue().files)
		const urlRenderState = this.urlUtils.getParameterByName("mode")
		if (!isDeltaState(currentCcStates) && urlRenderState === "Delta" && currentFiles.length >= 2) {
			this.store.dispatch(setDelta({ referenceFile: currentFiles[0], comparisonFile: currentFiles[1] }))
		}
	}
}
