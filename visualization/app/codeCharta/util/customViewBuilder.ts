"use strict"
import {State} from "../codeCharta.model"
import {CustomView} from "../model/customView/customView.api.model";
import {FileSelectionState} from "../model/files/files";
import md5 from "md5";

export class CustomViewBuilder {
	private static readonly CC_CUSTOM_VIEW_API_VERSION = "1.0.0"

	static buildFromState(viewName: string, state: State): CustomView {
		const selectedMapFile = state.files.find(
			fileItem => fileItem.selectedAs === FileSelectionState.Single
		).file

		if (!selectedMapFile || !selectedMapFile.fileMeta.fileName) {
			throw new Error("No map has been selected yet.")
		}

		const mapName = selectedMapFile.fileMeta.fileName

		const target = {
			name: viewName,
			mapName,
			mapHash: md5(selectedMapFile.map),
			customViewVersion: this.CC_CUSTOM_VIEW_API_VERSION
		} as CustomView

		target.stateSettings = {
			appSettings: undefined,
			dynamicSettings: undefined,
			fileSettings: undefined,
			treeMap: undefined
		}

		this.setAppSettings(target)
		this.setDynamicSettings(target)
		this.setFileSettings(target)
		this.setTreeMapSettings(target)

		this.deepCopyObject(state, target.stateSettings)

		return target
	}

	private static setAppSettings(target: CustomView) {
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

	private static setDynamicSettings(target: CustomView) {
		target.stateSettings.dynamicSettings = {
			areaMetric: "",
			colorMetric: "",
			colorRange: undefined,
			distributionMetric: "",
			edgeMetric: "",
			focusedNodePath: "",
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

	private static setFileSettings(target: CustomView) {
		target.stateSettings.fileSettings = {
			attributeTypes: undefined, blacklist: undefined, edges: [], markedPackages: []
		}
	}

	private static setTreeMapSettings(target: CustomView) {
		target.stateSettings.treeMap = {
			mapSize: 0
		}
	}

	private static deepCopyObject<T>(source: any, target: T) {
		Object.keys(source).forEach((key) => {
			const value = source[key]

			if (key in target) {
				if (typeof value !== 'object' || Array.isArray(value) || typeof value === 'undefined' || value === null) {
					target[key] = value
				} else if (Object.prototype.hasOwnProperty.call(target, key)) {
					if (typeof target[key] === 'undefined') {
						target[key] = value
					} else {
						this.deepCopyObject(value, target[key])
					}
				}
			}

		}, {})
	}
}
