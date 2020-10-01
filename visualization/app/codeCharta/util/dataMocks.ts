import {
	AttributeTypeValue,
	BlacklistItem,
	BlacklistType,
	CCFile,
	CodeMapNode,
	Edge,
	EdgeVisibility,
	FileMeta,
	MarkedPackage,
	Node,
	NodeType,
	PanelSelection,
	RecursivePartial,
	Scenario,
	NodeMetricData,
	EdgeMetricData,
	SearchPanelMode,
	Settings,
	SortingOption,
	State
} from "../codeCharta.model"
import { CodeMapBuilding } from "../ui/codeMap/rendering/codeMapBuilding"
import { MetricDistribution } from "./fileExtensionCalculator"
import { Box3, Vector3 } from "three"
import { IRootScopeService } from "angular"
import { hierarchy } from "d3"
import { AddScenarioContent, ScenarioMetricType } from "../ui/dialog/dialog.addScenarioSettings.component"
import { ScenarioItem } from "../ui/scenarioDropDown/scenarioDropDown.component"
import { FileSelectionState, FileState } from "../model/files/files"
import { APIVersions, ExportCCFile } from "../codeCharta.api.model"
import { NodeMetricDataService } from "../state/store/metricData/nodeMetricData/nodeMetricData.service"
import packageJson from "../../../package.json"

export const VALID_NODE: CodeMapNode = {
	name: "root",
	attributes: {},
	type: NodeType.FOLDER,
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1 },
			isExcluded: false,
			isFlattened: false,
			link: "http://www.google.de"
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: {},
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "other small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 70, functions: 1000, mcc: 10 },
					isExcluded: false,
					isFlattened: false
				}
			]
		}
	]
}

export const VALID_NODE_WITH_MULTIPLE_FOLDERS: CodeMapNode = {
	name: "root",
	attributes: { [NodeMetricDataService.UNARY_METRIC]: 200 },
	type: NodeType.FOLDER,
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [NodeMetricDataService.UNARY_METRIC]: 1 },
			link: "http://www.google.de",
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 60 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 40 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder3",
			type: NodeType.FOLDER,
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 160 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [NodeMetricDataService.UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				}
			]
		}
	]
}

export const VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED: CodeMapNode = {
	name: "root",
	attributes: { [NodeMetricDataService.UNARY_METRIC]: 200 },
	type: NodeType.FOLDER,
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "Folder3",
			type: NodeType.FOLDER,
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 160 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [NodeMetricDataService.UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				}
			]
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 40 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 60 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [NodeMetricDataService.UNARY_METRIC]: 1 },
			link: "http://www.google.de",
			isExcluded: false,
			isFlattened: false
		}
	]
}

export const VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY: CodeMapNode = {
	name: "root",
	attributes: { [NodeMetricDataService.UNARY_METRIC]: 200 },
	type: NodeType.FOLDER,
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "Folder3",
			type: NodeType.FOLDER,
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 160 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [NodeMetricDataService.UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				}
			]
		},
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 60 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 40 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [NodeMetricDataService.UNARY_METRIC]: 1 },
			link: "http://www.google.de",
			isExcluded: false,
			isFlattened: false
		}
	]
}

export const VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME: CodeMapNode = {
	name: "root",
	attributes: { [NodeMetricDataService.UNARY_METRIC]: 200 },
	type: NodeType.FOLDER,
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 60 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 40 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder3",
			type: NodeType.FOLDER,
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 160 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [NodeMetricDataService.UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				}
			]
		},
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [NodeMetricDataService.UNARY_METRIC]: 1 },
			link: "http://www.google.de",
			isExcluded: false,
			isFlattened: false
		}
	]
}

export const VALID_NODE_WITH_PATH: CodeMapNode = {
	name: "root",
	attributes: {},
	type: NodeType.FOLDER,
	path: "/root",
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			path: "/root/big leaf",
			attributes: { rloc: 100, functions: 10, mcc: 1 },
			link: "http://www.google.de",
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: {},
			path: "/root/Parent Leaf",
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/small leaf",
					attributes: { rloc: 30, functions: 100, mcc: 100 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "other small leaf",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/other small leaf",
					attributes: { rloc: 70, functions: 1000, mcc: 10 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "empty folder",
					type: NodeType.FOLDER,
					path: "/root/Parent Leaf/empty folder",
					attributes: {},
					isExcluded: false,
					isFlattened: false,
					children: []
				}
			]
		}
	]
}

