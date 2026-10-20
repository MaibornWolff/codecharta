import { Action } from "@ngrx/store"
import {
    DependencyLensSource,
    DomainLensSource,
    DomainState,
    MapState,
    MetricsLensSource,
    Preferences,
    SharedView
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
    setDependencyGraphSettings,
    setIsColorMetricLinkedToHeightMetricAction,
    setMaxTreeMapFiles,
    setPresentationMode,
    setRadialFolderStyle,
    setRadialFolderTint,
    setRadialFolderValue,
    setRadialLevels,
    setResetCameraIfNewFileIsLoaded,
    setScreenshotToClipboardEnabled
} from "../stores/preferences/preferences.write.facade"
import {
    setAllFocusedNodes,
    setExcludedNodes,
    setFlattenedNodes,
    setMarkedPackages,
    setMetricRules,
    setSearchPattern
} from "../stores/sharedView/sharedView.write.facade"

export type ValueActionCreator = (props: { value: any }) => Action

type RestoreActions<Key extends PropertyKey> = Record<Key, ValueActionCreator>

// Transient interaction state: never restored, so a persisted blob without it is complete.
export const transientSharedViewKeys = [
    "hoveredNodePath",
    "hoveredFileExtensions",
    "keptHighlightPaths",
    "selectedNodePath",
    "rightClickedNodeData"
] as const satisfies readonly (keyof SharedView)[]

type TransientSharedViewKey = (typeof transientSharedViewKeys)[number]

export const metricsLensSourceRestoreActions: RestoreActions<keyof MetricsLensSource> = {
    attributeTypes: setAttributeTypes,
    attributeDescriptors: setAttributeDescriptors
}

export const dependencyLensSourceRestoreActions: RestoreActions<keyof DependencyLensSource> = {
    attributeTypes: setEdgeAttributeTypes
}

export const domainLensSourceRestoreActions: RestoreActions<keyof DomainLensSource> = {
    words: setDomainWords
}

export const domainStateRestoreActions: RestoreActions<keyof DomainState> = {
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

export const sharedViewRestoreActions: RestoreActions<Exclude<keyof SharedView, TransientSharedViewKey>> = {
    focusedNodePath: setAllFocusedNodes,
    searchPattern: setSearchPattern,
    excludedNodes: setExcludedNodes,
    flattenedNodes: setFlattenedNodes,
    markedPackages: setMarkedPackages,
    metricRules: setMetricRules
}

export const preferencesRestoreActions: RestoreActions<Exclude<keyof Preferences, "sorting">> = {
    isPresentationMode: setPresentationMode,
    resetCameraIfNewFileIsLoaded: setResetCameraIfNewFileIsLoaded,
    centerMapZoom: setCenterMapZoom,
    maxTreeMapFiles: setMaxTreeMapFiles,
    screenshotToClipboardEnabled: setScreenshotToClipboardEnabled,
    isColorMetricLinkedToHeightMetric: setIsColorMetricLinkedToHeightMetricAction,
    radialFolderValue: setRadialFolderValue,
    radialFolderStyle: setRadialFolderStyle,
    radialFolderTint: setRadialFolderTint,
    radialLevels: setRadialLevels,
    dependencyGraph: setDependencyGraphSettings
}

export const mapStateRestoreActions: RestoreActions<keyof MapState> = {
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
