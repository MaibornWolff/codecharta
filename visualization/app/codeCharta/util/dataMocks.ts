import {
	AttributeTypeValue,
	BlacklistItem,
	CCFile,
	CodeMapNode,
	Edge,
	FileSelectionState,
	FileState,
	MarkedPackage,
	MetricData,
	Node,
	BlacklistType,
	EdgeVisibility,
	NodeType,
	SortingOption,
	SearchPanelMode,
	State
} from "../codeCharta.model"
import { CodeMapBuilding } from "../ui/codeMap/rendering/codeMapBuilding"
import { MetricDistribution } from "./fileExtensionCalculator"
import { Box3, Vector3 } from "three"
import { IRootScopeService } from "angular"
import { Scenario } from "./scenarioHelper"
import { AddScenarioContent, ScenarioMetricType } from "../ui/dialog/dialog.addScenarioSettings.component"
import { Files } from "../model/files"
import { ScenarioItem } from "../ui/scenarioDropDown/scenarioDropDown.component"
import { MetricService } from "../state/metric.service"

export const VALID_NODE: CodeMapNode = {
	name: "root",
	attributes: {},
	type: NodeType.FOLDER,
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1 },
			link: "http://www.google.de"
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: {},
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100 }
				},
				{
					name: "other small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 70, functions: 1000, mcc: 10 }
				}
			]
		}
	]
}

export const VALID_NODE_WITH_MULTIPLE_FOLDERS: CodeMapNode = {
	name: "root",
	attributes: { [MetricService.UNARY_METRIC]: 200 },
	type: NodeType.FOLDER,
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [MetricService.UNARY_METRIC]: 1 },
			link: "http://www.google.de"
		},
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [MetricService.UNARY_METRIC]: 60 },
			children: []
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [MetricService.UNARY_METRIC]: 40 },
			children: []
		},
		{
			name: "Folder3",
			type: NodeType.FOLDER,
			attributes: { [MetricService.UNARY_METRIC]: 160 },
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [MetricService.UNARY_METRIC]: 1 }
				}
			]
		}
	]
}

export const VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED: CodeMapNode = {
	name: "root",
	attributes: { [MetricService.UNARY_METRIC]: 200 },
	type: NodeType.FOLDER,
	children: [
		{
			name: "Folder3",
			type: NodeType.FOLDER,
			attributes: { [MetricService.UNARY_METRIC]: 160 },
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [MetricService.UNARY_METRIC]: 1 }
				}
			]
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [MetricService.UNARY_METRIC]: 40 },
			children: []
		},
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [MetricService.UNARY_METRIC]: 60 },
			children: []
		},
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [MetricService.UNARY_METRIC]: 1 },
			link: "http://www.google.de"
		}
	]
}

export const VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY: CodeMapNode = {
	name: "root",
	attributes: { [MetricService.UNARY_METRIC]: 200 },
	type: NodeType.FOLDER,
	children: [
		{
			name: "Folder3",
			type: NodeType.FOLDER,
			attributes: { [MetricService.UNARY_METRIC]: 160 },
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [MetricService.UNARY_METRIC]: 1 }
				}
			]
		},
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [MetricService.UNARY_METRIC]: 60 },
			children: []
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [MetricService.UNARY_METRIC]: 40 },
			children: []
		},
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [MetricService.UNARY_METRIC]: 1 },
			link: "http://www.google.de"
		}
	]
}

export const VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME: CodeMapNode = {
	name: "root",
	attributes: { [MetricService.UNARY_METRIC]: 200 },
	type: NodeType.FOLDER,
	children: [
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [MetricService.UNARY_METRIC]: 60 },
			children: []
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [MetricService.UNARY_METRIC]: 40 },
			children: []
		},
		{
			name: "Folder3",
			type: NodeType.FOLDER,
			attributes: { [MetricService.UNARY_METRIC]: 160 },
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [MetricService.UNARY_METRIC]: 1 }
				}
			]
		},
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [MetricService.UNARY_METRIC]: 1 },
			link: "http://www.google.de"
		}
	]
}

