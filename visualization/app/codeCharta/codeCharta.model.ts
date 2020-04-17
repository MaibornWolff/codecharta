import { Vector3 } from "three"
import { Action } from "redux"
import { Files } from "./model/files"
import { CodeMapBuilding } from "./ui/codeMap/rendering/codeMapBuilding"

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

export enum SearchPanelMode {
	treeView = "treeView",
	flatten = "flatten",
	exclude = "exclude",
	minimized = "minimized"
}

export interface ExportCCFile {
	projectName: string
	apiVersion: string
	nodes: CodeMapNode[]
	attributeTypes: AttributeTypes | {}
	edges: Edge[]
	markedPackages: MarkedPackage[]
	blacklist: BlacklistItem[]
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
	type: NodeType
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

export enum NodeType {
	FILE = "File",
	FOLDER = "Folder"
}

export enum SortingOption {
	NAME = "Name",
	NUMBER_OF_FILES = "Number of Files"
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
	sortingOption: SortingOption
	areaMetric: string
	heightMetric: string
	colorMetric: string
	distributionMetric: string
	edgeMetric: string
	focusedNodePath: string
	searchedNodePaths: Set<string>
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
	sortingOrderAscending: boolean
	searchPanelMode: SearchPanelMode
	isAttributeSideBarVisible: boolean
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
	nodes: { [key: string]: AttributeTypeValue }
	edges: { [key: string]: AttributeTypeValue }
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
}

export interface MetricData {
	name: string
	maxValue: number
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
	files: Files
	lookUp: LookUp
}

export interface CCAction extends Action {
	payload?: any
}

export interface LookUp {
	pathToNode: Map<string, CodeMapNode>
	pathToBuilding: Map<string, CodeMapBuilding>
}