export const VALID_NODE_WITH_MERGED_FOLDERS_AND_PATH: CodeMapNode = {
	name: "root",
	attributes: {},
	type: NodeType.FOLDER,
	path: "/root",
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			path: "/root/in/between/big leaf",
			attributes: { rloc: 100, functions: 10, mcc: 1 },
			link: "http://www.google.de",
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: {},
			path: "/root/in/between/Parent Leaf",
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					path: "/root/in/between/Parent Leaf/small leaf",
					attributes: { rloc: 30, functions: 100, mcc: 100 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "other small leaf",
					type: NodeType.FILE,
					path: "/root/in/between/Parent Leaf/other small leaf",
					attributes: { rloc: 70, functions: 1000, mcc: 10 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "empty folder",
					type: NodeType.FOLDER,
					path: "/root/in/between/Parent Leaf/empty folder",
					attributes: {},
					isExcluded: false,
					isFlattened: false,
					children: []
				}
			]
		}
	]
}

export const VALID_NODE_WITH_ROOT_UNARY: CodeMapNode = {
	name: "root",
	attributes: { [NodeMetricDataService.UNARY_METRIC]: 2 },
	type: NodeType.FOLDER,
	path: "/root",
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "first leaf",
			type: NodeType.FILE,
			path: "/root/first leaf",
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 1, functions: 10, mcc: 1 },
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "second leaf",
			type: NodeType.FILE,
			path: "/root/second leaf",
			attributes: { [NodeMetricDataService.UNARY_METRIC]: 1, functions: 5, mcc: 1 },
			isExcluded: false,
			isFlattened: false
		}
	]
}

export const VALID_NODE_DECORATED: CodeMapNode = {
	name: "root",
	attributes: { rloc: 100, functions: 10, mcc: 1, [NodeMetricDataService.UNARY_METRIC]: 5 },
	type: NodeType.FOLDER,
	path: "/root",
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			path: "/root/big leaf",
			attributes: { rloc: 100, functions: 10, mcc: 1, [NodeMetricDataService.UNARY_METRIC]: 1 },
			link: "http://www.google.de",
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: { rloc: 100, functions: 10, mcc: 1, [NodeMetricDataService.UNARY_METRIC]: 1 },
			path: "/root/Parent Leaf",
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/small leaf",
					attributes: { rloc: 30, functions: 100, mcc: 100, [NodeMetricDataService.UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "other small leaf",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/other small leaf",
					attributes: { rloc: 70, functions: 1000, mcc: 10, [NodeMetricDataService.UNARY_METRIC]: 1 },
					edgeAttributes: { Imports: { incoming: 12, outgoing: 13 } },
					isExcluded: false,
					isFlattened: false
				}
			]
		}
	]
}

export const VALID_NODE_WITH_METRICS: CodeMapNode = {
	name: "root",
	type: NodeType.FOLDER,
	attributes: { rloc: 100, functions: 10, mcc: 1 },
	isExcluded: false,
	isFlattened: false
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
		fromNodeName: "/root/Parent Leaf/other small leaf",
		toNodeName: "/root/Parent Leaf/small leaf",
		attributes: {
			pairingRate: 89,
			otherMetric: 34
		}
	},
	{
		fromNodeName: "/root/not available",
		toNodeName: "/root/Parent Leaf/small leaf",
		attributes: {
			pairingRate: 89,
			avgCommits: 34
		}
	}
]

