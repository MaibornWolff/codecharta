import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { State, Store } from "@ngrx/store"
import stringify from "safe-stable-stringify"
import { readCcState } from "../../util/indexedDB/indexedDBWriter"
import sample1 from "../../assets/sample1.cc.json"
import sample2 from "../../assets/sample2.cc.json"
import { ExportCCFile } from "../../codeCharta.api.model"
import { AppSettings, CcState, DynamicSettings, FileSettings, NameDataPair } from "../../codeCharta.model"
import { FileState } from "../../model/files/files"
import { getCCFiles } from "../../model/files/files.helper"
import { MetricQueryParemter } from "../../state/effects/updateQueryParameters/updateQueryParameters.effect"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { setIsLoadingFile } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { setDelta, setFiles } from "../../state/store/files/files.actions"
import { ErrorDialogComponent } from "../../ui/dialogs/errorDialog/errorDialog.component"
import { buildHtmlMessage } from "../../util/loadFilesValidationToErrorDialog"
import { getNameDataPair } from "../loadFile/fileParser"
import { LoadFileService, NO_FILES_LOADED_ERROR_MESSAGE } from "../loadFile/loadFile.service"
import { UrlExtractor } from "./urlExtractor"
import { setCurrentFilesAreSampleFiles } from "../../state/store/appStatus/currentFilesAreSampleFiles/currentFilesAreSampleFiles.actions"
import { setShowOutgoingEdges } from "../../state/store/appSettings/showEdges/outgoing/showOutgoingEdges.actions"
import { setShowIncomingEdges } from "../../state/store/appSettings/showEdges/incoming/showIncomingEdges.actions"
import { setAttributeTypes } from "../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { setAttributeDescriptors } from "../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.action"
import { setBlacklist } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { setEdges } from "../../state/store/fileSettings/edges/edges.actions"
import { setMarkedPackages } from "../../state/store/fileSettings/markedPackages/markedPackages.actions"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setEdgeMetric } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setColorMode } from "../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { setSortingOption } from "../../state/store/dynamicSettings/sortingOption/sortingOption.actions"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setDistributionMetric } from "../../state/store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { setAllFocusedNodes } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { setSearchPattern } from "../../state/store/dynamicSettings/searchPattern/searchPattern.actions"
import { setMargin } from "../../state/store/dynamicSettings/margin/margin.actions"
import { setAmountOfTopLabels } from "../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setEdgeHeight } from "../../state/store/appSettings/edgeHeight/edgeHeight.actions"
import { setScaling } from "../../state/store/appSettings/scaling/scaling.actions"
import { setHideFlatBuildings } from "../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { setInvertHeight } from "../../state/store/appSettings/invertHeight/invertHeight.actions"
import { setInvertArea } from "../../state/store/appSettings/invertArea/invertArea.actions"
import { setIsWhiteBackground } from "../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { setPresentationMode } from "../../state/store/appSettings/isPresentationMode/isPresentationMode.actions"
import { setShowOnlyBuildingsWithEdges } from "../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import { setIsEdgeMetricVisible } from "../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"
import { setResetCameraIfNewFileIsLoaded } from "../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setShowMetricLabelNameValue } from "../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { setShowMetricLabelNodeName } from "../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { setLayoutAlgorithm } from "../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { setMaxTreeMapFiles } from "../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { setSharpnessMode } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { setExperimentalFeaturesEnabled } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setScreenshotToClipboardEnabled } from "../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.actions"
import { setColorLabels } from "../../state/store/appSettings/colorLabels/colorLabels.actions"
import { setIsColorMetricLinkedToHeightMetricAction } from "../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
import { setEnableFloorLabels } from "../../state/store/appSettings/enableFloorLabels/enableFloorLabels.actions"

export const sampleFile1 = { fileName: "sample1.cc.json", fileSize: 3 * 1024, content: sample1 as ExportCCFile }
export const sampleFile2 = { fileName: "sample2.cc.json", fileSize: 2 * 1024, content: sample2 as ExportCCFile }

