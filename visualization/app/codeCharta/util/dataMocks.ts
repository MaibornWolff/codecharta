import {
	AttributeTypeValue,
	BlacklistItem,
	BlacklistType,
	CCFile,
	CodeMapNode,
	ColorMode,
	Edge,
	EdgeMetricData,
	EdgeVisibility,
	FileMeta,
	GlobalSettings,
	LayoutAlgorithm,
	MarkedPackage,
	Node,
	NodeMetricData,
	NodeType,
	RecursivePartial,
	Scenario,
	Settings,
	SharpnessMode,
	SortingOption,
	State
} from "../codeCharta.model"
import { CodeMapBuilding } from "../ui/codeMap/rendering/codeMapBuilding"
import { Box3, Vector3 } from "three"
import { IRootScopeService } from "angular"
import { hierarchy } from "d3-hierarchy"
import { FileSelectionState, FileState } from "../model/files/files"
import { APIVersions, ExportCCFile } from "../codeCharta.api.model"
import packageJson from "../../../package.json"
import { isLeaf } from "./codeMapHelper"
import { CustomConfigItemGroup } from "../ui/customConfigs/customConfigs.component"
import { CustomConfigMapSelectionMode } from "../model/customConfig/customConfig.api.model"
import { ScenarioItem, ScenarioMetricProperty } from "../ui/ribbonBar/showScenariosButton/scenarioHelper"
import { UNARY_METRIC } from "../state/selectors/accumulatedData/metricData/nodeMetricData.selector"

const DEFAULT_FILE_META = {
	projectName: "Sample Project",
	apiVersion: packageJson.codecharta.apiVersion,
	exportedFileSize: 300_000,
	fileName: "file",
	fileChecksum: "md5-delta-file"
}

const DEFAULT_FILE_MAP: CodeMapNode = {
	name: "root",
	type: NodeType.FOLDER,
	attributes: {},
	isExcluded: false,
	isFlattened: false,
	children: []
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

const DEFAULT_ROOT: CodeMapNode = { name: "root", attributes: {}, type: NodeType.FOLDER, isExcluded: false, isFlattened: false }

const DEFAULT_SETTINGS = {
	fileSettings: {
		attributeTypes: { nodes: {}, edges: {} },
		blacklist: [],
		edges: VALID_EDGES,
		markedPackages: []
	}
}
export const DEFAULT_CC_FILE_MOCK: CCFile = { fileMeta: DEFAULT_FILE_META, map: DEFAULT_FILE_MAP, settings: DEFAULT_SETTINGS }

export const VALID_NODE: CodeMapNode = {
	...DEFAULT_ROOT,
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1 },
			isExcluded: false,
			isFlattened: false,
			link: "https://www.google.de"
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

export const VALID_NODE_JAVA: CodeMapNode = {
	...DEFAULT_ROOT,
	children: [
		{
			name: "main",
			path: "/root/src/main",
			type: NodeType.FOLDER,
			attributes: {},
			children: [
				{
					name: "file1.java",
					path: "/root/src/main/file1.java",
					type: NodeType.FILE,
					attributes: { rloc: 70, functions: 1000, mcc: 10, loc: 2000 }
				},
				{
					name: "file2.java",
					path: "/root/src/main/file2.java",
					type: NodeType.FILE,
					attributes: { rloc: 55, functions: 100, mcc: 40, loc: 100 }
				},
				{
					name: "file3.java",
					path: "/root/src/main/file3.java",
					type: NodeType.FILE,
					attributes: { rloc: 45, functions: 1, mcc: 70, loc: 1 }
				},
				{
					name: "readme",
					path: "/root/src/main/readme",
					type: NodeType.FILE,
					attributes: { rloc: 200, functions: 1, mcc: 70, loc: 1 }
				}
			]
		},
		{
			name: "test",
			path: "/root/src/test",
			type: NodeType.FOLDER,
			attributes: {},
			children: [
				{
					name: "otherFile.java",
					path: "/root/src/test/otherFile.java",
					type: NodeType.FILE,
					attributes: { rloc: 100, functions: 10, mcc: 100 }
				}
			]
		}
	]
}

export const VALID_NODE_WITH_MULTIPLE_FOLDERS: CodeMapNode = {
	...DEFAULT_ROOT,
	attributes: { [UNARY_METRIC]: 200 },

	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [UNARY_METRIC]: 1 },
			link: "https://www.google.de",
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 60 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 40 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder3",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 160 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				}
			]
		}
	]
}