export const VALID_EDGES_DECORATED: Edge[] = [
	{
		fromNodeName: "/root/big leaf",
		toNodeName: "/root/Parent Leaf/small leaf",
		attributes: {
			pairingRate: 89,
			avgCommits: 34
		},
		visible: EdgeVisibility.from
	},
	{
		fromNodeName: "/root/Parent Leaf/small leaf",
		toNodeName: "/root/different leaf",
		attributes: {
			pairingRate: 89,
			avgCommits: 34
		},
		visible: EdgeVisibility.from
	},

	{
		fromNodeName: "/root/Parent Leaf/other small leaf",
		toNodeName: "/root/Parent Leaf/small leaf",
		attributes: {
			pairingRate: 89,
			otherMetric: 34
		},
		visible: EdgeVisibility.none
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

export const TEST_FILE_CONTENT: ExportCCFile = {
	projectName: "Sample Map",
	apiVersion: APIVersions.ONE_POINT_TWO,
	nodes: [VALID_NODE]
}

export const TEST_FILE_CONTENT_INVALID_MAJOR_API = {
	fileName: "noFileName",
	projectName: "Invalid Sample Map",
	apiVersion: "2.0",
	nodes: [VALID_NODE]
}

export const TEST_FILE_CONTENT_INVALID_MINOR_API = {
	fileName: "noFileName",
	projectName: "Valid Sample Map Minor API High",
	apiVersion: "1.3",
	nodes: [VALID_NODE]
}

export const TEST_FILE_CONTENT_INVALID_API = {
	fileName: "noFileName",
	projectName: "Invalid Sample Map",
	apiVersion: "2.a",
	nodes: [VALID_NODE]
}

export const TEST_FILE_CONTENT_NO_API = {
	fileName: "noFileName",
	projectName: "Invalid Sample Map",
	nodes: [VALID_NODE]
}

export const FILE_META: FileMeta = {
	fileName: "fileA",
	projectName: "Sample Project",
	apiVersion: packageJson.codecharta.apiVersion
}

export const TEST_FILE_DATA: CCFile = {
	fileMeta: FILE_META,
	map: VALID_NODE,
	settings: {
		fileSettings: {
			attributeTypes: { nodes: {}, edges: {} },
			blacklist: [],
			edges: VALID_EDGES,
			markedPackages: []
		}
	}
}

export const TEST_FILE_WITH_PATHS: CCFile = {
	fileMeta: FILE_META,
	map: {
		name: "root",
		type: NodeType.FOLDER,
		path: "/root",
		attributes: {},
		isExcluded: false,
		isFlattened: false,
		children: [
			{
				name: "big leaf",
				type: NodeType.FILE,
				path: "/root/big leaf",
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				link: "http://www.google.de",
				isExcluded: false,
				isFlattened: false
			},
			{
				name: "Parent Leaf",
				type: NodeType.FOLDER,
				attributes: {},
				path: "/root/Parent Leaf",
				isExcluded: false,
				isFlattened: false,
				children: [
					{
						name: "small leaf",
						type: NodeType.FILE,
						path: "/root/Parent Leaf/small leaf",
						attributes: { rloc: 30, functions: 100, mcc: 100 },
						isExcluded: false,
						isFlattened: false
					},
					{
						name: "other small leaf",
						type: NodeType.FILE,
						path: "/root/Parent Leaf/other small leaf",
						attributes: { rloc: 70, functions: 1000, mcc: 10 },
						isExcluded: false,
						isFlattened: false
					},
					{
						name: "empty folder",
						type: NodeType.FOLDER,
						path: "/root/Parent Leaf/empty folder",
						attributes: {},
						isExcluded: false,
						isFlattened: false,
						children: []
					}
				]
			}
		]
	},
	settings: {
		fileSettings: {
			attributeTypes: { nodes: {}, edges: {} },
			blacklist: [],
			edges: VALID_EDGES,
			markedPackages: []
		}
	}
}

export const METRIC_DISTRIBUTION: MetricDistribution[] = [
	{
		fileExtension: "java",
		absoluteMetricValue: 20,
		relativeMetricValue: 100,
		color: null
	}
]

export const NONE_METRIC_DISTRIBUTION: MetricDistribution[] = [
	{
		fileExtension: "None",
		absoluteMetricValue: null,
		relativeMetricValue: 100,
		color: "#676867"
	}
]

export const SCENARIO: RecursivePartial<Scenario> = {
	name: "Scenario1",
	area: {
		areaMetric: "rloc",
		margin: 48
	},
	height: {
		heightMetric: "mcc",
		heightSlider: new Vector3(1, 1.8, 1),
		labelSlider: 31
	},
	color: {
		colorMetric: "mcc",
		colorRange: {
			from: 19,
			to: 67
		}
	},
	edge: {
		edgeMetric: "pairingRate",
		edgePreview: 5,
		edgeHeight: 4
	},
	camera: {
		camera: new Vector3(0, 300, 1000),
		cameraTarget: new Vector3(1, 1, 1)
	}
}

export const PARTIAL_SETTINGS: RecursivePartial<Settings> = {
	dynamicSettings: {
		areaMetric: "rloc",
		heightMetric: "mcc",
		colorMetric: "mcc",
		edgeMetric: "pairingRate",
		margin: 48,
		colorRange: {
			from: 19,
			to: 67
		}
	},
	appSettings: {
		amountOfTopLabels: 31,
		amountOfEdgePreviews: 5,
		edgeHeight: 4,
		scaling: new Vector3(1, 1.8, 1),
		camera: new Vector3(0, 300, 1000),
		cameraTarget: new Vector3(1, 1, 1)
	}
}

export const SCENARIO_WITH_ONLY_HEIGHT: RecursivePartial<Scenario> = {
	name: "Scenario2",
	height: {
		heightMetric: "mcc",
		labelSlider: 31,
		heightSlider: new Vector3(1, 1.8, 1)
	}
}

export const VALID_NODE_WITH_PATH_AND_EXTENSION: CodeMapNode = {
	name: "root",
	attributes: {},
	type: NodeType.FOLDER,
	path: "/root",
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "big leaf.jpg",
			type: NodeType.FILE,
			path: "/root/big leaf.jpg",
			attributes: { rloc: 100, functions: 10, mcc: 1 },
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "another big leaf.java",
			type: NodeType.FILE,
			path: "/root/another big leaf.java",
			attributes: { rloc: 120, functions: 20, mcc: 2 },
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: {},
			path: "/root/Parent Leaf",
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf.jpg",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/small leaf.json",
					attributes: { rloc: 30, functions: 100, mcc: 100 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "other small leaf.json",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/other small leaf.json",
					attributes: { rloc: 70, functions: 1000, mcc: 10 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "another leaf.java",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/another leaf.java",
					attributes: { rloc: 42, functions: 330, mcc: 45 },
					isExcluded: false,
					isFlattened: false,
					children: []
				},
				{
					name: "leaf without extension",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/leaf without extension",
					attributes: { rloc: 15, functions: 23, mcc: 33 },
					isExcluded: false,
					isFlattened: false,
					children: []
				}
			]
		}
	]
}

