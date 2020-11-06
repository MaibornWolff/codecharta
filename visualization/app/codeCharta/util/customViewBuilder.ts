"use strict"
import { State } from "../codeCharta.model"
import { CustomView, CustomViewMapSelectionMode } from "../model/customView/customView.api.model"
import { CustomViewFileStateConnector } from "../ui/customViews/customViewFileStateConnector"

const CC_CUSTOM_VIEW_API_VERSION = "1.0.0"

export function buildCustomViewFromState(viewName: string, state: State): CustomView {
	const customViewFileStateConnector = new CustomViewFileStateConnector(state.files)

	const uniqueIdentifier = createCustomViewIdentifier(
		customViewFileStateConnector.getMapSelectionMode(),
		customViewFileStateConnector.getSelectedMaps(),
		viewName
	)

	const customView: CustomView = {
		id: uniqueIdentifier,
		name: viewName,
		mapSelectionMode: customViewFileStateConnector.getMapSelectionMode(),
		assignedMaps: customViewFileStateConnector.getSelectedMaps(),
		mapChecksum: customViewFileStateConnector.getChecksumOfAssignedMaps(),
		customViewVersion: CC_CUSTOM_VIEW_API_VERSION,
		stateSettings: {
			appSettings: undefined,
			dynamicSettings: undefined,
			fileSettings: undefined,
			treeMap: undefined
		}
	}

	// Initialize all necessary state settings with default values right here
	// Any changes to the state properties must also be adapted here
	// You must handle breaking changes of the CustomView API
	initializeAppSettings(customView)
	initializeDynamicSettings(customView)
	initializeFileSettings(customView)
	initializeTreeMapSettings(customView)

	// Override the default state settings with the stored CustomView values
	deepMapOneToOther(state, customView.stateSettings)

	return customView
}

export function createCustomViewIdentifier(mapSelectionMode: CustomViewMapSelectionMode, selectedMaps: string[], viewName: string) {
	return mapSelectionMode + selectedMaps.join("") + viewName
}

function initializeAppSettings(target: CustomView) {
	target.stateSettings.appSettings = {
		showMetricLabelNameValue: false,
		showMetricLabelNodeName: false,
		amountOfEdgePreviews: 0,
		amountOfTopLabels: 0,
		camera: undefined,
		cameraTarget: undefined,
		dynamicMargin: false,
		edgeHeight: 0,
		hideFlatBuildings: false,
		invertColorRange: false,
		invertDeltaColors: false,
		invertHeight: false,
		isAttributeSideBarVisible: false,
		isLoadingFile: false,
		isLoadingMap: false,
		isPresentationMode: false,
		isWhiteBackground: false,
		panelSelection: undefined,
		resetCameraIfNewFileIsLoaded: false,
		scaling: undefined,
		searchPanelMode: undefined,
		showOnlyBuildingsWithEdges: false,
		sortingOrderAscending: false,
		whiteColorBuildings: false,
		experimentalFeaturesEnabled: false,
		mapColors: {
			labelColorAndAlpha: { alpha: 0, rgb: "" },
			angularGreen: "",
			base: "",
			defaultC: "",
			flat: "",
			incomingEdge: "",
			lightGrey: "",
			markingColors: [],
			negative: "",
			negativeDelta: "",
			neutral: "",
			outgoingEdge: "",
			positive: "",
			positiveDelta: "",
			selected: ""
		}
	}
}

function initializeDynamicSettings(target: CustomView) {
	target.stateSettings.dynamicSettings = {
		areaMetric: "",
		colorMetric: "",
		distributionMetric: "",
		edgeMetric: "",
		focusedNodePath: undefined,
		heightMetric: "",
		margin: 0,
		searchPattern: "",
		searchedNodePaths: undefined,
		sortingOption: undefined,
		colorRange: {
			from: 0,
			to: 0
		}
	}
}

function initializeFileSettings(target: CustomView) {
	target.stateSettings.fileSettings = {
		attributeTypes: undefined,
		blacklist: undefined,
		edges: [],
		markedPackages: []
	}
}

function initializeTreeMapSettings(target: CustomView) {
	target.stateSettings.treeMap = {
		mapSize: 0
	}
}

function deepMapOneToOther<T>(source: any, target: T) {
	for (const [key, value] of Object.entries(source)) {
		// if a property of source is missing, we don't want to copy it into target.
		if (!Object.prototype.hasOwnProperty.call(target, key)) {
			continue
		}

		if (typeof value !== "object" || Array.isArray(value) || value === null || target[key] === undefined) {
			// Assign primitive values to target
			target[key] = value
		} else {
			// We have to map an object with nested properties here.
			// source and target have the same properties specified for the nested object.
			// Thus, map properties of the next deeper level.
			deepMapOneToOther(value, target[key])
		}
	}
}