export const VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED: CodeMapNode = {
	...DEFAULT_ROOT,
	attributes: { [UNARY_METRIC]: 200 },

	children: [
		{
			name: "Folder3",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 160 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				}
			]
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 40 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 60 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [UNARY_METRIC]: 1 },
			link: "https://www.google.de",
			isExcluded: false,
			isFlattened: false
		}
	]
}

export const VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY: CodeMapNode = {
	...DEFAULT_ROOT,
	attributes: { [UNARY_METRIC]: 200 },

	children: [
		{
			name: "Folder3",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 160 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				}
			]
		},
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 60 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 40 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [UNARY_METRIC]: 1 },
			link: "https://www.google.de",
			isExcluded: false,
			isFlattened: false
		}
	]
}

export const VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME: CodeMapNode = {
	...DEFAULT_ROOT,
	attributes: { [UNARY_METRIC]: 200 },

	children: [
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 60 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 40 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder3",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 160 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				}
			]
		},
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [UNARY_METRIC]: 1 },
			link: "https://www.google.de",
			isExcluded: false,
			isFlattened: false
		}
	]
}

export const VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS_SORTED: CodeMapNode = {
	...DEFAULT_ROOT,
	attributes: { [UNARY_METRIC]: 200 },

	children: [
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 60 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 160 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "File2a",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "File2á",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "File2b",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				}
			]
		},
		{
			name: "Folder10",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 40 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [UNARY_METRIC]: 1 },
			link: "https://www.google.de",
			isExcluded: false,
			isFlattened: false
		}
	]
}

