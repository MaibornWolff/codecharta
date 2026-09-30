import { Action } from "@ngrx/store"
import {
    DependencyLensSource,
    DomainLensSource,
    DomainState,
    MapState,
    MetricsLensSource,
    Preferences,
    SharedView,
    Sorting
} from "../model/codeCharta.model"
import { setEdgeAttributeTypes } from "../stores/dependencyLensSource/dependencyLensSource.write.facade"
import { setDomainWords } from "../stores/domainLensSource/domainLensSource.write.facade"
import {
    setDomainStateDrawOutOfBound,
    setDomainStateGridSize,
    setDomainStateHiddenWords,
    setDomainStateRotationRange,
    setDomainStateRotationStep,
    setDomainStateSearchPattern,
    setDomainStateShape,
    setDomainStateShrinkToFit,
    setDomainStateSizeRange,
    setDomainStateSizingMode,
    setDomainStateSortingOrder,
    setDomainStateSortingOrderAscending,
    setDomainStateTopN
} from "../stores/domainState/domainState.write.facade"
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
import { setAttributeDescriptors, setAttributeTypes } from "../stores/metricsLensSource/metricsLensSource.write.facade"
import {
    setCenterMapZoom,
    setExperimentalFeaturesEnabled,
    setIsColorMetricLinkedToHeightMetricAction,
    setMaxTreeMapFiles,
    setPresentationMode,
    setRadialFolderStyle,
    setRadialFolderTint,
    setRadialFolderValue,
    setRadialLevels,
    setResetCameraIfNewFileIsLoaded,
    setScreenshotToClipboardEnabled,
    setSortingOption
} from "../stores/preferences/preferences.write.facade"
import {
    setAllFocusedNodes,
    setExcludedNodes,
    setFlattenedNodes,
    setMarkedPackages,
    setMetricRules,
    setSearchPattern
} from "../stores/sharedView/sharedView.write.facade"

export type SettingActionCreators<Slice> = {
    readonly [Key in keyof Slice]-?: (props: { value: Slice[Key] }) => Action | undefined
}

// Transient interaction state: never restored, so a persisted blob without it is complete.
export const ignoredSharedViewKeys = [
    "hoveredNodePath",
    "hoveredFileExtensions",
    "keptHighlightPaths",
    "selectedNodePath",
    "rightClickedNodeData"
] as const satisfies readonly (keyof SharedView)[]

type RestoredSharedView = Omit<SharedView, (typeof ignoredSharedViewKeys)[number]>

// A loaded state restores the sort option, but the sort order is a file-explorer UI preference a loaded file must not override.
const restoreSortingOptionOnly = ({ value }: { value: Sorting }) =>
    value?.option === undefined ? undefined : setSortingOption({ value: value.option })

export const metricsLensSourceActions: SettingActionCreators<MetricsLensSource> = {
    attributeTypes: setAttributeTypes,
    attributeDescriptors: setAttributeDescriptors
}

export const dependencyLensSourceActions: SettingActionCreators<DependencyLensSource> = {
    attributeTypes: setEdgeAttributeTypes
}

export const domainLensSourceActions: SettingActionCreators<DomainLensSource> = {
    words: setDomainWords
}

export const domainStateActions: SettingActionCreators<DomainState> = {
    shape: setDomainStateShape,
    sortingOrder: setDomainStateSortingOrder,
    sortingOrderAscending: setDomainStateSortingOrderAscending,
    searchPattern: setDomainStateSearchPattern,
    hiddenWords: setDomainStateHiddenWords,
    sizeRange: setDomainStateSizeRange,
    rotationRange: setDomainStateRotationRange,
    rotationStep: setDomainStateRotationStep,
    gridSize: setDomainStateGridSize,
    sizingMode: setDomainStateSizingMode,
    topN: setDomainStateTopN,
    shrinkToFit: setDomainStateShrinkToFit,
    drawOutOfBound: setDomainStateDrawOutOfBound
}

export const sharedViewActions: SettingActionCreators<RestoredSharedView> = {
    focusedNodePath: setAllFocusedNodes,
    searchPattern: setSearchPattern,
    excludedNodes: setExcludedNodes,
    flattenedNodes: setFlattenedNodes,
    markedPackages: setMarkedPackages,
    metricRules: setMetricRules
}

export const preferencesActions: SettingActionCreators<Preferences> = {
    isPresentationMode: setPresentationMode,
    resetCameraIfNewFileIsLoaded: setResetCameraIfNewFileIsLoaded,
    centerMapZoom: setCenterMapZoom,
    maxTreeMapFiles: setMaxTreeMapFiles,
    experimentalFeaturesEnabled: setExperimentalFeaturesEnabled,
    screenshotToClipboardEnabled: setScreenshotToClipboardEnabled,
    isColorMetricLinkedToHeightMetric: setIsColorMetricLinkedToHeightMetricAction,
    sorting: restoreSortingOptionOnly,
    radialFolderValue: setRadialFolderValue,
    radialFolderStyle: setRadialFolderStyle,
    radialFolderTint: setRadialFolderTint,
    radialLevels: setRadialLevels
}

export const mapStateActions: SettingActionCreators<MapState> = {
    amountOfTopLabels: setAmountOfTopLabels,
    labelSize: setLabelSize,
    amountOfEdgePreviews: setAmountOfEdgePreviews,
    edgeHeight: setEdgeHeight,
    scaling: setScaling,
    hideFlatBuildings: setHideFlatBuildings,
    invertHeight: setInvertHeight,
    invertArea: setInvertArea,
    isWhiteBackground: setIsWhiteBackground,
    mapColors: setMapColors,
    showIncomingEdges: setShowIncomingEdges,
    showOutgoingEdges: setShowOutgoingEdges,
    showOnlyBuildingsWithEdges: setShowOnlyBuildingsWithEdges,
    isEdgeMetricVisible: setIsEdgeMetricVisible,
    showMetricLabelNameValue: setShowMetricLabelNameValue,
    showMetricLabelNodeName: setShowMetricLabelNodeName,
    colorLabels: setColorLabels,
    enableFloorLabels: setEnableFloorLabels,
    labelMode: setLabelMode,
    groupLabelCollisions: setGroupLabelCollisions,
    labelsPerMap: setLabelsPerMap,
    colorMode: setColorMode,
    colorRange: setColorRange,
    margin: setMargin,
    layoutAlgorithm: setLayoutAlgorithm,
    areaMetric: setAreaMetric,
    heightMetric: setHeightMetric,
    edgeMetric: setEdgeMetric,
    colorMetric: setColorMetric,
    distributionMetric: setDistributionMetric
}