export const VALID_NODE_WITH_PATH_AND_DELTAS: CodeMapNode = {
	name: "root",
	attributes: {},
	deltas: {},
	type: NodeType.FOLDER,
	path: "/root",
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "big leaf.jpg",
			type: NodeType.FILE,
			path: "/root/big leaf.jpg",
			attributes: { rloc: 100, functions: 10, mcc: 1 },
			deltas: { rloc: 300, functions: -15, mcc: 12 },
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "another big leaf.java",
			type: NodeType.FILE,
			path: "/root/another big leaf.java",
			attributes: { rloc: 120, functions: 20, mcc: 2 },
			deltas: { rloc: -150, functions: 9, mcc: 33 },
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: {},
			deltas: {},
			path: "/root/Parent Leaf",
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf.jpg",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/small leaf.json",
					attributes: { rloc: 30, functions: 100, mcc: 100 },
					deltas: { rloc: -55, functions: 38, mcc: -40 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "other small leaf.json",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/other small leaf.json",
					attributes: { rloc: 70, functions: 1000, mcc: 10 },
					deltas: { rloc: 200, functions: -27, mcc: 65 },
					isExcluded: false,
					isFlattened: false
				}
			]
		}
	]
}

export const VALID_NODE_WITHOUT_RLOC_METRIC: CodeMapNode = {
	name: "root",
	attributes: {},
	type: NodeType.FOLDER,
	path: "/root",
	isExcluded: false,
	isFlattened: false,
	children: [
		{
			name: "big leaf.jpg",
			type: NodeType.FILE,
			path: "/root/big leaf.jpg",
			attributes: { rloc: 0, functions: 10, mcc: 1 },
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "another big leaf.java",
			type: NodeType.FILE,
			path: "/root/another big leaf.java",
			attributes: { rloc: 0, functions: 20, mcc: 2 },
			isExcluded: false,
			isFlattened: false
		}
	]
}

export const TEST_DELTA_MAP_A: CCFile = {
	fileMeta: {
		fileName: "fileA",
		projectName: "Sample Project",
		apiVersion: packageJson.codecharta.apiVersion
	},
	map: {
		name: "root",
		type: NodeType.FOLDER,
		attributes: {},
		isExcluded: false,
		isFlattened: false,
		children: [
			{
				name: "big leaf",
				type: NodeType.FILE,
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				link: "http://www.google.de",
				isExcluded: false,
				isFlattened: false
			},
			{
				name: "Parent Leaf",
				type: NodeType.FOLDER,
				attributes: {},
				isExcluded: false,
				isFlattened: false,
				children: [
					{
						name: "small leaf",
						type: NodeType.FILE,
						attributes: { rloc: 30, functions: 100, mcc: 100 },
						isExcluded: false,
						isFlattened: false
					},
					{
						name: "other small leaf",
						type: NodeType.FILE,
						attributes: { rloc: 70, functions: 1000, mcc: 10 },
						isExcluded: false,
						isFlattened: false
					}
				]
			}
		]
	},
	settings: {
		fileSettings: {
			attributeTypes: { nodes: {}, edges: {} },
			blacklist: [],
			edges: VALID_EDGES,
			markedPackages: []
		}
	}
}

