import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import stringify from "safe-stable-stringify"
import {
    DependencyLensSource,
    DomainLensSource,
    MapState,
    MetricsLensSource,
    Preferences,
    SharedView,
    Sorting
} from "../model/codeCharta.model"
import { FileState } from "../model/files/files"
import { getCCFiles } from "../model/files/files.helper"
import { WordCloudSettings } from "../model/wordCloud.model"
import { DependencyLensSourceReadWindow } from "../stores/dependencyLensSource/dependencyLensSource.read.facade"
import { setEdgeAttributeTypes } from "../stores/dependencyLensSource/dependencyLensSource.write.facade"
import { DomainLensSourceReadWindow } from "../stores/domainLensSource/domainLensSource.read.facade"
import { setDomainWords } from "../stores/domainLensSource/domainLensSource.write.facade"
import { DomainStateReadWindow } from "../stores/domainState/domainState.read.facade"
import {
    setDomainStateDrawOutOfBound,
    setDomainStateGridSize,
    setDomainStateRotationRange,
    setDomainStateRotationStep,
    setDomainStateShape,
    setDomainStateShrinkToFit,
    setDomainStateSizeRange,
    setDomainStateSizingMode,
    setDomainStateTopN
} from "../stores/domainState/domainState.write.facade"
import { FileStoreReadWindow, setCurrentFilesAreSampleFiles, setDelta, setFiles } from "../stores/fileStore/fileStore.facade"
import { MapStateReadWindow } from "../stores/mapState/mapState.read.facade"
import {
    setAmountOfEdgePreviews,
    setAmountOfTopLabels,
    setAreaMetric,
    setColorLabels,
    setColorMetric,
    setColorMode,
    setColorRange,
    setDistributionMetric,
    setEdgeHeight,
    setEdgeMetric,
    setEnableFloorLabels,
    setGroupLabelCollisions,
    setHeightMetric,
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
} from "../stores/mapState/mapState.write.facade"
import { MetricsLensSourceReadWindow } from "../stores/metricsLensSource/metricsLensSource.read.facade"
import { setAttributeDescriptors, setAttributeTypes } from "../stores/metricsLensSource/metricsLensSource.write.facade"
import { PreferencesReadWindow } from "../stores/preferences/preferences.read.facade"
import {
    setExperimentalFeaturesEnabled,
    setIsColorMetricLinkedToHeightMetricAction,
    setMaxTreeMapFiles,
    setPresentationMode,
    setResetCameraIfNewFileIsLoaded,
    setScreenshotToClipboardEnabled,
    setSortingOption
} from "../stores/preferences/preferences.write.facade"
import { SharedViewReadWindow } from "../stores/sharedView/sharedView.read.facade"
import { setAllFocusedNodes, setBlacklist, setMarkedPackages, setSearchPattern } from "../stores/sharedView/sharedView.write.facade"

@Injectable({ providedIn: "root" })
export class LoadInitialFileStore {
    private static readonly noOptionalKeys: ReadonlySet<string> = new Set()

    private static readonly optionalMapStateKeys = new Set(["labelMode", "groupLabelCollisions", "labelSize", "labelsPerMap"])

    // transient interaction ids; never restored from a previous session's persisted state.
    private static readonly ignoredSharedViewKeys = new Set<keyof SharedView>([
        "hoveredNodeId",
        "selectedBuildingId",
        "rightClickedNodeData"
    ])

    constructor(
        private readonly store: Store,
        private readonly preferencesReadWindow: PreferencesReadWindow,
        private readonly metricsLensSourceReadWindow: MetricsLensSourceReadWindow,
        private readonly dependencyLensSourceReadWindow: DependencyLensSourceReadWindow,
        private readonly domainLensSourceReadWindow: DomainLensSourceReadWindow,
        private readonly domainStateReadWindow: DomainStateReadWindow,
        private readonly sharedViewReadWindow: SharedViewReadWindow,
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly fileStoreReadWindow: FileStoreReadWindow
    ) {}

    setFiles(value: FileState[]) {
        this.store.dispatch(setFiles({ value }))
    }

    setCurrentFilesAreSampleFiles(value: boolean) {
        this.store.dispatch(setCurrentFilesAreSampleFiles({ value }))
    }

    applyPreferences(savedPreferences: Preferences) {
        return this.applySlice(this.preferencesReadWindow.getPreferences(), savedPreferences, (key, value) =>
            this.mapPreferenceToAction(key, value)
        )
    }

    applyMetricsLensSource(savedMetricsLensSource: MetricsLensSource) {
        return this.applySlice(this.metricsLensSourceReadWindow.getMetricsLensSource(), savedMetricsLensSource, (key, value) =>
            this.mapMetricsLensSourceToAction(key, value)
        )
    }

    applyDependencyLensSource(savedDependencyLensSource: DependencyLensSource) {
        return this.applySlice(this.dependencyLensSourceReadWindow.getDependencyLensSource(), savedDependencyLensSource, (key, value) =>
            this.mapDependencyLensSourceToAction(key, value)
        )
    }

