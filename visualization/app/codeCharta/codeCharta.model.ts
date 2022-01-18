import { Vector3 } from "three"
import { Action } from "redux"
import { ExportCCFile } from "./codeCharta.api.model"
import { CodeMapBuilding } from "./ui/codeMap/rendering/codeMapBuilding"
import { FileState } from "./model/files/files"
import { CustomView } from "./model/customView/customView.api.model"
import Rectangle from "./util/algorithm/streetLayout/rectangle"
import { RightClickedNodeData } from "./state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"

export interface NameDataPair {
	fileName: string
	fileSize: number
	content: ExportCCFile
}

export enum SearchPanelMode {
	treeView = "treeView",
	blacklist = "blacklist",
	minimized = "minimized"
}

export enum LayoutAlgorithm {
	SquarifiedTreeMap = "Squarified TreeMap",
	StreetMap = "StreetMap",
	TreeMapStreet = "TreeMapStreet"
}

export enum SharpnessMode {
	Standard = "High",
	PixelRatioNoAA = "Low",
	PixelRatioFXAA = "Medium",
	PixelRatioAA = "Best"
}

export interface CCFile {
	map: CodeMapNode
	settings: {
		fileSettings: FileSettings
	}
	fileMeta: FileMeta
}

interface squarifiedNode {
	name: string
	id?: number
	type: NodeType
	children?: CodeMapNode[]
	attributes?: KeyValuePair
	edgeAttributes?: {
		[key: string]: EdgeMetricCount
	}
	link?: string
	path?: string
	isExcluded?: boolean
	isFlattened?: boolean
	deltas?: {
		[key: string]: number
	}
	fixedPosition?: FixedPosition
}

interface streetNode {
	value?: number
	rect?: Rectangle
	zOffset?: number
}
export interface CodeMapNode extends squarifiedNode, streetNode {}

export interface FixedPosition {
	left: number
	top: number
	width: number
	height: number
}

export enum NodeType {
	FILE = "File",
	FOLDER = "Folder"
}

export enum SortingOption {
	NAME = "Name",
	NUMBER_OF_FILES = "Number of Files"
}

export interface colorLabelOptions {
	positive: boolean
	negative: boolean
	neutral: boolean
}

export interface FileMeta {
	fileName: string
	fileChecksum: string
	apiVersion: string
	projectName: string
	exportedFileSize: number
	repoCreationDate?: string
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
	colorMode: ColorMode
	sortingOption: SortingOption
	areaMetric: string
	heightMetric: string
	colorMetric: string
	distributionMetric: string
	edgeMetric: string
	focusedNodePath: string[]
	searchPattern: string
	margin: number
	colorRange: ColorRange
	recentFiles: string[]
}

export interface AppSettings {
	amountOfTopLabels: number
	amountOfEdgePreviews: number
	edgeHeight: number
	scaling: Vector3
	camera: Vector3
	cameraTarget: Vector3
	hideFlatBuildings: boolean
	invertHeight: boolean
	dynamicMargin: boolean
	isWhiteBackground: boolean
	mapColors: MapColors
	isPresentationMode: boolean
	showOnlyBuildingsWithEdges: boolean
	resetCameraIfNewFileIsLoaded: boolean
	isLoadingMap: boolean
	isLoadingFile: boolean
	sortingOrderAscending: boolean
	searchPanelMode: SearchPanelMode
	isAttributeSideBarVisible: boolean
	panelSelection: PanelSelection
	showMetricLabelNameValue: boolean
	showMetricLabelNodeName: boolean
	layoutAlgorithm: LayoutAlgorithm
	maxTreeMapFiles: number
	sharpnessMode: SharpnessMode
	experimentalFeaturesEnabled: boolean
	screenshotToClipboardEnabled: boolean
	colorLabels: colorLabelOptions
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
	labelColorAndAlpha: { rgb: string; alpha: number }
}

export interface ColorRange {
	from: number
	to: number
	min: number
	max: number
}

export interface AttributeTypes {
	nodes?: { [key: string]: AttributeTypeValue }
	edges?: { [key: string]: AttributeTypeValue }
}

export enum AttributeTypeValue {
	absolute = "absolute",
	relative = "relative"
}

