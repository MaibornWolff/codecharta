import { CcState, stateObjectReplacer } from "../codeCharta.model"
import { CustomConfig } from "../model/customConfig/customConfig.api.model"
import md5 from "md5"
import { visibleFilesBySelectionModeSelector } from "../ui/customConfigs/visibleFilesBySelectionMode.selector"

const CUSTOM_CONFIG_API_VERSION = "1.0.0"

export function buildCustomConfigFromState(
	configName: string,
	state: CcState,
	camera: CustomConfig["camera"],
	note: string | undefined
): CustomConfig {
	const { mapSelectionMode, assignedMaps } = visibleFilesBySelectionModeSelector(state)

	const customConfig: CustomConfig = {
		id: "",
		name: configName,

		creationTime: Date.now(),
		mapSelectionMode,
		assignedMaps,
		customConfigVersion: CUSTOM_CONFIG_API_VERSION,
		stateSettings: {
			appSettings: undefined,
			dynamicSettings: undefined,
			fileSettings: undefined
		},
		camera,
		...(note && { note })
	}

	// Initialize all necessary state settings with default values right here
	// Any changes to the state properties must also be adapted here
	// You must handle breaking changes of the CustomConfig API
	initializeAppSettings(customConfig)
	initializeDynamicSettings(customConfig)
	initializeFileSettings(customConfig)

	// Override the default state settings with the stored CustomConfig values
	deepMapOneToOther(state, customConfig.stateSettings)

	customConfig.id = md5(JSON.stringify(customConfig, stateObjectReplacer))
	return customConfig
}

function initializeAppSettings(target: CustomConfig) {
	target.stateSettings.appSettings = {
		showMetricLabelNameValue: false,
		showMetricLabelNodeName: false,
		colorLabels: {
			positive: false,
			negative: false,
			neutral: false
		},
		amountOfEdgePreviews: 0,
		amountOfTopLabels: 0,
		edgeHeight: 0,
		hideFlatBuildings: false,
		invertHeight: false,
		invertArea: false,
		isLoadingFile: false,
		isLoadingMap: false,
		isPresentationMode: false,
		isWhiteBackground: false,
		resetCameraIfNewFileIsLoaded: false,
		scaling: undefined,
		showOnlyBuildingsWithEdges: false,
		isEdgeMetricVisible: true,
		sortingOrderAscending: false,
		isFileExplorerPinned: false,
		experimentalFeaturesEnabled: false,
		screenshotToClipboardEnabled: false,
		layoutAlgorithm: undefined,
		maxTreeMapFiles: 0,
		sharpnessMode: undefined,
		isColorMetricLinkedToHeightMetric: false,
		enableFloorLabels: true,
		mapColors: {
			labelColorAndAlpha: { alpha: 0, rgb: "" },
			base: "",
			flat: "",
			incomingEdge: "",
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
		focusedNodePath: [],
		heightMetric: "",
		margin: 0,
		searchPattern: "",
		sortingOption: undefined,
		colorRange: {
			from: 0,
			to: 0
		},
		colorMode: undefined
	}
}

function initializeFileSettings(target: CustomConfig) {
	target.stateSettings.fileSettings = {
		blacklist: undefined,
		edges: [],
		attributeDescriptors: {},
		markedPackages: []
	}
}

function deepMapOneToOther<T>(source: CcState, target: T) {
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