@Injectable({ providedIn: "root" })
export class LoadInitialFileService {
    private readonly urlUtils = new UrlExtractor(this.httpClient)

    constructor(
        private readonly store: Store,
        private readonly state: State<CcState>,
        private readonly dialog: MatDialog,
        private readonly loadFileService: LoadFileService,
        private readonly httpClient: HttpClient
    ) {}

    async loadFilesOrSampleFiles() {
        const isFileQueryParameterPresent = this.checkFileQueryParameterPresent()
        await (isFileQueryParameterPresent ? this.loadFilesFromQueryParams() : this.loadFilesFromIndexedDB())
    }

    checkFileQueryParameterPresent() {
        return Boolean(this.urlUtils.getParameterByName("file"))
    }

    private async loadFilesFromQueryParams() {
        try {
            const urlNameDataPairs = await this.urlUtils.getFileDataFromQueryParam()
            const savedCcState = await readCcState()
            if (!savedCcState) {
                this.loadFileService.loadFiles(urlNameDataPairs)
                this.setRenderStateFromUrl()
                return
            }

            const savedFileStates = savedCcState.files
            const savedNameDataPairs = savedFileStates.map(fileState => getNameDataPair(fileState.file))
            const urlNameDataPairCheckSums = urlNameDataPairs.map(urlNameDataPair => urlNameDataPair.content.fileChecksum)
            const savedNameDataPairCheckSums = savedNameDataPairs.map(savedNameDataPair => savedNameDataPair.content.fileChecksum)
            if (stringify(urlNameDataPairCheckSums) === stringify(savedNameDataPairCheckSums)) {
                this.applySettingsAndFilesFromSavedState(savedFileStates, savedCcState, savedNameDataPairs)
            } else {
                this.applySettingsFromSavedState(savedCcState, urlNameDataPairs)
            }
            this.setRenderStateFromUrl()
        } catch (error) {
            await this.handleErrorLoadFilesFromQueryParams(error as Error)
        } finally {
            this.setMetricsFromUrl()
            this.setCurrentFilesAreSampleFilesFromUrl()
        }
    }

    private applySettingsAndFilesFromSavedState(savedFileStates: FileState[], savedCcState: CcState, savedNameDataPairs: NameDataPair[]) {
        const missingPropertiesInSavedCcState = []

        if (!savedCcState.appSettings.resetCameraIfNewFileIsLoaded) {
            this.store.dispatch({ type: "StartWithGlobalOption:resetCameraIfNewFileIsLoadedSetToFalse" })
        }
        const missingAppSettings = this.applyAppSettings(savedCcState.appSettings)
        missingPropertiesInSavedCcState.push(...missingAppSettings)

        this.loadFileService.loadFiles(savedNameDataPairs)
        this.store.dispatch(setFiles({ value: savedFileStates }))

        const missingFileSettings = this.applyFileSettings(savedCcState.fileSettings)
        missingPropertiesInSavedCcState.push(...missingFileSettings)
        const missingDynamicSettings = this.applyDynamicSettings(savedCcState.dynamicSettings)
        missingPropertiesInSavedCcState.push(...missingDynamicSettings)
        if (missingPropertiesInSavedCcState.length > 0) {
            this.showErrorDialogForMissingProperties(missingPropertiesInSavedCcState)
        }
    }

    private applySettingsFromSavedState(savedCcState: CcState, urlNameDataPairs: NameDataPair[]) {
        this.applyAllSettings(savedCcState)
        this.loadFileService.loadFiles(urlNameDataPairs)
    }

    private showErrorDialogForMissingProperties(missingPropertiesInSavedCcState) {
        const title = "The previous state could not be fully restored after loading the page. The following properties were not restored."
        const message = this.buildMissingPropertiesMessage(missingPropertiesInSavedCcState)
        this.showErrorDialog(title, message)
    }

    private async handleErrorLoadFilesFromQueryParams(error: Error) {
        if (error.message !== NO_FILES_LOADED_ERROR_MESSAGE) {
            const title = "File(s) could not be loaded from the given file URL parameter. Loaded sample files instead."
            const message = this.createTitleUrlErrorDialog(error)
            this.showErrorDialog(title, message)
        }
        await this.loadSampleFiles()
    }