export const TEST_DELTA_MAP_B: CCFile = {
	fileMeta: {
		fileName: "fileB",
		projectName: "Sample Project",
		apiVersion: packageJson.codecharta.apiVersion
	},
	map: {
		name: "root",
		type: NodeType.FOLDER,
		attributes: {},
		isExcluded: false,
		isFlattened: false,
		children: [
			{
				name: "big leaf",
				type: NodeType.FILE,
				attributes: { rloc: 20, functions: 10, mcc: 1 },
				link: "http://www.google.de",
				isExcluded: false,
				isFlattened: false
			},
			{
				name: "additional leaf",
				type: NodeType.FILE,
				attributes: { rloc: 10, functions: 11, mcc: 5 },
				link: "http://www.google.de",
				isExcluded: false,
				isFlattened: false
			},
			{
				name: "Parent Leaf",
				type: NodeType.FOLDER,
				attributes: {},
				isExcluded: false,
				isFlattened: false,
				children: [
					{
						name: "small leaf",
						type: NodeType.FILE,
						attributes: { rloc: 30, functions: 100, mcc: 100, more: 20 },
						isExcluded: false,
						isFlattened: false
					},
					{
						name: "other small leaf",
						type: NodeType.FILE,
						attributes: { rloc: 70, functions: 1000 },
						isExcluded: false,
						isFlattened: false
					},
					{
						name: "big leaf",
						type: NodeType.FILE,
						attributes: { rloc: 20, functions: 10, mcc: 1 },
						link: "http://www.google.de",
						isExcluded: false,
						isFlattened: false
					}
				]
			}
		]
	},
	settings: {
		fileSettings: {
			attributeTypes: { nodes: {}, edges: {} },
			blacklist: [],
			edges: VALID_EDGES,
			markedPackages: []
		}
	}
}

export const TEST_FILE_DATA_DOWNLOADED = {
	apiVersion: packageJson.codecharta.apiVersion,
	attributeTypes: {},
	blacklist: [
		{ path: "/root/bigLeaf.ts", type: "hide" },
		{ path: "/root/sample1OnlyLeaf.scss", type: "exclude" }
	],
	edges: [
		{
			attributes: {
				avgCommits: 34,
				pairingRate: 89
			},
			fromNodeName: "/root/big leaf",
			toNodeName: "/root/Parent Leaf/small leaf"
		},
		{
			attributes: {
				avgCommits: 34,
				pairingRate: 89
			},
			fromNodeName: "/root/Parent Leaf/small leaf",
			toNodeName: "/root/different leaf"
		},
		{
			attributes: {
				otherMetric: 34,
				pairingRate: 89
			},
			fromNodeName: "/root/Parent Leaf/other small leaf",
			toNodeName: "/root/Parent Leaf/small leaf"
		}
	],
	markedPackages: [],
	nodes: [
		{
			attributes: {},
			children: [
				{
					attributes: {
						functions: 10,
						mcc: 1,
						rloc: 100
					},
					link: "http://www.google.de",
					name: "big leaf",
					type: NodeType.FILE
				},
				{
					attributes: {},
					children: [
						{
							attributes: {
								functions: 100,
								mcc: 100,
								rloc: 30
							},
							name: "small leaf",
							type: NodeType.FILE
						},
						{
							attributes: {
								functions: 1000,
								mcc: 10,
								rloc: 70
							},
							name: "other small leaf",
							type: NodeType.FILE
						}
					],
					name: "Parent Leaf",
					type: NodeType.FOLDER
				}
			],
			name: "root",
			type: NodeType.FOLDER
		}
	],
	projectName: "Sample Project"
}

export const FILE_STATES: FileState[] = [
	{
		file: TEST_FILE_DATA,
		selectedAs: FileSelectionState.Single
	}
]

export const METRIC_DATA: NodeMetricData[] = [
	{ name: "mcc", maxValue: 1 },
	{ name: "rloc", maxValue: 2 }
]

export const EDGE_METRIC_DATA: EdgeMetricData[] = [
	{ name: "pairing_rate", maxValue: 10 },
	{ name: "average_commits", maxValue: 20 }
]