export const VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS: CodeMapNode = {
	...DEFAULT_ROOT,
	attributes: { [UNARY_METRIC]: 200 },

	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			attributes: { rloc: 100, functions: 10, mcc: 1, [UNARY_METRIC]: 1 },
			link: "https://www.google.de",
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "Folder1",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 60 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder10",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 40 },
			isExcluded: false,
			isFlattened: false,
			children: []
		},
		{
			name: "Folder2",
			type: NodeType.FOLDER,
			attributes: { [UNARY_METRIC]: 160 },
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "File2a",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "File2b",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "File2á",
					type: NodeType.FILE,
					attributes: { rloc: 30, functions: 100, mcc: 100, [UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				}
			]
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
			link: "https://www.google.de",
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

export const VALID_FILE_NODE_WITH_ID: CodeMapNode = {
	name: "big leaf",
	id: 1,
	type: NodeType.FILE,
	path: "/root/big leaf",
	attributes: { rloc: 100, functions: 10, mcc: 1, [UNARY_METRIC]: 1 },
	link: "https://www.google.de",
	isExcluded: false,
	isFlattened: false
}

export const VALID_NODES_WITH_ID: CodeMapNode = {
	name: "root",
	type: NodeType.FOLDER,
	id: 0,
	attributes: { a: 20, b: 15 },
	edgeAttributes: { a: { incoming: 2, outgoing: 666 } },
	path: "/root",
	link: "NO_LINK",
	isExcluded: false,
	isFlattened: false,
	children: [VALID_FILE_NODE_WITH_ID]
}

export const VALID_NODE_WITH_ROOT_UNARY: CodeMapNode = {
	name: "root",
	type: NodeType.FOLDER,
	isExcluded: false,
	isFlattened: false,
	path: "/root",
	attributes: { [UNARY_METRIC]: 2 },
	children: [
		{
			name: "first leaf",
			type: NodeType.FILE,
			path: "/root/first leaf",
			attributes: { [UNARY_METRIC]: 1, functions: 10, mcc: 1 },
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "second leaf",
			type: NodeType.FILE,
			path: "/root/second leaf",
			attributes: { [UNARY_METRIC]: 1, functions: 5, mcc: 1 },
			isExcluded: false,
			isFlattened: false
		}
	]
}

export const VALID_NODE_DECORATED: CodeMapNode = {
	name: "root",
	type: NodeType.FOLDER,
	isExcluded: false,
	isFlattened: false,
	path: "/root",
	attributes: { rloc: 100, functions: 10, mcc: 1, [UNARY_METRIC]: 5 },
	children: [
		{
			name: "big leaf",
			type: NodeType.FILE,
			path: "/root/big leaf",
			attributes: { rloc: 100, functions: 10, mcc: 1, [UNARY_METRIC]: 1 },
			link: "https://www.google.de",
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: { rloc: 100, functions: 10, mcc: 1, [UNARY_METRIC]: 1 },
			path: "/root/Parent Leaf",
			isExcluded: false,
			isFlattened: false,
			children: [
				{
					name: "small leaf",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/small leaf",
					attributes: { rloc: 30, functions: 100, mcc: 100, [UNARY_METRIC]: 1 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "other small leaf",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/other small leaf",
					attributes: { rloc: 70, functions: 1000, mcc: 10, [UNARY_METRIC]: 1 },
					edgeAttributes: { Imports: { incoming: 12, outgoing: 13 } },
					isExcluded: false,
					isFlattened: false
				}
			]
		}
	]
}

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
	fileChecksum: "invalid-md5-sample",
	apiVersion: APIVersions.ONE_POINT_THREE,
	nodes: [VALID_NODE]
}

export const TEST_FILE_CONTENT_INVALID_MAJOR_API: ExportCCFile = {
	fileChecksum: "invalid-md5-sample",
	projectName: "Invalid Sample Map",
	apiVersion: "2.0",
	nodes: [VALID_NODE]
}

export const TEST_FILE_CONTENT_INVALID_MINOR_API: ExportCCFile = {
	projectName: "Valid Sample Map Minor API High",
	fileChecksum: "invalid-md5-sample",
	apiVersion: "1.4",
	nodes: [VALID_NODE]
}

export const TEST_FILE_CONTENT_INVALID_API: ExportCCFile = {
	projectName: "Invalid Sample Map",
	fileChecksum: "invalid-md5-sample",
	apiVersion: "2.a",
	nodes: [VALID_NODE]
}

export const TEST_FILE_CONTENT_NO_API: ExportCCFile = {
	projectName: "Invalid Sample Map",
	fileChecksum: "invalid-md5-sample",
	apiVersion: null,
	nodes: [VALID_NODE]
}

export const FILE_META: FileMeta = {
	...DEFAULT_FILE_META,
	fileName: "fileA",
	fileChecksum: "md5-fileA"
}

export const TEST_FILE_DATA: CCFile = {
	fileMeta: FILE_META,
	map: VALID_NODE,
	settings: DEFAULT_SETTINGS
}

export const TEST_FILE_DATA_JAVA: CCFile = {
	fileMeta: { ...FILE_META, fileChecksum: "md5-fileB", fileName: "fileB" },
	map: VALID_NODE_JAVA,
	settings: DEFAULT_SETTINGS
}

export const FIXED_FOLDERS_NESTED_MIXED_WITH_DYNAMIC_ONES_MAP_FILE: CCFile = {
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
				name: "src",
				path: "/root/src",
				type: NodeType.FOLDER,
				attributes: {},
				children: [
					{
						name: "main",
						path: "/root/src/main",
						type: NodeType.FOLDER,
						attributes: {},
						children: [
							{
								name: "file1.java",
								path: "/root/src/main/file1.java",
								type: NodeType.FILE,
								attributes: {
									rloc: 80
								}
							},
							{
								name: "file2.java",
								path: "/root/src/main/file2.java",
								type: NodeType.FILE,
								attributes: {
									rloc: 80
								}
							}
						]
					},
					{
						name: "test",
						path: "/root/src/test",
						type: NodeType.FOLDER,
						attributes: {},
						children: [
							{
								name: "otherFile.java",
								path: "/root/src/test/otherFile.java",
								type: NodeType.FILE,
								attributes: {
									rloc: 65
								}
							}
						]
					}
				],
				fixedPosition: {
					left: 34,
					top: 2,
					width: 35,
					height: 55
				}
			},
			{
				name: "resources",
				path: "/root/resources",
				type: NodeType.FOLDER,
				attributes: {},
				children: [
					{
						name: "textFiles",
						path: "/root/resources/textFiles",
						type: NodeType.FOLDER,
						attributes: {},
						children: [
							{
								name: "file.txt",
								path: "/root/resources/textFiles/file.txt",
								type: NodeType.FILE,
								attributes: {
									rloc: 5
								}
							}
						],
						fixedPosition: {
							left: 2,
							top: 2,
							width: 20,
							height: 20
						}
					},
					{
						name: "tables",
						path: "/root/resources/tables",
						type: NodeType.FOLDER,
						attributes: {},
						children: [
							{
								name: "table1.xlsx",
								path: "/root/resources/tables/table1.xlsx",
								type: NodeType.FILE,
								attributes: {
									rloc: 12
								}
							},
							{
								name: "table2.xlsx",
								path: "/root/resources/tables/table2.xlsx",
								type: NodeType.FILE,
								attributes: {
									rloc: 12
								}
							},
							{
								name: "table3.xlsx",
								path: "/root/resources/tables/table3.xlsx",
								type: NodeType.FILE,
								attributes: {
									rloc: 12
								}
							},
							{
								name: "table4.xlsx",
								path: "/root/resources/tables/table4.xlsx",
								type: NodeType.FILE,
								attributes: {
									rloc: 12
								}
							},
							{
								name: "table5.xlsx",
								path: "/root/resources/tables/table5.xlsx",
								type: NodeType.FILE,
								attributes: {
									rloc: 12
								}
							},
							{
								name: "table6.xlsx",
								path: "/root/resources/tables/table6.xlsx",
								type: NodeType.FILE,
								attributes: {
									rloc: 12
								}
							},
							{
								name: "table7.xlsx",
								path: "/root/resources/tables/table7.xlsx",
								type: NodeType.FILE,
								attributes: {
									rloc: 12
								}
							},
							{
								name: "table8.xlsx",
								path: "/root/resources/tables/table8.xlsx",
								type: NodeType.FILE,
								attributes: {
									rloc: 12
								}
							},
							{
								name: "table9.xlsx",
								path: "/root/resources/tables/table9.xlsx",
								type: NodeType.FILE,
								attributes: {
									rloc: 12
								}
							},
							{
								name: "table10.xlsx",
								path: "/root/resources/tables/table10.xlsx",
								type: NodeType.FILE,
								attributes: {
									rloc: 12
								}
							}
						],
						fixedPosition: {
							left: 52,
							top: 52,
							width: 48,
							height: 48
						}
					}
				],
				fixedPosition: {
					left: 20,
					top: 60,
					width: 50,
					height: 30
				}
			}
		]
	},
	settings: {
		fileSettings: {
			attributeTypes: { nodes: {}, edges: {} },
			blacklist: [],
			edges: [],
			markedPackages: []
		}
	}
}

