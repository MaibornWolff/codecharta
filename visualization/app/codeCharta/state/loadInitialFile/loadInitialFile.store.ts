import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import stringify from "safe-stable-stringify"
import { AppSettings, CcState, DynamicSettings, FileSettings, MapState, MetricsLensSource, SharedView } from "../../codeCharta.model"
import { FileState } from "../../model/files/files"
import { getCCFiles } from "../../model/files/files.helper"
import { metricDataSelector } from "../selectors/accumulatedData/metricData/metricData.selector"
import { setDelta, setFiles } from "../../fileStore/store/files.actions"
import { setCurrentFilesAreSampleFiles } from "../store/appStatus/currentFilesAreSampleFiles/currentFilesAreSampleFiles.actions"
import {
    setAmountOfEdgePreviews,
    setAmountOfTopLabels,
    setColorLabels,
    setColorMode,
    setColorRange,
    setEdgeHeight,
    setEnableFloorLabels,
    setGroupLabelCollisions,
    setHideFlatBuildings,
    setInvertArea,
    setInvertHeight,
    setIsEdgeMetricVisible,
    setIsWhiteBackground,
    setLabelMode,
    setLabelSize,
    setLabelsPerMap,
    setLayoutAlgorithm,
    setMapColors,
    setMargin,
    setScaling,
    setShowIncomingEdges,
    setShowMetricLabelNameValue,
    setShowMetricLabelNodeName,
    setShowOnlyBuildingsWithEdges,
    setShowOutgoingEdges
} from "../../mapState/mapState.facade"
import { setAttributeTypes, setAttributeDescriptors } from "../../lenses/metrics/metricsLens.load.facade"
import { setBlacklist } from "../../sharedView/sharedView.facade"
import { setEdges } from "../store/fileSettings/edges/edges.actions"
import { setMarkedPackages } from "../store/fileSettings/markedPackages/markedPackages.actions"
import { setAreaMetric, setHeightMetric, setEdgeMetric, setColorMetric, setDistributionMetric } from "../../mapState/mapState.facade"
import { setSortingOption } from "../store/dynamicSettings/sortingOption/sortingOption.actions"
import { setAllFocusedNodes } from "../../sharedView/sharedView.facade"
import { setSearchPattern } from "../../sharedView/sharedView.facade"
import { setPresentationMode } from "../store/appSettings/isPresentationMode/isPresentationMode.actions"
import { setResetCameraIfNewFileIsLoaded } from "../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setMaxTreeMapFiles } from "../store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { setExperimentalFeaturesEnabled } from "../store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setScreenshotToClipboardEnabled } from "../store/appSettings/enableClipboard/screenshotToClipboardEnabled.actions"
import { setIsColorMetricLinkedToHeightMetricAction } from "../store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"

@Injectable({ providedIn: "root" })
export class LoadInitialFileStore {
    private static readonly optionalMapStateKeys = new Set(["labelMode", "groupLabelCollisions", "labelSize", "labelsPerMap"])

    constructor(
        private readonly store: Store,
        private readonly state: State<CcState>
    ) {}

    setFiles(value: FileState[]) {
        this.store.dispatch(setFiles({ value }))
    }

    setCurrentFilesAreSampleFiles(value: boolean) {
        this.store.dispatch(setCurrentFilesAreSampleFiles({ value }))
    }

    dispatchResetCameraIfNewFileIsLoadedToFalse() {
        this.store.dispatch({ type: "StartWithGlobalOption:resetCameraIfNewFileIsLoadedSetToFalse" })
    }

    applyFileSettings(savedFileSettings: FileSettings) {
        const currentFileSettings = (this.state.getValue() as CcState).fileSettings
        const missingFileSettings = []
        for (const [key, value] of Object.entries(currentFileSettings)) {
            if (key in savedFileSettings) {
                const currentValue = stringify(value)
                const loadedValue = stringify(savedFileSettings[key])
                if (currentValue !== loadedValue) {
                    this.mapFileSettingToAction(key as keyof FileSettings, savedFileSettings[key])
                }
            } else {
                missingFileSettings.push(key)
            }
        }
        return missingFileSettings
    }

