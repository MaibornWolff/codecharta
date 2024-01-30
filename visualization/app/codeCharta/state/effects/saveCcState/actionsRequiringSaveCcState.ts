import { setAmountOfEdgePreviews } from "../../store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { setAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setColorLabels } from "../../store/appSettings/colorLabels/colorLabels.actions"
import { setEdgeHeight } from "../../store/appSettings/edgeHeight/edgeHeight.actions"
import { setScreenshotToClipboardEnabled } from "../../store/appSettings/enableClipboard/screenshotToClipboardEnabled.actions"
import { setExperimentalFeaturesEnabled } from "../../store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setEnableFloorLabels } from "../../store/appSettings/enableFloorLabels/enableFloorLabels.actions"
import { setHideFlatBuildings } from "../../store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { setInvertArea } from "../../store/appSettings/invertArea/invertArea.actions"
import { setInvertHeight } from "../../store/appSettings/invertHeight/invertHeight.actions"
import { setIsEdgeMetricVisible, toggleEdgeMetricVisible } from "../../store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"
import {
	setIsColorMetricLinkedToHeightMetricAction,
	toggleIsColorMetricLinkedToHeightMetric
} from "../../store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
import { setPresentationMode } from "../../store/appSettings/isPresentationMode/isPresentationMode.actions"
import { setIsSearchPanelPinned, toggleIsSearchPanelPinned } from "../../store/appSettings/isSearchPanelPinned/isSearchPanelPinned.actions"
import { setIsWhiteBackground } from "../../store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { setLayoutAlgorithm } from "../../store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { invertColorRange, invertDeltaColors, setMapColors } from "../../store/appSettings/mapColors/mapColors.actions"
import { setMaxTreeMapFiles } from "../../store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { setResetCameraIfNewFileIsLoaded } from "../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setScaling } from "../../store/appSettings/scaling/scaling.actions"
import { setSharpnessMode } from "../../store/appSettings/sharpnessMode/sharpnessMode.actions"
import { setShowMetricLabelNameValue } from "../../store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { setShowMetricLabelNodeName } from "../../store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { setShowOnlyBuildingsWithEdges } from "../../store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import {
	setSortingOrderAscending,
	toggleSortingOrderAscending
} from "../../store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { setAreaMetric } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { setColorMode } from "../../store/dynamicSettings/colorMode/colorMode.actions"
import { setColorRange } from "../../store/dynamicSettings/colorRange/colorRange.actions"
import { setDistributionMetric } from "../../store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { setEdgeMetric } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"
import {
	focusNode,
	setAllFocusedNodes,
	unfocusAllNodes,
	unfocusNode
} from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { setHeightMetric } from "../../store/dynamicSettings/heightMetric/heightMetric.actions"
import { setMargin } from "../../store/dynamicSettings/margin/margin.actions"
import { setSearchPattern } from "../../store/dynamicSettings/searchPattern/searchPattern.actions"
import { setSortingOption } from "../../store/dynamicSettings/sortingOption/sortingOption.actions"
import { setAttributeDescriptors } from "../../store/fileSettings/attributeDescriptors/attributeDescriptors.action"
import { setAttributeTypes, updateAttributeType } from "../../store/fileSettings/attributeTypes/attributeTypes.actions"
import {
	addBlacklistItem,
	addBlacklistItems,
	removeBlacklistItem,
	setBlacklist
} from "../../store/fileSettings/blacklist/blacklist.actions"
import { addEdge, removeEdge, setEdges } from "../../store/fileSettings/edges/edges.actions"
import { markPackages, setMarkedPackages, unmarkPackage } from "../../store/fileSettings/markedPackages/markedPackages.actions"
import {
	addFile,
	invertStandard,
	removeFile,
	setAll,
	setDelta,
	setDeltaComparison,
	setDeltaReference,
	setFiles,
	setStandard,
	setStandardByNames,
	switchReferenceAndComparison
} from "../../store/files/files.actions"

export const actionsRequiringSaveCcState = [
	setMarkedPackages,
	markPackages,
	unmarkPackage,
	setEdges,
	addEdge,
	removeEdge,
	setAttributeTypes,
	updateAttributeType,
	setAttributeDescriptors,
	setBlacklist,
	addBlacklistItem,
	addBlacklistItems,
	removeBlacklistItem,

	setColorLabels,
	setShowMetricLabelNodeName,
	setShowMetricLabelNameValue,
	setSortingOrderAscending,
	toggleSortingOrderAscending,
	setIsSearchPanelPinned,
	toggleIsSearchPanelPinned,
	setMapColors,
	invertColorRange,
	invertDeltaColors,
	setResetCameraIfNewFileIsLoaded,
	setShowOnlyBuildingsWithEdges,
	setIsEdgeMetricVisible,
	toggleEdgeMetricVisible,
	setIsWhiteBackground,
	setInvertHeight,
	setInvertArea,
	setHideFlatBuildings,
	setScaling,
	setEdgeHeight,
	setAmountOfEdgePreviews,
	setAmountOfTopLabels,
	setPresentationMode,
	setExperimentalFeaturesEnabled,
	setScreenshotToClipboardEnabled,
	setLayoutAlgorithm,
	setMaxTreeMapFiles,
	setSharpnessMode,
	setIsColorMetricLinkedToHeightMetricAction,
	toggleIsColorMetricLinkedToHeightMetric,
	setEnableFloorLabels,

	setColorMode,
	setSortingOption,
	setEdgeMetric,
	setColorRange,
	setMargin,
	setSearchPattern,
	setStandard,
	setAllFocusedNodes,
	unfocusAllNodes,
	focusNode,
	unfocusNode,
	setHeightMetric,
	setDistributionMetric,
	setColorMetric,
	setAreaMetric,

	setFiles,
	addFile,
	removeFile,
	setDelta,
	setDeltaReference,
	setDeltaComparison,
	switchReferenceAndComparison,
	setStandard,
	setStandardByNames,
	invertStandard,
	setAll
]