export const VALID_NODE_WITH_PATH: CodeMapNode = {
	name: "root",
	attributes: {},
	type: NodeType.FOLDER,
	path: "/root",
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			path: "/root/big leaf",
			attributes: { rloc: 100, functions: 10, mcc: 1 },
			link: "http://www.google.de"
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: {},
			path: "/root/Parent Leaf",
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/small leaf",
					attributes: { rloc: 30, functions: 100, mcc: 100 }
				},
				{
					name: "other small leaf",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/other small leaf",
					attributes: { rloc: 70, functions: 1000, mcc: 10 }
				},
				{
					name: "empty folder",
					type: NodeType.FOLDER,
					path: "/root/Parent Leaf/empty folder",
					attributes: {},
					children: []
				}
			]
		}
	]
}

export const VALID_NODE_WITH_ROOT_UNARY: CodeMapNode = {
	name: "root",
	attributes: { [MetricService.UNARY_METRIC]: 200 },
	type: NodeType.FOLDER,
	path: "/root",
	children: [
		{
			name: "first leaf",
			type: NodeType.FILE,
			path: "/root/first leaf",
			attributes: { [MetricService.UNARY_METRIC]: 100, functions: 10, mcc: 1 }
		},
		{
			name: "second leaf",
			type: NodeType.FILE,
			path: "/root/second leaf",
			attributes: { [MetricService.UNARY_METRIC]: 100, functions: 5, mcc: 1 }
		}
	]
}

export const VALID_NODE_DECORATED: CodeMapNode = {
	name: "root",
	attributes: { rloc: 100, functions: 10, mcc: 1, [MetricService.UNARY_METRIC]: 5 },
	type: NodeType.FOLDER,
	path: "/root",
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			path: "/root/big leaf",
			attributes: { rloc: 100, functions: 10, mcc: 1, [MetricService.UNARY_METRIC]: 1 },
			link: "http://www.google.de"
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: { rloc: 100, functions: 10, mcc: 1, [MetricService.UNARY_METRIC]: 1 },
			path: "/root/Parent Leaf",
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/small leaf",
					attributes: { rloc: 30, functions: 100, mcc: 100, [MetricService.UNARY_METRIC]: 1 }
				},
				{
					name: "other small leaf",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/other small leaf",
					attributes: { rloc: 70, functions: 1000, mcc: 10, [MetricService.UNARY_METRIC]: 1 },
					edgeAttributes: { Imports: { incoming: 12, outgoing: 13 } },
					visible: true
				}
			]
		}
	]
}