    applyDynamicSettings(savedDynamicSettings: DynamicSettings) {
        const currentDynamicSettings = (this.state.getValue() as CcState).dynamicSettings
        const missingDynamicSettings = []
        for (const [key, value] of Object.entries(currentDynamicSettings)) {
            if (key in savedDynamicSettings) {
                const currentValue = stringify(value)
                const loadedValue = stringify(savedDynamicSettings[key])
                if (currentValue !== loadedValue) {
                    this.mapDynamicSettingToAction(key as keyof DynamicSettings, savedDynamicSettings[key])
                }
            } else {
                missingDynamicSettings.push(key)
            }
        }
        return missingDynamicSettings
    }

    applyMetricsLensSource(savedMetricsLensSource: MetricsLensSource) {
        const currentMetricsLensSource = (this.state.getValue() as CcState).metricsLensSource
        const missingMetricsLensSource = []
        for (const [key, value] of Object.entries(currentMetricsLensSource)) {
            if (key in savedMetricsLensSource) {
                const currentValue = stringify(value)
                const loadedValue = stringify(savedMetricsLensSource[key])
                if (currentValue !== loadedValue) {
                    this.mapMetricsLensSourceToAction(key as keyof MetricsLensSource, savedMetricsLensSource[key])
                }
            } else {
                missingMetricsLensSource.push(key)
            }
        }
        return missingMetricsLensSource
    }

    applySharedView(savedSharedView: SharedView) {
        const currentSharedView = (this.state.getValue() as CcState).sharedView
        const missingSharedView = []
        for (const [key, value] of Object.entries(currentSharedView)) {
            if (key in savedSharedView) {
                const currentValue = stringify(value)
                const loadedValue = stringify(savedSharedView[key])
                if (currentValue !== loadedValue) {
                    this.mapSharedViewToAction(key as keyof SharedView, savedSharedView[key])
                }
            } else {
                missingSharedView.push(key)
            }
        }
        return missingSharedView
    }

    applyAppSettings(savedAppSettings: AppSettings) {
        const currentAppSettings = (this.state.getValue() as CcState).appSettings
        const missingAppSettings = []
        for (const [key, value] of Object.entries(currentAppSettings)) {
            if (key in savedAppSettings) {
                const currentValue = stringify(value)
                const loadedValue = stringify(savedAppSettings[key])
                if (currentValue !== loadedValue) {
                    this.mapAppSettingToAction(key as keyof AppSettings, savedAppSettings[key])
                }
            } else {
                missingAppSettings.push(key)
            }
        }
        return missingAppSettings
    }

    applyMapState(savedMapState: MapState) {
        const currentMapState = (this.state.getValue() as CcState).mapState
        const missingMapState = []
        for (const [key, value] of Object.entries(currentMapState)) {
            if (key in savedMapState) {
                const currentValue = stringify(value)
                const loadedValue = stringify(savedMapState[key])
                if (currentValue !== loadedValue) {
                    this.mapMapStateToAction(key as keyof MapState, savedMapState[key])
                }
            } else if (!LoadInitialFileStore.optionalMapStateKeys.has(key)) {
                missingMapState.push(key)
            }
        }
        return missingMapState
    }

