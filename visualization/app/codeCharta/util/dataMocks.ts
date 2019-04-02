import { CodeMapNode, Edge, CCFile, Settings, FileSelectionState } from "../codeCharta.model"

export const VALID_NODE: CodeMapNode = {
	name: "root",
	attributes: {},
	type: "Folder",
	children: [
		{
			name: "big leaf",
			type: "File",
			attributes: { RLOC: 100, Functions: 10, MCC: 1 },
			link: "http://www.google.de"
		},
		{
			name: "Parent Leaf",
			type: "Folder",
			attributes: {},
			children: [
				{
					name: "small leaf",
					type: "File",
					attributes: { RLOC: 30, Functions: 100, MCC: 100 }
				},
				{
					name: "other small leaf",
					type: "File",
					attributes: { RLOC: 70, Functions: 1000, MCC: 10 }
				}
			]
		}
	]
}

export const VALID_NODE_WITH_PATH: CodeMapNode = {
	name: "root",
	attributes: {},
	type: "Folder",
	path: "/root",
	children: [
		{
			name: "big leaf",
			type: "File",
			path: "/root/big leaf",
			attributes: { RLOC: 100, Functions: 10, MCC: 1 },
			link: "http://www.google.de"
		},
		{
			name: "Parent Leaf",
			type: "Folder",
			attributes: {},
			path: "/root/Parent Leaf",
			children: [
				{
					name: "small leaf",
					type: "File",
					path: "/root/Parent Leaf/small leaf",
					attributes: { RLOC: 30, Functions: 100, MCC: 100 }
				},
				{
					name: "other small leaf",
					type: "File",
					path: "/root/Parent Leaf/other small leaf",
					attributes: { RLOC: 70, Functions: 1000, MCC: 10 }
				},
				{
					name: "empty folder",
					type: "Folder",
					path: "/root/Parent Leaf/empty folder",
					attributes: {},
					children: []
				}
			]
		}
	]
}

export const VALID_EDGES: Edge[] = [
	{
		fromNodeName: "/root/big leaf",
		toNodeName: "/root/Parent Leaf/small leaf",
		attributes: {
			pairingRate: 89,
			avgCommits: 34
		}
	},
	{
		fromNodeName: "/root/sample1 only leaf",
		toNodeName: "/root/Parent Leaf/small leaf",
		attributes: {
			pairingRate: 89,
			avgCommits: 34
		}
	}
]

export const VALID_EDGE: Edge = {
	fromNodeName: "/root/big leaf",
	toNodeName: "/root/Parent Leaf/small leaf",
	attributes: {
		pairingRate: 89,
		avgCommits: 34
	}
}

export const TEST_FILE_CONTENT = {
	fileName: "noFileName",
	projectName: "Sample Map",
	apiVersion: "1.1",
	nodes: [VALID_NODE]
}

export const TEST_FILE_DATA: CCFile = {
	fileMeta: {
		fileName: "file",
		projectName: "Sample Map",
		apiVersion: "1.1"
	},
	map: VALID_NODE,
	settings: {
		fileSettings: {
			edges: VALID_EDGES
		}
	}
}

export const TEST_FILE_WITH_PATHS: CCFile = {
	fileMeta: {
		fileName: "fileA",
		projectName: "Sample Project",
		apiVersion: "1.1"
	},
	map: {
		name: "root",
		type: "Folder",
		path: "/root",
		attributes: {},
		children: [
			{
				name: "big leaf",
				type: "File",
				path: "/root/big leaf",
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				link: "http://www.google.de"
			},
			{
				name: "Parent Leaf",
				type: "Folder",
				attributes: {},
				path: "/root/Parent Leaf",
				children: [
					{
						name: "small leaf",
						type: "File",
						path: "/root/Parent Leaf/small leaf",
						attributes: { rloc: 30, functions: 100, mcc: 100 }
					},
					{
						name: "other small leaf",
						type: "File",
						path: "/root/Parent Leaf/other small leaf",
						attributes: { rloc: 70, functions: 1000, mcc: 10 }
					},
					{
						name: "empty folder",
						type: "Folder",
						path: "/root/Parent Leaf/empty folder",
						attributes: {},
						children: []
					}
				]
			}
		]
	},
	settings: {
		fileSettings: {}
	}
}