export const FIXED_FOLDERS_NESTED_MIXED_WITH_A_FILE_MAP_FILE: CCFile = {
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
				name: "folder_1_red",
				path: "/root/folder_1_red",
				type: NodeType.FOLDER,
				attributes: {},
				children: [
					{
						name: "folder_1.1_red",
						path: "/root/folder_1_red/folder_1.1_red",
						type: NodeType.FOLDER,
						attributes: {},
						children: [
							{
								name: "red_child_1.1.file",
								path: "/root/folder_1_red/folder_1.1_red/red_child_1.1.file",
								type: NodeType.FILE,
								attributes: {
									rloc: 12
								}
							}
						],
						fixedPosition: {
							left: 10,
							top: 10,
							width: 80,
							height: 50
						}
					},
					{
						name: "folder_1.2_red",
						path: "/root/folder_1_red/folder_1.2_red",
						type: NodeType.FOLDER,
						attributes: {},
						children: [
							{
								name: "red_child_1.2.file",
								path: "/root/folder_1_red/folder_1.2_red/red_child_1.2.file",
								type: NodeType.FILE,
								attributes: {
									rloc: 6
								}
							}
						],
						fixedPosition: {
							left: 80,
							top: 70,
							width: 10,
							height: 10
						}
					}
				],
				fixedPosition: {
					left: 10,
					top: 10,
					width: 40,
					height: 60
				}
			},
			{
				name: "folder_2_orange",
				path: "/root/folder_2_orange",
				type: NodeType.FOLDER,
				attributes: {},
				children: [
					{
						name: "orange.file",
						path: "/root/folder_2_orange7orange.file",
						type: NodeType.FILE,
						attributes: {
							rloc: 10
						}
					}
				],
				fixedPosition: {
					left: 10,
					top: 80,
					width: 50,
					height: 10
				}
			}
		]
	},
	settings: {
		fileSettings: {
			attributeTypes: { nodes: {}, edges: {} },
			blacklist: [],
			edges: [],
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
				link: "https://www.google.de",
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
	settings: DEFAULT_SETTINGS
}

export const SCENARIO_WITH_ONLY_HEIGHT: RecursivePartial<Scenario> = {
	name: "Scenario2",
	height: {
		heightMetric: "mcc",
		labelSlider: 31,
		heightSlider: new Vector3(1, 1.8, 1)
	}
}

export const GLOBAL_SETTINGS: GlobalSettings = {
	hideFlatBuildings: true,
	isWhiteBackground: true,
	resetCameraIfNewFileIsLoaded: true,
	experimentalFeaturesEnabled: true,
	screenshotToClipboardEnabled: false,
	layoutAlgorithm: LayoutAlgorithm.SquarifiedTreeMap,
	maxTreeMapFiles: 50,
	sharpnessMode: SharpnessMode.Standard
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
	fileCount: { added: 0, removed: 0, changed: 0 },
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
			fileCount: { added: 0, removed: 1, changed: 0 },
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "another big leaf.java",
			type: NodeType.FILE,
			path: "/root/another big leaf.java",
			attributes: { rloc: 120, functions: 20, mcc: 2 },
			deltas: { rloc: -150, functions: 9, mcc: 33 },
			fileCount: { added: 0, removed: 1, changed: 0 },
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "leaf.java with changes",
			type: NodeType.FILE,
			path: "/root/leaf.java with changes",
			attributes: { rloc: 0, functions: 0, mcc: 0 },
			deltas: { rloc: 0, functions: 0, mcc: 0 },
			fileCount: { added: 0, removed: 0, changed: 1 },
			isExcluded: false,
			isFlattened: false
		},
		{
			name: "Parent Leaf",
			type: NodeType.FOLDER,
			attributes: {},
			deltas: {},
			fileCount: { added: 0, removed: 0, changed: 0 },
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
					fileCount: { added: 0, removed: 1, changed: 0 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "leaf.jpg with changes",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/leaf.jpg with changes",
					attributes: { rloc: 0, functions: 0, mcc: 0 },
					deltas: { rloc: 0, functions: 0, mcc: 0 },
					fileCount: { added: 0, removed: 0, changed: 1 },
					isExcluded: false,
					isFlattened: false
				},
				{
					name: "other small leaf.json",
					type: NodeType.FILE,
					path: "/root/Parent Leaf/other small leaf.json",
					attributes: { rloc: 70, functions: 1000, mcc: 10 },
					deltas: { rloc: 200, functions: -27, mcc: 65 },
					fileCount: { added: 1, removed: 0, changed: 0 },
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
		...DEFAULT_FILE_META,
		fileName: "fileA",
		fileChecksum: "md5-delta-fileA"
	},
	map: {
		...DEFAULT_FILE_MAP,
		children: [
			{
				name: "big leaf",
				type: NodeType.FILE,
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				link: "https://www.google.de",
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
	settings: DEFAULT_SETTINGS
}

export const TEST_DELTA_MAP_B: CCFile = {
	fileMeta: {
		...DEFAULT_FILE_META,
		fileName: "fileB",
		fileChecksum: "md5-delta-fileB"
	},
	map: {
		...DEFAULT_FILE_MAP,
		children: [
			{
				name: "big leaf",
				type: NodeType.FILE,
				attributes: { rloc: 20, functions: 10, mcc: 1 },
				link: "https://www.google.de",
				isExcluded: false,
				isFlattened: false
			},
			{
				name: "additional leaf",
				type: NodeType.FILE,
				attributes: { rloc: 10, functions: 11, mcc: 5 },
				link: "https://www.google.de",
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
						link: "https://www.google.de",
						isExcluded: false,
						isFlattened: false
					}
				]
			}
		]
	},
	settings: DEFAULT_SETTINGS
}

export const TEST_FILE_DATA_DOWNLOADED = {
	projectName: "Sample Project",
	apiVersion: packageJson.codecharta.apiVersion,
	fileChecksum: "md5-fileA",
	nodes: [
		{
			name: "root",
			type: NodeType.FOLDER,
			attributes: {},
			children: [
				{
					name: "big leaf",
					type: NodeType.FILE,
					attributes: {
						rloc: 100,
						functions: 10,
						mcc: 1
					},
					link: "https://www.google.de"
				},
				{
					name: "Parent Leaf",
					type: NodeType.FOLDER,
					attributes: {},
					children: [
						{
							name: "small leaf",
							type: NodeType.FILE,
							attributes: {
								rloc: 30,
								functions: 100,
								mcc: 100
							}
						},
						{
							name: "other small leaf",
							type: NodeType.FILE,
							attributes: {
								rloc: 70,
								functions: 1000,
								mcc: 10
							}
						}
					]
				}
			]
		}
	],
	attributeTypes: {},
	edges: [
		{
			fromNodeName: "/root/big leaf",
			toNodeName: "/root/Parent Leaf/small leaf",
			attributes: {
				pairingRate: 89,
				avgCommits: 34
			}
		},
		{
			fromNodeName: "/root/Parent Leaf/small leaf",
			toNodeName: "/root/different leaf",
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
		}
	],
	markedPackages: [],
	blacklist: [
		{ path: "/root/bigLeaf.ts", type: "hide" },
		{ path: "/root/sample1OnlyLeaf.scss", type: "exclude" }
	]
}

export const FILE_STATES: FileState[] = [
	{
		file: TEST_FILE_DATA,
		selectedAs: FileSelectionState.Partial
	}
]

export const FILE_STATES_UNSELECTED: FileState[] = [
	{
		file: TEST_FILE_DATA,
		selectedAs: FileSelectionState.None
	}
]

export const FILE_STATES_JAVA: FileState[] = [
	{
		file: TEST_FILE_DATA_JAVA,
		selectedAs: FileSelectionState.Partial
	}
]

export const METRIC_DATA: NodeMetricData[] = [
	{ name: "mcc", maxValue: 1, minValue: 1 },
	{ name: "rloc", maxValue: 2, minValue: 1 },
	{ name: UNARY_METRIC, maxValue: 1, minValue: 1 }
]

export const EDGE_METRIC_DATA: EdgeMetricData[] = [
	{ name: "pairing_rate", maxValue: 10, minValue: 0 },
	{ name: "average_commits", maxValue: 20, minValue: 0 }
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
		focusedNodePath: ["/root/ParentLeaf"],
		searchPattern: "",
		margin: 48,
		colorRange: {
			from: 19,
			to: 67
		},
		colorMode: ColorMode.weightedGradient,
		sortingOption: SortingOption.NAME
	},
	appSettings: {
		amountOfTopLabels: 31,
		amountOfEdgePreviews: 5,
		colorLabels: {
			positive: false,
			negative: false,
			neutral: false
		},
		edgeHeight: 4,
		scaling: new Vector3(1, 1.8, 1),
		hideFlatBuildings: true,
		invertHeight: true,
		invertArea: false,
		isEdgeMetricVisible: true,
		dynamicMargin: true,
		isWhiteBackground: false,
		isColorMetricLinkedToHeightMetric: false,
		mapColors: {
			positive: "#69AE40",
			neutral: "#ddcc00",
			negative: "#820E0E",
			selected: "#EB8319",
			positiveDelta: "#64d051",
			negativeDelta: "#ff0E0E",
			base: "#666666",
			flat: "#AAAAAA",
			markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff"],
			incomingEdge: "#00ffff",
			outgoingEdge: "#ff00ff",
			labelColorAndAlpha: { rgb: "#e0e0e0", alpha: 0.7 }
		},
		isPresentationMode: false,
		showOnlyBuildingsWithEdges: false,
		resetCameraIfNewFileIsLoaded: true,
		isLoadingMap: true,
		isLoadingFile: true,
		sortingOrderAscending: false,
		showMetricLabelNameValue: true,
		showMetricLabelNodeName: true,
		experimentalFeaturesEnabled: false,
		screenshotToClipboardEnabled: false,
		layoutAlgorithm: LayoutAlgorithm.SquarifiedTreeMap,
		sharpnessMode: SharpnessMode.Standard,
		maxTreeMapFiles: 200
	},
	files: [],
	appStatus: {
		hoveredNodeId: null,
		selectedBuildingId: null,
		rightClickedNodeData: null
	}
}

export const DEFAULT_STATE: State = {
	appSettings: {
		amountOfTopLabels: 1,
		amountOfEdgePreviews: 1,
		colorLabels: {
			positive: false,
			negative: false,
			neutral: false
		},
		edgeHeight: 4,
		dynamicMargin: true,
		hideFlatBuildings: false,
		invertHeight: false,
		invertArea: false,
		isEdgeMetricVisible: true,
		isWhiteBackground: false,
		isColorMetricLinkedToHeightMetric: false,
		mapColors: {
			base: "#666666",
			flat: "#AAAAAA",
			markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff"],
			negative: "#820E0E",
			negativeDelta: "#ff0E0E",
			neutral: "#ddcc00",
			positive: "#69AE40",
			positiveDelta: "#64d051",
			selected: "#EB8319",
			incomingEdge: "#00ffff",
			outgoingEdge: "#ff00ff",
			labelColorAndAlpha: { rgb: "#e0e0e0", alpha: 0.7 }
		},
		scaling: new Vector3(1, 1, 1),
		isPresentationMode: false,
		showOnlyBuildingsWithEdges: false,
		resetCameraIfNewFileIsLoaded: true,
		isLoadingMap: true,
		isLoadingFile: true,
		sortingOrderAscending: true,
		showMetricLabelNameValue: false,
		showMetricLabelNodeName: true,
		experimentalFeaturesEnabled: false,
		screenshotToClipboardEnabled: false,
		layoutAlgorithm: LayoutAlgorithm.SquarifiedTreeMap,
		sharpnessMode: SharpnessMode.Standard,
		maxTreeMapFiles: 100
	},
	dynamicSettings: {
		areaMetric: null,
		colorMetric: null,
		focusedNodePath: [],
		heightMetric: null,
		distributionMetric: null,
		edgeMetric: null,
		margin: 50,
		colorRange: {
			from: null,
			to: null
		},
		colorMode: ColorMode.weightedGradient,
		searchPattern: "",
		sortingOption: SortingOption.NAME
	},
	fileSettings: { attributeTypes: { nodes: {}, edges: {} }, blacklist: [], edges: [], markedPackages: [] },
	files: [],
	appStatus: {
		hoveredNodeId: null,
		selectedBuildingId: null,
		rightClickedNodeData: null
	}
}

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
		},
		mapColors: DEFAULT_STATE.appSettings.mapColors
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
		mapColors: DEFAULT_STATE.appSettings.mapColors
	}
}

