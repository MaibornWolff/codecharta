import { State } from "../../codeCharta.model"
import { Vector3 } from "three"

// This will be gone, once all the initialStates are specific on their reducer
export const initialState: State = {
	fileSettings: {
		attributeTypes: { nodes: [], edges: [] },
		blacklist: [],
		edges: [],
		markedPackages: []
	},
	dynamicSettings: {
		areaMetric: null,
		heightMetric: null,
		colorMetric: null,
		distributionMetric: null,
		edgeMetric: null,
		focusedNodePath: "",
		searchedNodePaths: [],
		searchPattern: "",
		margin: null,
		colorRange: { from: null, to: null }
	},
	appSettings: {
		amountOfTopLabels: 1,
		amountOfEdgePreviews: 1,
		edgeHeight: 4,
		scaling: new Vector3(1, 1, 1),
		camera: new Vector3(0, 300, 1000),
		hideFlatBuildings: true,
		invertColorRange: false,
		invertDeltaColors: false,
		invertHeight: false,
		dynamicMargin: true,
		isWhiteBackground: false,
		whiteColorBuildings: false,
		mapColors: {
			positive: "#69AE40",
			neutral: "#ddcc00",
			negative: "#820E0E",
			selected: "#EB8319",
			defaultC: "#89ACB4",
			positiveDelta: "#69FF40",
			negativeDelta: "#ff0E0E",
			base: "#666666",
			flat: "#AAAAAA",
			lightGrey: "#DDDDDD",
			angularGreen: "#00BFA5",
			markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff", "#FFFF1D"],
			incomingEdge: "#00ffff",
			outgoingEdge: "#ff00ff"
		},
		isPresentationMode: false,
		showOnlyBuildingsWithEdges: false,
		resetCameraIfNewFileIsLoaded: true
	},
	treeMapSettings: {
		mapSize: 250
	}
}