export const STATE: State = {
	fileSettings: {
		attributeTypes: {
			nodes: {
				rloc: AttributeTypeValue.absolute,
				mcc: AttributeTypeValue.absolute,
				coverage: AttributeTypeValue.relative,
				pairing_rate: AttributeTypeValue.absolute
			},
			edges: {}
		},
		blacklist: [],
		edges: VALID_EDGES,
		markedPackages: []
	},
	dynamicSettings: {
		areaMetric: "rloc",
		heightMetric: "mcc",
		colorMetric: "mcc",
		distributionMetric: "mcc",
		edgeMetric: "pairingRate",
		focusedNodePath: "/root/ParentLeaf",
		searchedNodePaths: new Set(),
		searchPattern: "",
		margin: 48,
		colorRange: {
			from: 19,
			to: 67
		},
		sortingOption: SortingOption.NAME
	},
	appSettings: {
		amountOfTopLabels: 31,
		amountOfEdgePreviews: 5,
		edgeHeight: 4,
		scaling: new Vector3(1, 1.8, 1),
		camera: new Vector3(0, 300, 1000),
		cameraTarget: new Vector3(177, 0, 299),
		invertDeltaColors: false,
		hideFlatBuildings: true,
		invertHeight: true,
		invertColorRange: false,
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
			markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff", "#FFFF1D"],
			incomingEdge: "#00ffff",
			outgoingEdge: "#ff00ff"
		},
		isPresentationMode: false,
		showOnlyBuildingsWithEdges: false,
		resetCameraIfNewFileIsLoaded: true,
		isLoadingMap: true,
		isLoadingFile: true,
		sortingOrderAscending: false,
		searchPanelMode: SearchPanelMode.treeView,
		isAttributeSideBarVisible: true,
		panelSelection: PanelSelection.AREA_PANEL_OPEN
	},
	treeMap: {
		mapSize: 250
	},
	files: [],
	lookUp: {
		idToNode: new Map(),
		idToBuilding: new Map()
	},
	metricData: {
		nodeMetricData: METRIC_DATA,
		edgeMetricData: EDGE_METRIC_DATA
	}
}

export const DEFAULT_STATE: State = {
	appSettings: {
		amountOfTopLabels: 1,
		amountOfEdgePreviews: 1,
		edgeHeight: 4,
		camera: new Vector3(0, 300, 1000),
		cameraTarget: new Vector3(177, 0, 299),
		invertDeltaColors: false,
		dynamicMargin: true,
		hideFlatBuildings: false,
		invertHeight: false,
		invertColorRange: false,
		isWhiteBackground: false,
		mapColors: {
			angularGreen: "#00BFA5",
			base: "#666666",
			defaultC: "#89ACB4",
			flat: "#AAAAAA",
			lightGrey: "#DDDDDD",
			markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff", "#FFFF1D"],
			negative: "#820E0E",
			negativeDelta: "#ff0E0E",
			neutral: "#ddcc00",
			positive: "#69AE40",
			positiveDelta: "#69FF40",
			selected: "#EB8319",
			incomingEdge: "#00ffff",
			outgoingEdge: "#ff00ff"
		},
		scaling: new Vector3(1, 1, 1),
		whiteColorBuildings: false,
		isPresentationMode: false,
		showOnlyBuildingsWithEdges: false,
		resetCameraIfNewFileIsLoaded: true,
		isLoadingMap: true,
		isLoadingFile: true,
		sortingOrderAscending: false,
		searchPanelMode: SearchPanelMode.minimized,
		isAttributeSideBarVisible: false,
		panelSelection: PanelSelection.NONE
	},
	dynamicSettings: {
		areaMetric: null,
		colorMetric: null,
		focusedNodePath: "",
		heightMetric: null,
		distributionMetric: null,
		edgeMetric: null,
		margin: null,
		colorRange: {
			from: null,
			to: null
		},
		searchPattern: "",
		searchedNodePaths: new Set(),
		sortingOption: SortingOption.NAME
	},
	fileSettings: { attributeTypes: { nodes: {}, edges: {} }, blacklist: [], edges: [], markedPackages: [] },
	treeMap: { mapSize: 250 },
	files: [],
	lookUp: {
		idToBuilding: new Map(),
		idToNode: new Map()
	},
	metricData: {
		nodeMetricData: [],
		edgeMetricData: []
	}
}

export const TEST_NODE_ROOT: Node = {
	name: "root",
	id: 0,
	width: 1,
	height: 2,
	length: 3,
	depth: 4,
	x0: 5,
	z0: 6,
	y0: 7,
	isLeaf: true,
	deltas: { a: 1, b: 2 },
	attributes: { a: 20, b: 15 },
	edgeAttributes: { a: { incoming: 2, outgoing: 666 } },
	heightDelta: 10,
	visible: true,
	path: "/root",
	link: "NO_LINK",
	markingColor: "0x000000",
	flat: false,
	color: "#AABBCC",
	incomingEdgePoint: new Vector3(),
	outgoingEdgePoint: new Vector3()
}

