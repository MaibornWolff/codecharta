import {
	AttributeTypes,
	AttributeTypeValue,
	CodeMapNode,
	Edge,
	MarkedPackage,
	MetricStatisticsItem,
	RecursivePartial,
	Settings
} from "./codeCharta.model"

export interface ExportCCFile {
	projectName: string
	apiVersion: string
	fileChecksum: string
	nodes: CodeMapNode[]
	attributeTypes?: AttributeTypes | OldAttributeTypes
	edges?: Edge[]
	markedPackages?: MarkedPackage[]
	blacklist?: ExportBlacklistItem[]
	metricStatistics?: ExportMetricStatisticsItem[]
}

export interface ExportBlacklistItem {
	path: string
	type: ExportBlacklistType
}

export type ExportMetricStatisticsItem = MetricStatisticsItem

export enum ExportBlacklistType {
	hide = "hide",
	exclude = "exclude"
}

export enum APIVersions {
	ZERO_POINT_ONE = "0.1",
	ONE_POINT_ZERO = "1.0",
	ONE_POINT_ONE = "1.1",
	ONE_POINT_TWO = "1.2"
}

export interface ExportScenario {
	name: string
	settings: RecursivePartial<Settings>
}

export interface OldAttributeTypes {
	nodes?: [{ [key: string]: AttributeTypeValue }?]
	edges?: [{ [key: string]: AttributeTypeValue }?]
}
