import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import stringify from "safe-stable-stringify"
import { CcState, DependencyLensSource, MapState, MetricsLensSource, Preferences, SharedView, Sorting } from "../codeCharta.model"
import { FileState } from "../model/files/files"
import { getCCFiles } from "../model/files/files.helper"
import { metricDataSelector } from "../renderModel/renderModel.facade"
import { setDelta, setFiles } from "../fileStore/store/files.actions"
import { setCurrentFilesAreSampleFiles } from "../fileStore/store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.actions"
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
    setShowOutgoingEdges,
    setAreaMetric,
    setHeightMetric,
    setEdgeMetric,
    setColorMetric,
    setDistributionMetric
} from "../mapState/mapState.write.facade"
import { setAttributeTypes, setAttributeDescriptors } from "../lenses/metrics/metricsLens.load.facade"
import { setEdgeAttributeTypes } from "../lenses/dependency/dependencyLens.load.facade"
import { setBlacklist, setMarkedPackages, setAllFocusedNodes, setSearchPattern } from "../sharedView/sharedView.write.facade"
import {
    setSortingOption,
    setPresentationMode,
    setResetCameraIfNewFileIsLoaded,
    setMaxTreeMapFiles,
    setExperimentalFeaturesEnabled,
    setScreenshotToClipboardEnabled,
    setIsColorMetricLinkedToHeightMetricAction
} from "../preferences/preferences.write.facade"

@Injectable({ providedIn: "root" })
export class LoadInitialFileStore {
    private static readonly optionalMapStateKeys = new Set(["labelMode", "groupLabelCollisions", "labelSize", "labelsPerMap"])

    // runtime-only map flag; never restored from a previous session's persisted state.
    private static readonly ignoredMapStateKeys = new Set<keyof MapState>(["isLoadingMap"])

    // transient interaction ids (Slice 14e-1 moved them mapState → sharedView); never restored from a
    // previous session's persisted state — the mapState applier no-op'd them before, sharedView must too.
    private static readonly ignoredSharedViewKeys = new Set<keyof SharedView>([
        "hoveredNodeId",
        "selectedBuildingId",
        "rightClickedNodeData"
    ])

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

    applyPreferences(savedPreferences: Preferences) {
        const currentPreferences = (this.state.getValue() as CcState).preferences
        const missingPreferences = []
        for (const [key, value] of Object.entries(currentPreferences)) {
            if (key in savedPreferences) {
                const currentValue = stringify(value)
                const loadedValue = stringify(savedPreferences[key])
                if (currentValue !== loadedValue) {
                    this.mapPreferenceToAction(key as keyof Preferences, savedPreferences[key])
                }
            } else {
                missingPreferences.push(key)
            }
        }
        return missingPreferences
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

    applyDependencyLensSource(savedDependencyLensSource: DependencyLensSource) {
        const currentDependencyLensSource = (this.state.getValue() as CcState).dependencyLensSource
        const missingDependencyLensSource = []
        for (const [key, value] of Object.entries(currentDependencyLensSource)) {
            if (key in savedDependencyLensSource) {
                const currentValue = stringify(value)
                const loadedValue = stringify(savedDependencyLensSource[key])
                if (currentValue !== loadedValue) {
                    this.mapDependencyLensSourceToAction(key as keyof DependencyLensSource, savedDependencyLensSource[key])
                }
            } else {
                missingDependencyLensSource.push(key)
            }
        }
        return missingDependencyLensSource
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

    private mapDependencyLensSourceToAction(key: keyof DependencyLensSource, value: any) {
        if (key === "attributeTypes") {
            this.store.dispatch(setEdgeAttributeTypes({ value }))
            return
        }
        throw new Error(`Unhandled key: ${key}`)
    }

    private mapSharedViewToAction(key: keyof SharedView, value: any) {
        if (LoadInitialFileStore.ignoredSharedViewKeys.has(key)) {
            return
        }
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
            case "markedPackages":
                this.store.dispatch(setMarkedPackages({ value }))
                break
            default: {
                throw new Error(`Unhandled key: ${key}`)
            }
        }
    }

    private mapPreferenceToAction(key: keyof Preferences, value: any) {
        switch (key) {
            case "isPresentationMode":
                this.store.dispatch(setPresentationMode({ value }))
                break
            case "resetCameraIfNewFileIsLoaded":
                this.store.dispatch(setResetCameraIfNewFileIsLoaded({ value }))
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
            case "sorting": {
                // A loaded state may carry a sort option (restored) but the sort *order* is a pure
                // file-explorer UI preference that a loaded file must not override — mirrors the
                // pre-Slice-10c split where sortingOption was applied on load and sortingOrderAscending
                // was ignored.
                const sorting = value as Sorting
                if (sorting?.option !== undefined) {
                    this.store.dispatch(setSortingOption({ value: sorting.option }))
                }
                break
            }
            default: {
                throw new Error(`Unhandled key: ${key}`)
            }
        }
    }

    private mapMapStateToAction(key: keyof MapState, value: any) {
        if (LoadInitialFileStore.ignoredMapStateKeys.has(key)) {
            return
        }
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
            default: {
                throw new Error(`Unhandled key: ${key}`)
            }
        }
    }
}
