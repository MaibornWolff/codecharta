"use strict"
import { State } from "../codeCharta.model"
import { CustomConfig, CustomConfigMapSelectionMode } from "../model/customConfig/customConfig.api.model"
import { CustomConfigFileStateConnector } from "../ui/customConfigs/customConfigFileStateConnector"

const CC_CUSTOM_VIEW_API_VERSION = "1.0.0"

export function buildCustomConfigFromState(viewName: string, state: State): CustomConfig {
	const customConfigFileStateConnector = new CustomConfigFileStateConnector(state.files)

	const uniqueIdentifier = createCustomConfigIdentifier(
		customConfigFileStateConnector.getMapSelectionMode(),
		customConfigFileStateConnector.getSelectedMaps(),
		viewName
	)

	const customConfig: CustomConfig = {
		id: uniqueIdentifier,
		name: viewName,
		mapSelectionMode: customConfigFileStateConnector.getMapSelectionMode(),
		assignedMaps: customConfigFileStateConnector.getSelectedMaps(),
		mapChecksum: customConfigFileStateConnector.getChecksumOfAssignedMaps(),
		customConfigVersion: CC_CUSTOM_VIEW_API_VERSION,
		stateSettings: {
			appSettings: undefined,
			dynamicSettings: undefined,
			fileSettings: undefined,
			treeMap: undefined
		}
	}

	// Initialize all necessary state settings with default values right here
	// Any changes to the state properties must also be adapted here
	// You must handle breaking changes of the CustomConfig API
	initializeAppSettings(customConfig)
	initializeDynamicSettings(customConfig)
	initializeFileSettings(customConfig)
	initializeTreeMapSettings(customConfig)

	// Override the default state settings with the stored CustomConfig values
	deepMapOneToOther(state, customConfig.stateSettings)

	return customConfig
}

export function createCustomConfigIdentifier(mapSelectionMode: CustomConfigMapSelectionMode, selectedMaps: string[], viewName: string) {
	return mapSelectionMode + selectedMaps.join("") + viewName
}

function initializeAppSettings(target: CustomConfig) {
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

function initializeDynamicSettings(target: CustomConfig) {
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

function initializeFileSettings(target: CustomConfig) {
	target.stateSettings.fileSettings = {
		attributeTypes: undefined,
		blacklist: undefined,
		edges: [],
		markedPackages: []
	}
}

function initializeTreeMapSettings(target: CustomConfig) {
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