export const TEST_NODE_ROOT: Node = {
	name: "root",
	id: 0,
	width: 1,
	height: 2,
	length: 3,
	depth: 4,
	mapNodeDepth: 2,
	x0: 5,
	z0: 6,
	y0: 7,
	isLeaf: true,
	deltas: { a: 1, b: 2 },
	attributes: { a: 20, b: 15, mcc: 5 },
	edgeAttributes: { a: { incoming: 2, outgoing: 666 } },
	heightDelta: 10,
	visible: true,
	path: "/root",
	link: "NO_LINK",
	markingColor: "0x000000",
	flat: false,
	color: "#69AE40",
	incomingEdgePoint: new Vector3(),
	outgoingEdgePoint: new Vector3()
}

export const SCENARIO_ATTRIBUTE_CONTENT: ScenarioMetricProperty[] = [
	{
		metricType: "Camera-Position",
		metricName: "",
		savedValues: { camera: new Vector3(0, 300, 1000), cameraTarget: new Vector3(177, 0, 299) },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: "Area-Metric",
		metricName: "rloc",
		savedValues: 48,
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: "Height-Metric",
		metricName: "mcc",
		savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: "Color-Metric",
		metricName: "mcc",
		savedValues: { colorRange: { from: 19, to: 67 }, mapColors: DEFAULT_STATE.appSettings.mapColors },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: "Edge-Metric",
		metricName: "pairingRate",
		savedValues: { edgePreview: 5, edgeHeight: 4 },
		isSelected: true,
		isDisabled: false
	}
]

