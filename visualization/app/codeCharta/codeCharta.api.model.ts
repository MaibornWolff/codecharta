import { AttributeDescriptors, AttributeTypes, AttributeTypeValue, CodeMapNode, Edge, MarkedPackage } from "./codeCharta.model"
import { CcJson2 } from "./model/ccjson2.model"

export interface NameDataPair {
    fileName: string
    fileSize: number
    content: ExportCCFile | CcJson2
}

export interface ExportCCFile {
    projectName: string
    apiVersion: string
    fileChecksum: string
    nodes: CodeMapNode[]
    attributeTypes?: AttributeTypes | OldAttributeTypes
    attributeDescriptors?: AttributeDescriptors
    edges?: Edge[]
    markedPackages?: MarkedPackage[]
    blacklist?: ExportBlacklistItem[]
    repoCreationDate?: string
}

export interface ExportWrappedCCFile {
    checksum: string
    data: ExportCCFile
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
    ONE_POINT_ONE = "1.1",
    ONE_POINT_TWO = "1.2",
    ONE_POINT_THREE = "1.3",
    ONE_POINT_FIVE = "1.5",
    TWO_POINT_ZERO = "2.0"
}

export interface OldAttributeTypes {
    nodes?: [{ [key: string]: AttributeTypeValue }?]
    edges?: [{ [key: string]: AttributeTypeValue }?]
}
