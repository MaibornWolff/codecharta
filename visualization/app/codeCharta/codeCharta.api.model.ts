import { AttributeTypes, CodeMapNode, Edge, MarkedPackage } from "./codeCharta.model"

export interface ExportCCFile {
	projectName: string
	apiVersion: string
	nodes: CodeMapNode[]
	attributeTypes?: AttributeTypes
	edges?: Edge[]
	markedPackages?: MarkedPackage[]
	blacklist?: ExportBlacklistItem[]
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface ExportCCFile_0_1 extends ExportCCFile {
	fileName: string
	apiVersion: APIVersions.ZERO_POINT_ONE
}

export type ExportCCFileAPI = ExportCCFile_0_1 | ExportCCFile

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
