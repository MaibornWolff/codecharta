import { Vector3 } from "three"

export interface NameDataPair {
	fileName: string
	content: any
}

export interface FileState {
	file: CCFile
	selectedAs: FileSelectionState
}

export enum FileSelectionState {
	Single = "Single",
	Reference = "Reference",
	Comparison = "Comparison",
	Partial = "Partial",
	None = "None"
}

export interface CCFile {
	map: CodeMapNode
	settings: {
		fileSettings: FileSettings
	}
	fileMeta: FileMeta
}

export interface CodeMapNode {
	name: string
	type: string
	children?: CodeMapNode[]
	attributes: KeyValuePair
	link?: string
	origin?: string
	path?: string
	visible?: boolean
	deltas?: {
		[key: string]: number
	}
}

export interface FileMeta {
	fileName: string
	apiVersion: string
	projectName: string
}

export interface Settings {
	fileSettings: FileSettings
	dynamicSettings: DynamicSettings
	appSettings: AppSettings
	treeMapSettings: TreeMapSettings
}

export interface FileSettings {
	attributeTypes: AttributeTypes
	blacklist: Array<BlacklistItem>
	edges: Edge[]
	markedPackages: MarkedPackage[]
}

export interface DynamicSettings {
	areaMetric: string
	heightMetric: string
	colorMetric: string
	focusedNodePath: string
	searchedNodePaths: Array<string>
	searchPattern: string
	margin: number
	neutralColorRange: ColorRange
}

export interface AppSettings {
	amountOfTopLabels: number
	scaling: Vector3
	camera: Vector3
	deltaColorFlipped: boolean
	enableEdgeArrows: boolean
	hideFlatBuildings: boolean
	maximizeDetailPanel: boolean
	invertHeight: boolean
	dynamicMargin: boolean
	isWhiteBackground: boolean
	mapColors: MapColors
	whiteColorBuildings: boolean
}

export interface TreeMapSettings {
	mapSize: number
}

export interface MapColors {
	positive: string
	neutral: string
	negative: string
	selected: string
	defaultC: string
	positiveDelta: string
	negativeDelta: string
	base: string
	flat: string
	lightGrey: string
	angularGreen: string
	markingColors: string[]
}

export interface ColorRange {
	from: number
	to: number
	flipped: boolean
}

export interface AttributeTypes {
	nodes?: {
		[key: string]: AttributeType
	}
	edges?: {
		[key: string]: AttributeType
	}
}

export enum AttributeType {
	absolute,
	relative
}

export interface Edge {
	fromNodeName: string
	toNodeName: string
	attributes: KeyValuePair
	visible?: boolean
}

export interface BlacklistItem {
	path: string
	type: BlacklistType
}

export enum BlacklistType {
	hide = "hide",
	exclude = "exclude"
}

export interface MarkedPackage {
	path: string
	color: string
	attributes: {
		[key: string]: any
	}
}

export interface MetricData {
	name: string
	maxValue: number
	availableInVisibleMaps: boolean
}

export interface Scenario {
	name: string
	settings: RecursivePartial<Settings>
}

export interface UrlData {
	filenames: string[]
	settings: Partial<Settings>
}

export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> }

export interface KeyValuePair {
	[key: string]: number
}

export interface Node {
	name: string
	width: number
	height: number
	length: number
	depth: number
	x0: number
	z0: number
	y0: number
	isLeaf: boolean
	deltas: KeyValuePair
	attributes: KeyValuePair
	children: Node[]
	parent: Node
	heightDelta: number
	visible: boolean
	path: string
	origin: string
	link: string
	markingColor: string
	flat: boolean
}