    applyDomainLensSource(savedDomainLensSource: DomainLensSource) {
        return this.applySlice(this.domainLensSourceReadWindow.getDomainLensSource(), savedDomainLensSource, (key, value) =>
            this.mapDomainLensSourceToAction(key, value)
        )
    }

    applySharedView(savedSharedView: SharedView) {
        return this.applySlice(this.sharedViewReadWindow.getSharedView(), savedSharedView, (key, value) =>
            this.mapSharedViewToAction(key, value)
        )
    }

    applyMapState(savedMapState: MapState) {
        return this.applySlice(
            this.mapStateReadWindow.getMapState(),
            savedMapState,
            (key, value) => this.mapMapStateToAction(key, value),
            LoadInitialFileStore.optionalMapStateKeys
        )
    }

    applyDomainState(savedDomainState: WordCloudSettings) {
        return this.applySlice(this.domainStateReadWindow.getDomainState(), savedDomainState, (key, value) =>
            this.mapDomainStateToAction(key, value)
        )
    }

    missingKeysOfSharedView(savedSharedView: SharedView): string[] {
        return this.missingKeysOf(this.sharedViewReadWindow.getSharedView(), savedSharedView)
    }

    missingKeysOfMetricsLensSource(savedMetricsLensSource: MetricsLensSource): string[] {
        return this.missingKeysOf(this.metricsLensSourceReadWindow.getMetricsLensSource(), savedMetricsLensSource)
    }

    missingKeysOfDependencyLensSource(savedDependencyLensSource: DependencyLensSource): string[] {
        return this.missingKeysOf(this.dependencyLensSourceReadWindow.getDependencyLensSource(), savedDependencyLensSource)
    }

    missingKeysOfDomainLensSource(savedDomainLensSource: DomainLensSource): string[] {
        return this.missingKeysOf(this.domainLensSourceReadWindow.getDomainLensSource(), savedDomainLensSource)
    }

    /** Which keys of the current slice the persisted one does not have at all. Dispatches nothing. */
    private missingKeysOf<Slice extends object>(currentSlice: Slice, savedSlice: Slice): string[] {
        return Object.keys(currentSlice).filter(key => !(key in savedSlice))
    }

    /**
     * Restores one persisted slice onto the current one: every key of the CURRENT slice whose persisted
     * value differs is dispatched through the slice's own mapper, and every key the persisted slice does
     * not have at all is reported back as missing, for the "could not be fully restored" dialog.
     *
     * Iterating the CURRENT slice's keys — not the persisted ones — is what makes an older persisted
     * state forward-compatible: a key added since it was written is simply left at its default.
     */
    private applySlice<Slice extends object>(
        currentSlice: Slice,
        savedSlice: Slice,
        dispatchKey: (key: keyof Slice, value: Slice[keyof Slice]) => void,
        optionalKeys: ReadonlySet<string> = LoadInitialFileStore.noOptionalKeys
    ): string[] {
        const missingKeys: string[] = []

        for (const [key, currentValue] of Object.entries(currentSlice)) {
            if (!(key in savedSlice)) {
                if (!optionalKeys.has(key)) {
                    missingKeys.push(key)
                }
                continue
            }
            const savedValue = savedSlice[key]
            if (stringify(currentValue) !== stringify(savedValue)) {
                dispatchKey(key as keyof Slice, savedValue)
            }
        }

        return missingKeys
    }

    setRenderState(renderState: string) {
        const files = getCCFiles(this.fileStoreReadWindow.getFiles())
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

    private mapDomainLensSourceToAction(key: keyof DomainLensSource, value: any) {
        if (key === "words") {
            this.store.dispatch(setDomainWords({ value }))
            return
        }
        throw new Error(`Unhandled key: ${key}`)
    }

    private mapDomainStateToAction(key: keyof WordCloudSettings, value: any) {
        switch (key) {
            case "shape":
                this.store.dispatch(setDomainStateShape({ value }))
                break
            case "sizeRange":
                this.store.dispatch(setDomainStateSizeRange({ value }))
                break
            case "rotationRange":
                this.store.dispatch(setDomainStateRotationRange({ value }))
                break
            case "rotationStep":
                this.store.dispatch(setDomainStateRotationStep({ value }))
                break
            case "gridSize":
                this.store.dispatch(setDomainStateGridSize({ value }))
                break
            case "sizingMode":
                this.store.dispatch(setDomainStateSizingMode({ value }))
                break
            case "topN":
                this.store.dispatch(setDomainStateTopN({ value }))
                break
            case "shrinkToFit":
                this.store.dispatch(setDomainStateShrinkToFit({ value }))
                break
            case "drawOutOfBound":
                this.store.dispatch(setDomainStateDrawOutOfBound({ value }))
                break
            default: {
                throw new Error(`Unhandled key: ${key}`)
            }
        }
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