export const SCENARIO_ATTRIBUTE_CONTENT: AddScenarioContent[] = [
	{
		metricType: ScenarioMetricType.CAMERA_POSITION,
		metricName: "",
		savedValues: { camera: new Vector3(0, 300, 1000), cameraTarget: new Vector3(177, 0, 299) },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.AREA_METRIC,
		metricName: "rloc",
		savedValues: 48,
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.HEIGHT_METRIC,
		metricName: "mcc",
		savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.COLOR_METRIC,
		metricName: "mcc",
		savedValues: { from: 19, to: 67 },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.EDGE_METRIC,
		metricName: "pairingRate",
		savedValues: { edgePreview: 5, edgeHeight: 4 },
		isSelected: true,
		isDisabled: false
	}
]

export const SCENARIO_ATTRIBUTE_CONTENT_CAMERA_UNSELECTED: AddScenarioContent[] = [
	{
		metricType: ScenarioMetricType.CAMERA_POSITION,
		metricName: null,
		savedValues: new Vector3(0, 300, 1000),
		isSelected: false,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.AREA_METRIC,
		metricName: "rloc",
		savedValues: 48,
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.HEIGHT_METRIC,
		metricName: "mcc",
		savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.COLOR_METRIC,
		metricName: "mcc",
		savedValues: { from: 19, to: 67 },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.EDGE_METRIC,
		metricName: "pairingRate",
		savedValues: { edgePreview: 5, edgeHeight: 4 },
		isSelected: true,
		isDisabled: false
	}
]

export const SCENARIO_ATTRIBUTE_CONTENT_WITHOUT_CAMERA: AddScenarioContent[] = [
	{
		metricType: ScenarioMetricType.AREA_METRIC,
		metricName: "rloc",
		savedValues: 48,
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.HEIGHT_METRIC,
		metricName: "mcc",
		savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.COLOR_METRIC,
		metricName: "mcc",
		savedValues: { from: 19, to: 67 },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.EDGE_METRIC,
		metricName: "pairingRate",
		savedValues: { edgePreview: 5, edgeHeight: 4 },
		isSelected: true,
		isDisabled: false
	}
]

export const SCENARIO_ITEMS: ScenarioItem[] = [
	{
		scenarioName: "Scenario",
		isScenarioApplicable: true,
		icons: [{ faIconClass: "fa fa-random", isSaved: false, tooltip: "random" }]
	},
	{
		scenarioName: "Scenario2",
		isScenarioApplicable: false,
		icons: [{ faIconClass: "fa fa-some", isSaved: true, tooltip: "some" }]
	}
]

export const SCENARIO_ITEM_WITH_EVERYTHING_SAVED: ScenarioItem[] = [
	{
		scenarioName: "Scenario1",
		isScenarioApplicable: false,
		icons: [
			{
				faIconClass: "fa-video-camera",
				isSaved: true,
				tooltip: "Camera angle"
			},
			{
				faIconClass: "fa-arrows-alt",
				isSaved: true,
				tooltip: "Area metric"
			},
			{
				faIconClass: "fa-arrows-v",
				isSaved: true,
				tooltip: "Height metric"
			},
			{
				faIconClass: "fa-paint-brush",
				isSaved: true,
				tooltip: "Color metric"
			},
			{
				faIconClass: "fa-exchange",
				isSaved: true,
				tooltip: "Edge metric"
			}
		]
	}
]

export const TEST_NODE_LEAF: Node = {
	name: "root/big leaf.ts",
	id: 1,
	width: 1,
	height: 2,
	length: 3,
	depth: 4,
	x0: 5,
	z0: 6,
	y0: 7,
	isLeaf: true,
	deltas: { a: 1, b: 2 },
	attributes: { a: 20, b: 15 },
	edgeAttributes: { a: { incoming: 2, outgoing: 666 } },
	heightDelta: 20,
	visible: true,
	path: "/root/big leaf",
	link: "NO_LINK",
	markingColor: "0xFFFFFF",
	flat: false,
	color: "#AABBCC",
	incomingEdgePoint: new Vector3(),
	outgoingEdgePoint: new Vector3()
}

export const TEST_NODES: Node[] = [TEST_NODE_ROOT, TEST_NODE_LEAF]