    private async loadFilesFromIndexedDB() {
        try {
            const savedCcState = await readCcState()
            if (!savedCcState) {
                await this.loadSampleFiles()
                return
            }

            const savedFileStates = savedCcState.files
            const savedNameDataPairs = savedFileStates.map(fileState => getNameDataPair(fileState.file))
            this.applySettingsAndFilesFromSavedState(savedFileStates, savedCcState, savedNameDataPairs)
        } catch (error) {
            await this.handleErrorLoadFilesFromIndexedDB(error as Error)
        }
    }

    private async handleErrorLoadFilesFromIndexedDB(error: Error) {
        if (error.message !== NO_FILES_LOADED_ERROR_MESSAGE) {
            const title = "Previously loaded files and settings could not be restored. Loaded sample files instead."
            const message = error.message
            this.showErrorDialog(title, message)
        }
        await this.loadSampleFiles()
    }

    private async applyAllSettings(savedCcState: CcState) {
        const savedFileSettings = savedCcState.fileSettings
        const savedDynamicSettings = savedCcState.dynamicSettings
        const savedAppSettings = savedCcState.appSettings
        const missingPropertiesInSavedCcState = []
        if (savedFileSettings) {
            const missingFileSettings = this.applyFileSettings(savedFileSettings)
            missingPropertiesInSavedCcState.push(...missingFileSettings)
        }
        if (savedDynamicSettings) {
            const missingDynamicSettings = this.applyDynamicSettings(savedDynamicSettings)
            missingPropertiesInSavedCcState.push(...missingDynamicSettings)
        }
        if (savedAppSettings) {
            const missingAppSettings = this.applyAppSettings(savedAppSettings)
            missingPropertiesInSavedCcState.push(...missingAppSettings)
        }
        if (missingPropertiesInSavedCcState.length > 0) {
            this.showErrorDialogForMissingProperties(missingPropertiesInSavedCcState)
        }
    }

    private applyFileSettings(savedFileSettings: FileSettings) {
        const currentFileSettings = (this.state.getValue() as CcState).fileSettings
        const missingFileSettings = []
        for (const [key, value] of Object.entries(currentFileSettings)) {
            if (!(key in savedFileSettings)) {
                missingFileSettings.push(key)
            } else {
                const currentValue = stringify(value)
                const loadedValue = stringify(savedFileSettings[key])
                if (currentValue !== loadedValue) {
                    this.mapFileSettingToAction(key as keyof FileSettings, savedFileSettings[key])
                }
            }
        }
        return missingFileSettings
    }

    private applyDynamicSettings(savedDynamicSettings: DynamicSettings) {
        const currentDynamicSettings = (this.state.getValue() as CcState).dynamicSettings
        const missingDynamicSettings = []
        for (const [key, value] of Object.entries(currentDynamicSettings)) {
            if (!(key in savedDynamicSettings)) {
                missingDynamicSettings.push(key)
            } else {
                const currentValue = stringify(value)
                const loadedValue = stringify(savedDynamicSettings[key])
                if (currentValue !== loadedValue) {
                    this.mapDynamicSettingToAction(key as keyof DynamicSettings, savedDynamicSettings[key])
                }
            }
        }
        return missingDynamicSettings
    }