export const VALID_NODE_WITH_METRICS: CodeMapNode = {
	name: "root",
	type: NodeType.FOLDER,
	attributes: { rloc: 100, functions: 10, mcc: 1 }
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

export const TEST_FILE_CONTENT = {
	fileName: "noFileName",
	projectName: "Sample Map",
	apiVersion: "1.1",
	nodes: [VALID_NODE]
}

export const FILE_META = {
	fileName: "fileA",
	projectName: "Sample Project",
	apiVersion: "1.1"
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
		children: [
			{
				name: "big leaf",
				type: NodeType.FILE,
				path: "/root/big leaf",
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				link: "http://www.google.de"
			},
			{
				name: "Parent Leaf",
				type: NodeType.FOLDER,
				attributes: {},
				path: "/root/Parent Leaf",
				children: [
					{
						name: "small leaf",
						type: NodeType.FILE,
						path: "/root/Parent Leaf/small leaf",
						attributes: { rloc: 30, functions: 100, mcc: 100 }
					},
					{
						name: "other small leaf",
						type: NodeType.FILE,
						path: "/root/Parent Leaf/other small leaf",
						attributes: { rloc: 70, functions: 1000, mcc: 10 }
					},
					{
						name: "empty folder",
						type: NodeType.FOLDER,
						path: "/root/Parent Leaf/empty folder",
						attributes: {},
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

export const DEFAULT_SCENARIO: Scenario[] = [
	{
		name: "Complexity",
		settings: {
			appSettings: {
				invertColorRange: false
			},
			dynamicSettings: {
				areaMetric: "rloc",
				heightMetric: "mcc",
				colorMetric: "mcc",
				distributionMetric: "rloc"
			}
		}
	},
	{
		name: "Average Complexity*",
		settings: {
			appSettings: {
				invertColorRange: false
			},
			dynamicSettings: {
				areaMetric: "unary",
				heightMetric: "Average Complexity*",
				colorMetric: "Average Complexity*",
				distributionMetric: "unary"
			}
		}
	},
	{
		name: "Coverage",
		settings: {
			appSettings: {
				invertColorRange: true
			},
			dynamicSettings: {
				areaMetric: "rloc",
				heightMetric: "mcc",
				colorMetric: "line_coverage",
				distributionMetric: "rloc"
			}
		}
	},
	{
		name: "Code Churn",
		settings: {
			appSettings: {
				invertColorRange: false
			},
			dynamicSettings: {
				areaMetric: "rloc",
				heightMetric: "abs_code_churn",
				colorMetric: "weeks_with_commits",
				distributionMetric: "rloc"
			}
		}
	}
]

export const SCENARIO: Scenario = {
	name: "Scenario1",
	settings: {
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
}

export const SCENARIO_WITH_ONLY_HEIGHT: Scenario = {
	name: "Scenario2",
	settings: {
		dynamicSettings: {
			heightMetric: "mcc"
		},
		appSettings: {
			amountOfTopLabels: 31,
			scaling: new Vector3(1, 1.8, 1)
		}
	}
}

export const VALID_NODE_WITH_PATH_AND_EXTENSION: CodeMapNode = {
	name: "root",
	attributes: {},
	type: NodeType.FOLDER,
	path: "/root",
	children: [
		{
			name: "big leaf.jpg",
			type: NodeType.FILE,
			path: "/root/big leaf.jpg",
			attributes: { rloc: 100, functions: 10, mcc: 1 }
		},
		{
			name: "another big leaf.java",
			type: NodeType.FILE,
			path: "/root/another big leaf.java",
			attributes: { rloc: 120, functions: 20, mcc: 2 }
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: {},
			path: "/root/Parent Leaf",
			children: [
				{
					name: "small leaf.jpg",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/small leaf.json",
					attributes: { rloc: 30, functions: 100, mcc: 100 }
				},
				{
					name: "other small leaf.json",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/other small leaf.json",
					attributes: { rloc: 70, functions: 1000, mcc: 10 }
				},
				{
					name: "another leaf.java",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/another leaf.java",
					attributes: { rloc: 42, functions: 330, mcc: 45 },
					children: []
				},
				{
					name: "leaf without extension",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/leaf without extension",
					attributes: { rloc: 15, functions: 23, mcc: 33 },
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
	children: [
		{
			name: "big leaf.jpg",
			type: NodeType.FILE,
			path: "/root/big leaf.jpg",
			attributes: { rloc: 100, functions: 10, mcc: 1 },
			deltas: { rloc: 300, functions: -15, mcc: 12 }
		},
		{
			name: "another big leaf.java",
			type: NodeType.FILE,
			path: "/root/another big leaf.java",
			attributes: { rloc: 120, functions: 20, mcc: 2 },
			deltas: { rloc: -150, functions: 9, mcc: 33 }
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: {},
			deltas: {},
			path: "/root/Parent Leaf",
			children: [
				{
					name: "small leaf.jpg",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/small leaf.json",
					attributes: { rloc: 30, functions: 100, mcc: 100 },
					deltas: { rloc: -55, functions: 38, mcc: -40 }
				},
				{
					name: "other small leaf.json",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/other small leaf.json",
					attributes: { rloc: 70, functions: 1000, mcc: 10 },
					deltas: { rloc: 200, functions: -27, mcc: 65 }
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
	children: [
		{
			name: "big leaf.jpg",
			type: NodeType.FILE,
			path: "/root/big leaf.jpg",
			attributes: { rloc: 0, functions: 10, mcc: 1 }
		},
		{
			name: "another big leaf.java",
			type: NodeType.FILE,
			path: "/root/another big leaf.java",
			attributes: { rloc: 0, functions: 20, mcc: 2 }
		}
	]
}

export const TEST_DELTA_MAP_A: CCFile = {
	fileMeta: {
		fileName: "fileA",
		projectName: "Sample Project",
		apiVersion: "1.1"
	},
	map: {
		name: "root",
		type: NodeType.FOLDER,
		attributes: {},
		children: [
			{
				name: "big leaf",
				type: NodeType.FILE,
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				link: "http://www.google.de"
			},
			{
				name: "Parent Leaf",
				type: NodeType.FOLDER,
				attributes: {},
				children: [
					{
						name: "small leaf",
						type: NodeType.FILE,
						attributes: { rloc: 30, functions: 100, mcc: 100 }
					},
					{
						name: "other small leaf",
						type: NodeType.FILE,
						attributes: { rloc: 70, functions: 1000, mcc: 10 }
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
		apiVersion: "1.1"
	},
	map: {
		name: "root",
		type: NodeType.FOLDER,
		attributes: {},
		children: [
			{
				name: "big leaf",
				type: NodeType.FILE,
				attributes: { rloc: 20, functions: 10, mcc: 1 },
				link: "http://www.google.de"
			},
			{
				name: "additional leaf",
				type: NodeType.FILE,
				attributes: { rloc: 10, functions: 11, mcc: 5 },
				link: "http://www.google.de"
			},
			{
				name: "Parent Leaf",
				type: NodeType.FOLDER,
				attributes: {},
				children: [
					{
						name: "small leaf",
						type: NodeType.FILE,
						attributes: { rloc: 30, functions: 100, mcc: 100, more: 20 }
					},
					{
						name: "other small leaf",
						type: NodeType.FILE,
						attributes: { rloc: 70, functions: 1000 }
					},
					{
						name: "big leaf",
						type: NodeType.FILE,
						attributes: { rloc: 20, functions: 10, mcc: 1 },
						link: "http://www.google.de"
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
	apiVersion: "1.1",
	attributeTypes: {},
	blacklist: [{ path: "/root/bigLeaf.ts", type: "hide" }, { path: "/root/sample1OnlyLeaf.scss", type: "exclude" }],
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

// @ts-ignore
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
		isAttributeSideBarVisible: true
	},
	treeMap: {
		mapSize: 250
	},
	files: new Files()
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
		isAttributeSideBarVisible: false
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
	files: new Files()
}

export const TEST_NODE_ROOT: Node = {
	name: "root",
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
		metricName: null,
		savedValues: { camera: new Vector3(0, 300, 1000), cameraTarget: new Vector3(177, 0, 299) },
		isSelected: true,
		isDisabled: false
	},
	{ metricType: ScenarioMetricType.AREA_METRIC, metricName: "rloc", savedValues: 48, isSelected: true, isDisabled: false },
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
	{ metricType: ScenarioMetricType.AREA_METRIC, metricName: "rloc", savedValues: 48, isSelected: true, isDisabled: false },
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
	{ metricType: ScenarioMetricType.AREA_METRIC, metricName: "rloc", savedValues: 48, isSelected: true, isDisabled: false },
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

export const SCENARIO_ATTRIBUTE_CONTENT_NONE_SELECTED: AddScenarioContent[] = [
	{ metricType: ScenarioMetricType.AREA_METRIC, metricName: "rloc", savedValues: 48, isSelected: false, isDisabled: false },
	{
		metricType: ScenarioMetricType.HEIGHT_METRIC,
		metricName: "mcc",
		savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
		isSelected: false,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.COLOR_METRIC,
		metricName: "mcc",
		savedValues: { from: 19, to: 67 },
		isSelected: false,
		isDisabled: false
	},
	{
		metricType: ScenarioMetricType.EDGE_METRIC,
		metricName: "pairingRate",
		savedValues: { edgePreview: 5, edgeHeight: 4 },
		isSelected: false,
		isDisabled: false
	}
]

export const SCENARIO_ITEMS: ScenarioItem[] = [
	{ scenarioName: "Scenario", isScenarioAppliable: true, icons: [{ faIconClass: "fa fa-random", isSaved: false }] },
	{ scenarioName: "Scenario2", isScenarioAppliable: false, icons: [{ faIconClass: "fa fa-some", isSaved: true }] }
]

export const TEST_NODE_LEAF: Node = {
	name: "root/big leaf.ts",
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

export const OUTGOING_NODE: Node = {
	name: "root/big leaf",
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

export const METRIC_DATA: MetricData[] = [{ name: "mcc", maxValue: 1 }, { name: "rloc", maxValue: 2 }]

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
