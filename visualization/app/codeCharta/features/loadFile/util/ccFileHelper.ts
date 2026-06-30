import { ExportBlacklistType, ExportCCFile, ExportWrappedCCFile, OldAttributeTypes, NameDataPair } from "../../../codeCharta.api.model"
import { AttributeDescriptors, AttributeTypes, BlacklistItem, CCFile } from "../../../codeCharta.model"
import { CcJson2 } from "../../../model/ccjson2.model"
import md5 from "md5"
import { clone } from "../../../util/clone"
import { isCcJson2 } from "./fileValidator"
import { mapCcJson2ToCCFile } from "./ccJson2/ccJson2ToCCFile"

export function getContentChecksum(content: ExportCCFile | CcJson2): string {
    return isCcJson2(content) ? (content as CcJson2).meta.checksum : (content as ExportCCFile).fileChecksum
}

export function getCCFile(file: NameDataPair): CCFile {
    if (isCcJson2(file.content)) {
        return mapCcJson2ToCCFile(file.content as CcJson2, file)
    }
    const fileContent = file.content as ExportCCFile
    return {
        fileMeta: {
            fileName: file.fileName,
            fileChecksum: fileContent.fileChecksum,
            projectName: fileContent.projectName,
            apiVersion: fileContent.apiVersion,
            exportedFileSize: file.fileSize,
            repoCreationDate: fileContent.repoCreationDate || ""
        },
        settings: {
            fileSettings: {
                edges: fileContent.edges || [],
                attributeTypes: getAttributeTypes(fileContent.attributeTypes),
                attributeDescriptors: getAttributeDescriptors(fileContent.attributeDescriptors),
                blacklist: potentiallyUpdateBlacklistTypes(fileContent.blacklist || []),
                markedPackages: fileContent.markedPackages || []
            }
        },
        map: clone(fileContent.nodes[0])
    }
}

function getAttributeTypes(attributeTypes: AttributeTypes | OldAttributeTypes): AttributeTypes {
    if (!attributeTypes || Array.isArray(attributeTypes.nodes) || Array.isArray(attributeTypes.edges)) {
        return {
            nodes: {},
            edges: {}
        }
    }

    return {
        nodes: attributeTypes.nodes ?? {},
        edges: attributeTypes.edges ?? {}
    }
}

function getAttributeDescriptors(attributeDescriptors: AttributeDescriptors): AttributeDescriptors {
    return attributeDescriptors || {}
}

function potentiallyUpdateBlacklistTypes(blacklist): BlacklistItem[] {
    for (const entry of blacklist) {
        if (entry.type === ExportBlacklistType.hide) {
            entry.type = "flatten"
        }
    }
    return blacklist
}

export function getCCFileAndDecorateFileChecksum(
    jsonInput: string | ExportWrappedCCFile | ExportCCFile | CcJson2
): ExportCCFile | CcJson2 | null {
    let mappedFile: ExportCCFile = null

    try {
        const fileContent: ExportCCFile | ExportWrappedCCFile | CcJson2 =
            typeof jsonInput === "string" ? (JSON.parse(jsonInput) as ExportWrappedCCFile | ExportCCFile | CcJson2) : jsonInput

        if (isCcJson2(fileContent as ExportCCFile | CcJson2)) {
            const ccJson2 = fileContent as CcJson2
            if (!ccJson2.meta.checksum) {
                const jsonInputString = typeof jsonInput === "string" ? jsonInput : JSON.stringify(jsonInput)
                ccJson2.meta.checksum = md5(jsonInputString)
            }
            return ccJson2
        }

        const legacyContent = fileContent as ExportCCFile | ExportWrappedCCFile
        if ("data" in legacyContent && "checksum" in legacyContent) {
            mappedFile = legacyContent.data
            mappedFile.fileChecksum = legacyContent.checksum || md5(JSON.stringify(legacyContent.data))

            return mappedFile
        }

        if (!legacyContent.fileChecksum) {
            const jsonInputString = typeof jsonInput === "string" ? jsonInput : JSON.stringify(jsonInput)
            legacyContent.fileChecksum = md5(jsonInputString)
        }
        return legacyContent
    } catch {
        // Explicitly ignored
    }

    return mappedFile
}
