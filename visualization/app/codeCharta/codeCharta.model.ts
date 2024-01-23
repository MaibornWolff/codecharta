import { Vector3 } from "three"
import { ExportCCFile } from "./codeCharta.api.model"
import { FileState } from "./model/files/files"
import { CustomConfig } from "./model/customConfig/customConfig.api.model"
import Rectangle from "./util/algorithm/streetLayout/rectangle"

export type Scaling = {
	x: number
	y: number
	z: number
}

export interface NameDataPair {
	fileName: string
	fileSize: number
	content: ExportCCFile
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

export interface FileCount {
	all?: number
	added: number
	removed: number
	changed: number
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
	fileCount?: FileCount
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

export interface ColorLabelOptions {
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
}

export interface FileSettings {
	attributeTypes: AttributeTypes
	attributeDescriptors: AttributeDescriptors
	blacklist: Array<BlacklistItem>
	edges: Edge[]
	markedPackages: MarkedPackage[]
}

export interface PrimaryMetrics {
	areaMetric: string
	heightMetric: string
	edgeMetric: string
	colorMetric: string
}

export interface DynamicSettings extends PrimaryMetrics {
	colorMode: ColorMode
	sortingOption: SortingOption
	colorRange: ColorRange
	distributionMetric: string
	focusedNodePath: string[]
	searchPattern: string
	margin: number
}

export interface AppSettings {
	amountOfTopLabels: number
	amountOfEdgePreviews: number
	edgeHeight: number
	scaling: Scaling
	hideFlatBuildings: boolean
	invertHeight: boolean
	invertArea: boolean
	isWhiteBackground: boolean
	mapColors: MapColors
	isPresentationMode: boolean
	showOnlyBuildingsWithEdges: boolean
	isEdgeMetricVisible: boolean
	resetCameraIfNewFileIsLoaded: boolean
	isLoadingMap: boolean
	isLoadingFile: boolean
	sortingOrderAscending: boolean
	isSearchPanelPinned: boolean
	showMetricLabelNameValue: boolean
	showMetricLabelNodeName: boolean
	layoutAlgorithm: LayoutAlgorithm
	maxTreeMapFiles: number
	sharpnessMode: SharpnessMode
	experimentalFeaturesEnabled: boolean
	screenshotToClipboardEnabled: boolean
	colorLabels: ColorLabelOptions
	isColorMetricLinkedToHeightMetric: boolean
	enableFloorLabels: boolean
}

export interface MapColors {
	positive: string
	neutral: string
	negative: string
	selected: string
	positiveDelta: string
	negativeDelta: string
	base: string
	flat: string
	markingColors: string[]
	outgoingEdge: string
	incomingEdge: string
	labelColorAndAlpha: { rgb: string; alpha: number }
}

export interface ColorRange {
	/** null means to be reset */
	from: number | null
	/** null means to be reset */
	to: number | null
}

export interface AttributeTypes {
	nodes?: { [key: string]: AttributeTypeValue }
	edges?: { [key: string]: AttributeTypeValue }
}

export interface AttributeDescriptors {
	[key: string]: AttributeDescriptor
}

export interface AttributeDescriptor {
	title: string
	description: string
	hintLowValue: string
	hintHighValue: string
	link: string
}

export enum AttributeTypeValue {
	absolute = "absolute",
	relative = "relative"
}

export enum ColorMode {
	trueGradient = "trueGradient",
	weightedGradient = "weightedGradient",
	focusedGradient = "focusedGradient",
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

export type BlacklistType = "flatten" | "exclude"

export interface MarkedPackage {
	path: string
	color: string
}

export interface EdgeMetricData {
	name: string
	maxValue: number
	minValue: number
	values: number[]
}

export interface NodeMetricData {
	name: string
	maxValue: number
	minValue: number
	values: number[]
}

export interface MetricData {
	nodeMetricData: NodeMetricData[]
	edgeMetricData: EdgeMetricData[]
}

export interface LocalStorageCustomConfigs {
	version: string
	customConfigs: [string, CustomConfig][]
}

export interface LocalStorageScenarios {
	version: string
	scenarios: [string, RecursivePartial<Scenario>][]
}

export interface LocalStorageGlobalSettings {
	version: string
	globalSettings: GlobalSettings
}

export interface LocalStorageFiles {
	version: string
	files: Uint8Array
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

export interface CcState {
	fileSettings: FileSettings
	dynamicSettings: DynamicSettings
	appSettings: AppSettings
	files: FileState[]
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

export interface AppStatus {
	hoveredNodeId: number | null
	selectedBuildingId: number | null
	rightClickedNodeData: {
		nodeId: number
		xPositionOfRightClickEvent: number
		yPositionOfRightClickEvent: number
	} | null
}