export enum ColorMode {
	trueGradient = "trueGradient",
	weightedGradient = "weightedGradient",
	absolute = "absolute"
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
	nodeType?: NodeType
}

export enum BlacklistType {
	flatten = "flatten",
	exclude = "exclude"
}

export interface MarkedPackage {
	path: string
	color: string
}

export interface EdgeMetricData {
	name: string
	maxValue: number
	minValue: number
}

export interface NodeMetricData {
	name: string
	maxValue: number
	minValue: number
}

export interface MetricData {
	nodeMetricData: NodeMetricData[]
	edgeMetricData: EdgeMetricData[]
}

export interface LocalStorageCustomViews {
	version: string
	customViews: [string, CustomView][]
}

export interface LocalStorageScenarios {
	version: string
	scenarios: [string, RecursivePartial<Scenario>][]
}

export interface LocalStorageGlobalSettings {
	version: string
	globalSettings: GlobalSettings
}

export interface GlobalSettings {
	hideFlatBuildings: boolean
	isWhiteBackground: boolean
	resetCameraIfNewFileIsLoaded: boolean
	experimentalFeaturesEnabled: boolean
	screenshotToClipboardEnabled: boolean
	layoutAlgorithm: LayoutAlgorithm
	maxTreeMapFiles: number
	sharpnessMode: SharpnessMode
}

export interface Scenario {
	name: string
	area: {
		areaMetric: string
		margin: number
	}
	height: {
		heightMetric: string
		heightSlider: Vector3
		labelSlider: number
	}
	color: {
		colorMetric: string
		colorRange: ColorRange
		mapColors: MapColors
	}
	camera: {
		camera: Vector3
		cameraTarget: Vector3
	}
	edge: {
		edgeMetric: string
		edgePreview: number
		edgeHeight: number
	}
}

export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> }

export interface KeyValuePair {
	[key: string]: number
}

export interface Node {
	name: string
	id: number
	width: number
	height: number
	length: number
	depth: number
	mapNodeDepth: number
	x0: number
	z0: number
	y0: number
	isLeaf: boolean
	deltas?: KeyValuePair
	attributes: KeyValuePair
	edgeAttributes: {
		[key: string]: EdgeMetricCount
	}
	heightDelta: number
	visible: boolean
	path: string
	link: string
	markingColor: string | void
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
	files: FileState[]
	lookUp: LookUp
	appStatus: AppStatus
}

export function stateObjectReplacer(_, valueToReplace) {
	if (valueToReplace instanceof Map) {
		return {
			dataType: "Map",
			value: [...valueToReplace.entries()]
		}
	}
	if (valueToReplace instanceof Set) {
		return {
			dataType: "Set",
			value: [...valueToReplace]
		}
	}
	return valueToReplace
}

export function stateObjectReviver(_, valueToRevive) {
	if (valueToRevive?.dataType === "Map") {
		return new Map(valueToRevive.value)
	}
	if (valueToRevive?.dataType === "Set") {
		return new Set(valueToRevive.value)
	}

	return valueToRevive
}

export interface CCAction extends Action {
	// TODO: Do not use any here! Make sure all our actions are properly declared.
	//
	// As a starting point:
	//
	// RecursivePartial<MetricData & DynamicSettings & LookUp & FileSettings & AppSettings & TreeMapSettings & FileState> & {
	// 	metricData: MetricData
	// 	lookUp: LookUp
	// 	dynamicSettings: DynamicSettings
	// 	fileSettings: FileSettings
	// 	appSettings: AppSettings
	// 	treeMap: TreeMapSettings
	// 	files: FileState[]
	// }
	payload?: any
}

export interface LookUp {
	idToNode: Map<number, CodeMapNode>
	// note that key is id of node and NOT id of building
	idToBuilding: Map<number, CodeMapBuilding>
}

export interface AppStatus {
	hoveredBuildingPath: string | null
	selectedBuildingId: number | null
	rightClickedNodeData: RightClickedNodeData
}

export enum PanelSelection {
	AREA_PANEL_OPEN = "AREA_PANEL_OPEN",
	HEIGHT_PANEL_OPEN = "HEIGHT_PANEL_OPEN",
	COLOR_PANEL_OPEN = "COLOR_PANEL_OPEN",
	EDGE_PANEL_OPEN = "EDGE_PANEL_OPEN",
	NONE = "NONE"
}