export const SCENARIO_ATTRIBUTE_CONTENT_CAMERA_UNSELECTED: ScenarioMetricProperty[] = [
	{
		metricType: "Camera-Position",
		metricName: null,
		savedValues: new Vector3(0, 300, 1000),
		isSelected: false,
		isDisabled: false
	},
	{
		metricType: "Area-Metric",
		metricName: "rloc",
		savedValues: 48,
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: "Height-Metric",
		metricName: "mcc",
		savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: "Color-Metric",
		metricName: "mcc",
		savedValues: { from: 19, to: 67 },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: "Edge-Metric",
		metricName: "pairingRate",
		savedValues: { edgePreview: 5, edgeHeight: 4 },
		isSelected: true,
		isDisabled: false
	}
]

export const SCENARIO_ATTRIBUTE_CONTENT_WITHOUT_CAMERA: ScenarioMetricProperty[] = [
	{
		metricType: "Area-Metric",
		metricName: "rloc",
		savedValues: 48,
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: "Height-Metric",
		metricName: "mcc",
		savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: "Color-Metric",
		metricName: "mcc",
		savedValues: { from: 19, to: 67 },
		isSelected: true,
		isDisabled: false
	},
	{
		metricType: "Edge-Metric",
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

export const CUSTOM_CONFIG_ITEM_GROUPS: Map<string, CustomConfigItemGroup> = new Map([
	[
		"File_A_MULTIPLE",
		{
			mapNames: "fileA",
			mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
			hasApplicableItems: false,
			customConfigItems: [
				{
					id: "File_A_MULTIPLE_Sample_Map View #1",
					name: "SampleMap View #1",
					assignedMaps: new Map([["md5_fileA", "fileA"]]),
					mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
					isApplicable: false
				},
				{
					id: "File_A_MULTIPLE_Sample_Map View #2",
					name: "SampleMap View #2",
					assignedMaps: new Map([["md5_fileA", "fileA"]]),
					mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
					isApplicable: false
				}
			]
		}
	],
	[
		"File_B_File_C_MULTIPLE",
		{
			mapNames: "fileB fileC",
			mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
			hasApplicableItems: true,
			customConfigItems: [
				{
					id: "File_B_File_C_MULTIPLE_Sample_Map View #1",
					name: "SampleMap View #1",
					assignedMaps: new Map([
						["md5_fileB", "fileB"],
						["md5_fileC", "fileC"]
					]),
					mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
					isApplicable: true
				},
				{
					id: "File_B_File_C_MULTIPLE_Sample_Map View #2",
					name: "SampleMap View #2",
					assignedMaps: new Map([
						["md5_fileB", "fileB"],
						["md5_fileC", "fileC"]
					]),
					mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
					isApplicable: true
				}
			]
		}
	],
	[
		"File_D_DELTA",
		{
			mapNames: "fileD",
			mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
			hasApplicableItems: false,
			customConfigItems: [
				{
					id: "File_D_DELTA_Sample_Map View #1",
					name: "SampleMap Delta View #1",
					assignedMaps: new Map([["md5_fileD", "fileD"]]),
					mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
					isApplicable: false
				}
			]
		}
	]
])

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
	mapNodeDepth: 2,
	x0: 5,
	z0: 6,
	y0: 7,
	isLeaf: true,
	deltas: { a: 1, b: 2 },
	attributes: { a: 20, b: 15, mcc: 20 },
	edgeAttributes: { a: { incoming: 2, outgoing: 666 } },
	heightDelta: 20,
	visible: true,
	path: "/root/big leaf",
	link: "NO_LINK",
	markingColor: "0xFFFFFF",
	flat: false,
	color: "#ddcc00",
	incomingEdgePoint: new Vector3(),
	outgoingEdgePoint: new Vector3()
}

export const TEST_NODE_FOLDER: Node = {
	name: "root",
	id: 1,
	width: 1,
	height: 2,
	length: 3,
	depth: 4,
	mapNodeDepth: 1,
	x0: 5,
	z0: 6,
	y0: 7,
	isLeaf: false,
	attributes: { a: 20, b: 15 },
	edgeAttributes: { c: { incoming: 2, outgoing: 666 } },
	heightDelta: 20,
	visible: true,
	path: "/root",
	flat: false,
	link: "NO_LINK",
	color: "#ddcc00",
	markingColor: "0xFFFFFF",
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
	mapNodeDepth: 2,
	x0: 5,
	z0: 6,
	y0: 7,
	isLeaf: true,
	deltas: { a: 1, b: 2 },
	attributes: { a: 20, b: 15, mcc: 100 },
	edgeAttributes: { a: { incoming: 2, outgoing: 666 } },
	heightDelta: 20,
	visible: true,
	path: "/root/Parent Leaf/small leaf",
	link: "NO_LINK",
	markingColor: "0xFFFFFF",
	flat: false,
	color: "#820E0E",
	incomingEdgePoint: new Vector3(1, 2, 3),
	outgoingEdgePoint: new Vector3(1, 2, 3)
}

export const COLOR_TEST_NODES: Node[] = [TEST_NODE_ROOT, TEST_NODE_LEAF, INCOMING_NODE]

export const OUTGOING_NODE: Node = {
	name: "root/big leaf",
	id: 1,
	width: 1,
	height: 2,
	length: 3,
	depth: 4,
	mapNodeDepth: 2,
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
	mapNodeDepth: 2,
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
	0,
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

export const CONSTANT_HIGHLIGHT: Map<number, CodeMapBuilding> = new Map([
	[CODE_MAP_BUILDING.id, CODE_MAP_BUILDING],
	[CODE_MAP_BUILDING_TS_NODE.id, CODE_MAP_BUILDING_TS_NODE]
])

export function withMockedEventMethods($rootScope: IRootScopeService) {
	$rootScope.$broadcast = jest.fn()
	$rootScope.$on = jest.fn()
	$rootScope.$digest = jest.fn()
	$rootScope.$apply = jest.fn()
}

export function setIsBlacklisted(paths: string[], map: CodeMapNode, type: BlacklistType) {
	const pathsSet = new Set(paths)
	for (const node of hierarchy(map)) {
		if (isLeaf(node) && pathsSet.has(node.data.path)) {
			setBlacklistFlagByType(node.data, type, true)
		}
	}
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
