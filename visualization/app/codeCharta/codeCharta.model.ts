import { Vector3 } from "three"
import { Action } from "redux"
import { ExportCCFile } from "./codeCharta.api.model"

export interface NameDataPair {
	fileName: string
	content: ExportCCFile
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

export enum SearchPanelMode {
	treeView = "treeView",
	flatten = "flatten",
	exclude = "exclude",
	minimized = "minimized"
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
	edgeAttributes?: {
		[key: string]: EdgeMetricCount
	}
	link?: string
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
	distributionMetric: string
	edgeMetric: string
	focusedNodePath: string
	searchedNodePaths: Array<string>
	searchPattern: string
	margin: number
	colorRange: ColorRange
}

export interface AppSettings {
	amountOfTopLabels: number
	amountOfEdgePreviews: number
	edgeHeight: number
	scaling: Vector3
	camera: Vector3
	hideFlatBuildings: boolean
	invertColorRange: boolean
	invertDeltaColors: boolean
	invertHeight: boolean
	dynamicMargin: boolean
	isWhiteBackground: boolean
	mapColors: MapColors
	whiteColorBuildings: boolean
	isPresentationMode: boolean
	showOnlyBuildingsWithEdges: boolean
	resetCameraIfNewFileIsLoaded: boolean
	isLoadingMap: boolean
	isLoadingFile: boolean
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
	outgoingEdge: string
	incomingEdge: string
}

export interface ColorRange {
	from: number
	to: number
}

export interface AttributeTypes {
	nodes?: AttributeType[]
	edges?: AttributeType[]
}

export interface AttributeType {
	[key: string]: AttributeTypeValue
}

export enum AttributeTypeValue {
	absolute = "absolute",
	relative = "relative"
}

export interface Edge {
	fromNodeName: string
	toNodeName: string
	attributes: KeyValuePair
	visible?: EdgeVisibility
}

export enum EdgeVisibility {
	none = "none",
	from = "from",
	to = "to",
	both = "both"
}

export interface EdgeMetricCount {
	incoming: number
	outgoing: number
}

export interface BlacklistItem {
	path: string
	type: BlacklistType
}

export enum BlacklistType {
	flatten = "flatten",
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
	edgeAttributes: {
		[key: string]: EdgeMetricCount
	}
	heightDelta: number
	visible: boolean
	path: string
	link: string
	markingColor: string
	flat: boolean
	color: string
	incomingEdgePoint: Vector3
	outgoingEdgePoint: Vector3
}

export interface State {
	fileSettings: FileSettings
	dynamicSettings: DynamicSettings
	appSettings: AppSettings
	treeMap: TreeMapSettings
}

export interface CCAction extends Action {
	payload: any
}
