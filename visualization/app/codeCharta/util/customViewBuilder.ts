"use strict"
import { State } from "../codeCharta.model"
import {CustomView, CustomViewMapSelectionMode} from "../model/customView/customView.api.model"
import { CustomViewFileStateConnector } from "../ui/customViews/customViewFileStateConnector"

export class CustomViewBuilder {
	private static readonly CC_CUSTOM_VIEW_API_VERSION = "1.0.0"

	static buildFromState(viewName: string, state: State): CustomView {
		const customViewFileStateConnector = new CustomViewFileStateConnector(state.files)

		const uniqueIdentifier = this.createCustomViewIdentifier(
			customViewFileStateConnector.getMapSelectionMode(),
			customViewFileStateConnector.getSelectedMaps(),
			viewName
		)

		const customView = {
			id: uniqueIdentifier,
			name: viewName,
			mapSelectionMode: customViewFileStateConnector.getMapSelectionMode(),
			assignedMaps: customViewFileStateConnector.getSelectedMaps(),
			mapChecksum: customViewFileStateConnector.getChecksumOfAssignedMaps(),
			customViewVersion: this.CC_CUSTOM_VIEW_API_VERSION
		} as CustomView

		customView.stateSettings = {
			appSettings: undefined,
			dynamicSettings: undefined,
			fileSettings: undefined,
			treeMap: undefined
		}

		// Initialize all necessary state settings with default values right here
		// Any changes to the state properties must also be adapted here
		// You must handle breaking changes of the CustomView API
		this.initializeAppSettings(customView)
		this.initializeDynamicSettings(customView)
		this.initializeFileSettings(customView)
		this.initializeTreeMapSettings(customView)

		// Override the default state settings with the stored CustomView values
		this.deepMapOneToOther(state, customView.stateSettings)

		return customView
	}

	static createCustomViewIdentifier(
		mapSelectionMode: CustomViewMapSelectionMode,
		selectedMaps: string[],
		viewName: string
	) {
		return mapSelectionMode + selectedMaps.join("") + viewName
	}

	private static initializeAppSettings(target: CustomView) {
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
			mapColors: undefined,
			panelSelection: undefined,
			resetCameraIfNewFileIsLoaded: false,
			scaling: undefined,
			searchPanelMode: undefined,
			showOnlyBuildingsWithEdges: false,
			sortingOrderAscending: false,
			whiteColorBuildings: false,
			experimentalFeaturesEnabled: false
		}
		target.stateSettings.appSettings.mapColors = {
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

	private static initializeDynamicSettings(target: CustomView) {
		target.stateSettings.dynamicSettings = {
			areaMetric: "",
			colorMetric: "",
			colorRange: undefined,
			distributionMetric: "",
			edgeMetric: "",
			focusedNodePath: undefined,
			heightMetric: "",
			margin: 0,
			searchPattern: "",
			searchedNodePaths: undefined,
			sortingOption: undefined
		}
		target.stateSettings.dynamicSettings.colorRange = {
			from: 0,
			to: 0
		}
	}

	private static initializeFileSettings(target: CustomView) {
		target.stateSettings.fileSettings = {
			attributeTypes: undefined,
			blacklist: undefined,
			edges: [],
			markedPackages: []
		}
	}

	private static initializeTreeMapSettings(target: CustomView) {
		target.stateSettings.treeMap = {
			mapSize: 0
		}
	}

	private static deepMapOneToOther<T>(source: any, target: T) {
		Object.keys(source).forEach(key => {
			const value = source[key]

			if (key in target) {
				if (typeof value !== "object" || Array.isArray(value) || typeof value === "undefined" || value === null) {
					// Assign primitive values to target
					target[key] = value
				} else if (Object.prototype.hasOwnProperty.call(target, key)) {
					if (typeof target[key] === "undefined") {
						// Assign object to target property,
						// if target property does not specify deeper properties.
						target[key] = value
					} else {
						// We have to map an object with nested properties here.
						// source and target have the same properties specified for the nested object.
						// Thus, map properties of the next deeper level.
						this.deepMapOneToOther(value, target[key])
					}
				}
			}
		}, {})
	}
}
