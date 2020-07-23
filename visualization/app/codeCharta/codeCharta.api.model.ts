import { AttributeTypes, AttributeTypeValue, CodeMapNode, Edge, MarkedPackage, RecursivePartial, Settings } from "./codeCharta.model"

export interface ExportCCFile {
	projectName: string
	apiVersion: string
	nodes: CodeMapNode[]
	attributeTypes?: AttributeTypes | OldAttributeTypes
	edges?: Edge[]
	markedPackages?: MarkedPackage[]
	blacklist?: ExportBlacklistItem[]
}

export interface ExportBlacklistItem {
	path: string
	type: ExportBlacklistType
}

export enum ExportBlacklistType {
	hide = "hide",
	exclude = "exclude"
}

export enum APIVersions {
	ZERO_POINT_ONE = "0.1",
	ONE_POINT_ZERO = "1.0",
	ONE_POINT_ONE = "1.1"
}

export interface ExportScenario {
	name: string
	settings: RecursivePartial<Settings>
}

export interface OldAttributeTypes {
	nodes?: [{ [key: string]: AttributeTypeValue }]
	edges?: [{ [key: string]: AttributeTypeValue }]
}
