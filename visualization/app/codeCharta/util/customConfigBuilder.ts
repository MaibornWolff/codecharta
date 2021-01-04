"use strict"
import { State, stateObjectReplacer } from "../codeCharta.model"
import { CustomConfig } from "../model/customConfig/customConfig.api.model"
import { CustomConfigFileStateConnector } from "../ui/customConfigs/customConfigFileStateConnector"
import md5 from "md5"

const CUSTOM_CONFIG_API_VERSION = "1.0.0"

export function buildCustomConfigFromState(configName: string, state: State): CustomConfig {
	const customConfigFileStateConnector = new CustomConfigFileStateConnector(state.files)

	const customConfig: CustomConfig = {
		id: "",
		name: configName,
		creationTime: Date.now(),
		mapSelectionMode: customConfigFileStateConnector.getMapSelectionMode(),
		assignedMaps: customConfigFileStateConnector.getSelectedMaps(),
		mapChecksum: customConfigFileStateConnector.getChecksumOfAssignedMaps(),
		customConfigVersion: CUSTOM_CONFIG_API_VERSION,
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

	customConfig.id = md5(JSON.stringify(customConfig, stateObjectReplacer))
	return customConfig
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
		layoutAlgorithm: undefined,
		maxTreeMapFiles: 0,
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

function deepMapOneToOther<T>(source: State, target: T) {
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