    setMetricsFromUrlValues(areaMetric: string, heightMetric: string, colorMetric: string, edgeMetric: string) {
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

    setRenderState(renderState: string) {
        const files = getCCFiles(this.state.getValue().files)
        if (renderState === "Delta" && files.length >= 2) {
            this.store.dispatch(setDelta({ referenceFile: files[0], comparisonFile: files[1] }))
        }
    }

    private mapFileSettingToAction(key: keyof FileSettings, value: any) {
        switch (key) {
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

    private mapMetricsLensSourceToAction(key: keyof MetricsLensSource, value: any) {
        switch (key) {
            case "attributeTypes":
                this.store.dispatch(setAttributeTypes({ value }))
                break
            case "attributeDescriptors":
                this.store.dispatch(setAttributeDescriptors({ value }))
                break
            default: {
                throw new Error(`Unhandled key: ${key}`)
            }
        }
    }

    private mapDynamicSettingToAction(key: keyof DynamicSettings, value: any) {
        switch (key) {
            case "sortingOption":
                this.store.dispatch(setSortingOption({ value }))
                break
            default: {
                throw new Error(`Unhandled key: ${key}`)
            }
        }
    }

    private mapSharedViewToAction(key: keyof SharedView, value: any) {
        switch (key) {
            case "focusedNodePath":
                this.store.dispatch(setAllFocusedNodes({ value }))
                break
            case "searchPattern":
                this.store.dispatch(setSearchPattern({ value }))
                break
            case "blacklist":
                this.store.dispatch(setBlacklist({ value }))
                break
            default: {
                throw new Error(`Unhandled key: ${key}`)
            }
        }
    }

    private mapAppSettingToAction(key: keyof AppSettings, value: any) {
        switch (key) {
            case "isPresentationMode":
                this.store.dispatch(setPresentationMode({ value }))
                break
            case "resetCameraIfNewFileIsLoaded":
                this.store.dispatch(setResetCameraIfNewFileIsLoaded({ value }))
                break
            case "isLoadingFile":
                // runtime-only flag; restoring it from a previous session's persisted state
                // would briefly flash the spinner off mid-boot. Ignore.
                break
            case "sortingOrderAscending":
                // ignore settings for the file-explorer
                break
            case "maxTreeMapFiles":
                this.store.dispatch(setMaxTreeMapFiles({ value }))
                break
            case "experimentalFeaturesEnabled":
                this.store.dispatch(setExperimentalFeaturesEnabled({ value }))
                break
            case "screenshotToClipboardEnabled":
                this.store.dispatch(setScreenshotToClipboardEnabled({ value }))
                break
            case "isColorMetricLinkedToHeightMetric":
                this.store.dispatch(setIsColorMetricLinkedToHeightMetricAction({ value }))
                break
            default: {
                throw new Error(`Unhandled key: ${key}`)
            }
        }
    }

    private mapMapStateToAction(key: keyof MapState, value: any) {
        switch (key) {
            case "amountOfTopLabels":
                this.store.dispatch(setAmountOfTopLabels({ value }))
                break
            case "labelSize":
                this.store.dispatch(setLabelSize({ value }))
                break
            case "amountOfEdgePreviews":
                this.store.dispatch(setAmountOfEdgePreviews({ value }))
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
            case "showMetricLabelNameValue":
                this.store.dispatch(setShowMetricLabelNameValue({ value }))
                break
            case "showMetricLabelNodeName":
                this.store.dispatch(setShowMetricLabelNodeName({ value }))
                break
            case "colorLabels":
                this.store.dispatch(setColorLabels({ value }))
                break
            case "enableFloorLabels":
                this.store.dispatch(setEnableFloorLabels({ value }))
                break
            case "labelMode":
                this.store.dispatch(setLabelMode({ value }))
                break
            case "groupLabelCollisions":
                this.store.dispatch(setGroupLabelCollisions({ value }))
                break
            case "labelsPerMap":
                this.store.dispatch(setLabelsPerMap({ value }))
                break
            case "colorMode":
                this.store.dispatch(setColorMode({ value }))
                break
            case "colorRange":
                this.store.dispatch(setColorRange({ value }))
                break
            case "margin":
                this.store.dispatch(setMargin({ value }))
                break
            case "layoutAlgorithm":
                this.store.dispatch(setLayoutAlgorithm({ value }))
                break
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
            case "distributionMetric":
                this.store.dispatch(setDistributionMetric({ value }))
                break
            case "isLoadingMap":
            case "hoveredNodeId":
            case "selectedBuildingId":
            case "rightClickedNodeData":
                // runtime-only map flag + transient interaction ids; never restored from a
                // previous session's persisted state (appStatus was never applied on load).
                break
            default: {
                throw new Error(`Unhandled key: ${key}`)
            }
        }
    }
}