export const TEST_DELTA_MAP_A: CCFile = {
	fileMeta: {
		fileName: "fileA",
		projectName: "Sample Project",
		apiVersion: "1.1"
	},
	map: {
		name: "root",
		type: "Folder",
		attributes: {},
		children: [
			{
				name: "big leaf",
				type: "File",
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				link: "http://www.google.de"
			},
			{
				name: "Parent Leaf",
				type: "Folder",
				attributes: {},
				children: [
					{
						name: "small leaf",
						type: "File",
						attributes: { rloc: 30, functions: 100, mcc: 100 }
					},
					{
						name: "other small leaf",
						type: "File",
						attributes: { rloc: 70, functions: 1000, mcc: 10 }
					}
				]
			}
		]
	},
	settings: {
		fileSettings: {}
	}
}

export const TEST_DELTA_MAP_B: CCFile = {
	fileMeta: {
		fileName: "fileB",
		projectName: "Sample Project",
		apiVersion: "1.1"
	},
	map: {
		name: "root",
		type: "Folder",
		attributes: {},
		children: [
			{
				name: "big leaf",
				type: "File",
				attributes: { rloc: 20, functions: 10, mcc: 1 },
				link: "http://www.google.de"
			},
			{
				name: "additional leaf",
				type: "File",
				attributes: { rloc: 10, functions: 11, mcc: 5 },
				link: "http://www.google.de"
			},
			{
				name: "Parent Leaf",
				type: "Folder",
				attributes: {},
				children: [
					{
						name: "small leaf",
						type: "File",
						attributes: { rloc: 30, functions: 100, mcc: 100, more: 20 }
					},
					{
						name: "other small leaf",
						type: "File",
						attributes: { rloc: 70, functions: 1000 }
					},
					{
						name: "big leaf",
						type: "File",
						attributes: { rloc: 20, functions: 10, mcc: 1 },
						link: "http://www.google.de"
					}
				]
			}
		]
	},
	settings: {
		fileSettings: {}
	}
}

export const TEST_FILE_DATA_DOWNLOADED = {
	apiVersion: "1.1",
	attributeTypes: undefined,
	blacklist: undefined,
	edges: [
		{ attributes: { avgCommits: 34, pairingRate: 89 }, fromNodeName: "/root/big leaf", toNodeName: "/root/Parent Leaf/small leaf" },
		{
			attributes: { avgCommits: 34, pairingRate: 89 },
			fromNodeName: "/root/sample1 only leaf",
			toNodeName: "/root/Parent Leaf/small leaf"
		}
	],
	fileName: "file.14_12_2018.json",
	nodes: [
		{
			attributes: {},
			children: [
				{ attributes: { Functions: 10, MCC: 1, RLOC: 100 }, link: "http://www.google.de", name: "big leaf", type: "File" },
				{
					attributes: {},
					children: [
						{ attributes: { Functions: 100, MCC: 100, RLOC: 30 }, name: "small leaf", type: "File" },
						{ attributes: { Functions: 1000, MCC: 10, RLOC: 70 }, name: "other small leaf", type: "File" }
					],
					name: "Parent Leaf",
					type: "Folder"
				}
			],
			name: "root",
			type: "Folder"
		}
	],
	projectName: "Sample Map"
}

export const SETTINGS: Settings = {
	fileSettings: { attributeTypes: {}, blacklist: [], edges: [], markedPackages: [] },
	dynamicSettings: {
		areaMetric: "rloc",
		heightMetric: "mcc",
		colorMetric: "mcc",
		focusedNodePath: null,
		searchedNodePaths: [],
		searchPattern: "",
		margin: 48,
		neutralColorRange: { flipped: false, from: 19, to: 67 }
	},
	appSettings: {
		amountOfTopLabels: 31,
		scaling: { x: 1, y: 1.8, z: 1 },
		camera: { x: 0, y: 300, z: 1000 },
		deltaColorFlipped: false,
		enableEdgeArrows: true,
		hideFlatBuildings: true,
		maximizeDetailPanel: false,
		invertHeight: true,
		dynamicMargin: true,
		isWhiteBackground: false,
		whiteColorBuildings: true,
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
			markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff", "#FFFF1D"]
		}
	},
	treeMapSettings: { mapSize: 500 }
}
