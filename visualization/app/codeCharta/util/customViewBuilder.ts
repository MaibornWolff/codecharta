"use strict"
import {State} from "../codeCharta.model"
import {CustomView} from "../model/customView/customView.api.model";
import {CustomViewFileStateConnector} from "../ui/customViews/customViewFileStateConnector";

export class CustomViewBuilder {
	private static readonly CC_CUSTOM_VIEW_API_VERSION = "1.0.0"

	static buildFromState(viewName: string, state: State): CustomView {
		const customViewFileStateConnector = new CustomViewFileStateConnector(state.files)

		const customView = {
			name: viewName,
			mapSelectionMode: customViewFileStateConnector.getMapSelectionMode(),
			assignedMap: customViewFileStateConnector.getJointMapName(),
			mapChecksum: customViewFileStateConnector.getChecksumOfAssignedMaps(),
			customViewVersion: this.CC_CUSTOM_VIEW_API_VERSION
		} as CustomView

		customView.stateSettings = {
			appSettings: undefined,
			dynamicSettings: undefined,
			fileSettings: undefined,
			treeMap: undefined
		}

		this.initializeAppSettings(customView)
		this.initializeDynamicSettings(customView)
		this.initializeFileSettings(customView)
		this.initializeTreeMapSettings(customView)

		this.deepMapOneToOther(state, customView.stateSettings)

		return customView
	}

	private static initializeAppSettings(target: CustomView) {
		target.stateSettings.appSettings = {
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
			whiteColorBuildings: false
		}
		target.stateSettings.appSettings.mapColors = {
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
			from: 0, to: 0
		}
	}

	private static initializeFileSettings(target: CustomView) {
		target.stateSettings.fileSettings = {
			attributeTypes: undefined, blacklist: undefined, edges: [], markedPackages: []
		}
	}

	private static initializeTreeMapSettings(target: CustomView) {
		target.stateSettings.treeMap = {
			mapSize: 0
		}
	}

	private static deepMapOneToOther<T>(source: any, target: T) {
		Object.keys(source).forEach((key) => {
			const value = source[key]

			if (key in target) {
				if (typeof value !== 'object' || Array.isArray(value) || typeof value === 'undefined' || value === null) {
					// Assign primitive values to target
					target[key] = value
				} else if (Object.prototype.hasOwnProperty.call(target, key)) {
					if (typeof target[key] === 'undefined') {
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