export const INCOMING_NODE: Node = {
	name: "root/small leaf",
	id: 2,
	width: 1,
	height: 2,
	length: 3,
	depth: 4,
	x0: 5,
	z0: 6,
	y0: 7,
	isLeaf: true,
	deltas: { a: 1, b: 2 },
	attributes: { a: 20, b: 15, mcc: 14 },
	edgeAttributes: { a: { incoming: 2, outgoing: 666 } },
	heightDelta: 20,
	visible: true,
	path: "/root/Parent Leaf/small leaf",
	link: "NO_LINK",
	markingColor: "0xFFFFFF",
	flat: false,
	color: "#AABBCC",
	incomingEdgePoint: new Vector3(1, 2, 3),
	outgoingEdgePoint: new Vector3(1, 2, 3)
}

export const OUTGOING_NODE: Node = {
	name: "root/big leaf",
	id: 1,
	width: 1,
	height: 2,
	length: 3,
	depth: 4,
	x0: 5,
	z0: 6,
	y0: 7,
	isLeaf: true,
	deltas: { a: 1, b: 2 },
	attributes: { a: 20, b: 15, mcc: 14 },
	edgeAttributes: { a: { incoming: 2, outgoing: 666 } },
	heightDelta: 20,
	visible: true,
	path: "/root/big leaf",
	link: "NO_LINK",
	markingColor: "0xFFFFFF",
	flat: false,
	color: "#AABBCC",
	incomingEdgePoint: new Vector3(1, 2, 3),
	outgoingEdgePoint: new Vector3(1, 2, 3)
}

export const DIFFERENT_NODE: Node = {
	name: "root/different leaf",
	id: 3,
	width: 1,
	height: 2,
	length: 3,
	depth: 4,
	x0: 5,
	z0: 6,
	y0: 7,
	isLeaf: true,
	deltas: { a: 1, b: 2 },
	attributes: { a: 20, b: 15, mcc: 14 },
	edgeAttributes: { a: { incoming: 2, outgoing: 666 } },
	heightDelta: 20,
	visible: true,
	path: "/root/different leaf",
	link: "NO_LINK",
	markingColor: "0xFFFFFF",
	flat: false,
	color: "#AABBCC",
	incomingEdgePoint: new Vector3(1, 2, 3),
	outgoingEdgePoint: new Vector3(1, 2, 3)
}

export const CODE_MAP_BUILDING: CodeMapBuilding = new CodeMapBuilding(
	1,
	new Box3(),
	TEST_NODE_ROOT,
	DEFAULT_STATE.appSettings.mapColors.neutral
)

export const CODE_MAP_BUILDING_TS_NODE: CodeMapBuilding = new CodeMapBuilding(
	1,
	new Box3(),
	TEST_NODE_LEAF,
	DEFAULT_STATE.appSettings.mapColors.neutral
)

export const CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE: CodeMapBuilding = new CodeMapBuilding(
	1,
	new Box3(),
	OUTGOING_NODE,
	DEFAULT_STATE.appSettings.mapColors.neutral
)

export const CODE_MAP_BUILDING_WITH_INCOMING_EDGE_NODE: CodeMapBuilding = new CodeMapBuilding(
	2,
	new Box3(),
	INCOMING_NODE,
	DEFAULT_STATE.appSettings.mapColors.neutral
)

export const BLACKLIST: BlacklistItem[] = [
	{
		path: "/my/path",
		type: BlacklistType.flatten
	},
	{
		path: "/my/different/path",
		type: BlacklistType.exclude
	},
	{
		path: "/my/first/path",
		type: BlacklistType.exclude
	}
]

export const MARKED_PACKAGES: MarkedPackage[] = [
	{
		path: "/my/path",
		color: "#AABBCC"
	},
	{
		path: "/my/different/path",
		color: "#DDEEFF"
	},
	{
		path: "/my/first/path",
		color: "#123456"
	},
	{
		path: "/my/last/path",
		color: "#345678"
	}
]

export function withMockedEventMethods($rootScope: IRootScopeService) {
	$rootScope.$broadcast = jest.fn()
	$rootScope.$on = jest.fn()
	$rootScope.$digest = jest.fn()
	$rootScope.$apply = jest.fn()
}

export function setIsBlacklisted(paths: string[], map: CodeMapNode, type: BlacklistType) {
	hierarchy(map)
		.leaves()
		.forEach(node => {
			if (paths.includes(node.data.path)) {
				setBlacklistFlagByType(node.data, type, true)
			}
		})
}

function setBlacklistFlagByType(node: CodeMapNode, type: BlacklistType, flag: boolean) {
	if (type === BlacklistType.exclude) {
		node.isExcluded = flag
	} else {
		node.isFlattened = flag
	}
}

export function setupFiles(): FileState[] {
	return [
		{ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.None },
		{ file: TEST_DELTA_MAP_B, selectedAs: FileSelectionState.None }
	]
}