    private applyAppSettings(savedAppSettings: AppSettings) {
        const currentAppSettings = (this.state.getValue() as CcState).appSettings
        const missingAppSettings = []
        for (const [key, value] of Object.entries(currentAppSettings)) {
            if (!(key in savedAppSettings)) {
                missingAppSettings.push(key)
            } else {
                const currentValue = stringify(value)
                const loadedValue = stringify(savedAppSettings[key])
                if (currentValue !== loadedValue) {
                    this.mapAppSettingToAction(key as keyof AppSettings, savedAppSettings[key])
                }
            }
        }
        return missingAppSettings
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
                throw new Error(`Unhandled key: ${key}`)
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
                throw new Error(`Unhandled key: ${key}`)
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
            case "showIncomingEdges":
                this.store.dispatch(setShowIncomingEdges({ value }))
                break
            case "showOutgoingEdges":
                this.store.dispatch(setShowOutgoingEdges({ value }))
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
                this.store.dispatch(setIsLoadingMap({ value }))
                break
            case "isLoadingFile":
                this.store.dispatch(setIsLoadingFile({ value }))
                break
            case "sortingOrderAscending":
            case "isSearchPanelPinned":
                // ignore settings for the file-explorer
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
                throw new Error(`Unhandled key: ${key}`)
            }
        }
    }

    private buildMissingPropertiesMessage(missingPropertiesInSavedCcState: string[]) {
        const warningSymbol = '<i class="fa fa-exclamation-triangle"></i> '
        return `${buildHtmlMessage(warningSymbol, missingPropertiesInSavedCcState)}`
    }

    private async loadSampleFiles() {
        try {
            const savedCcState = await readCcState()
            if (savedCcState) {
                this.applyAllSettings(savedCcState)
            }
            this.loadFileService.loadFiles([sampleFile1, sampleFile2])
        } catch {
            this.loadFileService.loadFiles([sampleFile1, sampleFile2])
        }
        this.store.dispatch(setCurrentFilesAreSampleFiles({ value: true }))
    }

    private showErrorDialog(title: string, message: string) {
        this.dialog.open(ErrorDialogComponent, {
            data: { title, message }
        })
    }

    private createTitleUrlErrorDialog(error: Error & { statusText?: string; status?: number }) {
        let title = "Error"
        if (error.message) {
            title += ` (${error.message})`
        } else if (error.statusText && error.status) {
            title += ` (${error.status}: ${error.statusText})`
        }
        return title
    }

    setMetricsFromUrl() {
        const areaMetric = this.urlUtils.getParameterByName(MetricQueryParemter.areaMetric)
        const heightMetric = this.urlUtils.getParameterByName(MetricQueryParemter.heightMetric)
        const colorMetric = this.urlUtils.getParameterByName(MetricQueryParemter.colorMetric)
        const edgeMetric = this.urlUtils.getParameterByName(MetricQueryParemter.edgeMetric)

        const state = this.state.getValue() as CcState
        const nodeMetricData = metricDataSelector(state).nodeMetricData
        const edgeMetricData = metricDataSelector(state).edgeMetricData
        if (!nodeMetricData) {
            return
        }

        const nodeMetricNames = new Set(nodeMetricData.map(nodeMetric => nodeMetric.name))
        const edgeMetricNames = edgeMetricData.map(edgeMetric => edgeMetric.name)

        if (areaMetric && nodeMetricNames.has(areaMetric)) {
            this.store.dispatch(setAreaMetric({ value: areaMetric }))
        }
        if (heightMetric && nodeMetricNames.has(heightMetric)) {
            this.store.dispatch(setHeightMetric({ value: heightMetric }))
        }
        if (colorMetric && nodeMetricNames.has(colorMetric)) {
            this.store.dispatch(setColorMetric({ value: colorMetric }))
        }
        if (edgeMetric && edgeMetricNames.includes(edgeMetric)) {
            this.store.dispatch(setEdgeMetric({ value: edgeMetric }))
        }
    }

    // TODO: Please make sure that this function works fine on Github pages with
    //  the updated file selection (no more single mode!)
    setRenderStateFromUrl() {
        const renderState = this.urlUtils.getParameterByName("mode")
        const files = getCCFiles(this.state.getValue().files)

        if (renderState === "Delta" && files.length >= 2) {
            this.store.dispatch(setDelta({ referenceFile: files[0], comparisonFile: files[1] }))
        }
    }

    private setCurrentFilesAreSampleFilesFromUrl() {
        const currentFilesAreSampleFiles = this.urlUtils.getParameterByName(MetricQueryParemter.currentFilesAreSampleFiles)
        if (currentFilesAreSampleFiles && currentFilesAreSampleFiles === "true") {
            this.store.dispatch(setCurrentFilesAreSampleFiles({ value: true }))
        }
    }
}
