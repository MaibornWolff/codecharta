import { ExportCCFile, ExportWrappedCCFile, NameDataPair } from "../../../../codeCharta.api.model"
import { CCFile } from "../../../../codeCharta.model"
import { CcJson2 } from "../../../../model/ccjson2.model"
import md5 from "md5"
import { isCcJson2 } from "./fileValidator"
import { mapCcJson2ToCCFile } from "./ccJson2/ccJson2ToCCFile"
import { normalizeExportCCFileToCcJson2 } from "./ccJson2/normalizeToCcJson2"

export function getContentChecksum(content: ExportCCFile | CcJson2): string {
    return isCcJson2(content) ? content.meta.checksum : content.fileChecksum
}

export function getCCFile(file: NameDataPair): CCFile {
    // Legacy 1.x content is normalized to 2.0 first, so there is a single mapping path (no version branch).
    const project = isCcJson2(file.content) ? file.content : normalizeExportCCFileToCcJson2(file.content)
    return mapCcJson2ToCCFile(project, file)
}

export function getCCFileAndDecorateFileChecksum(
    jsonInput: string | ExportWrappedCCFile | ExportCCFile | CcJson2
): ExportCCFile | CcJson2 | null {
    try {
        const parsed: ExportWrappedCCFile | ExportCCFile | CcJson2 = typeof jsonInput === "string" ? JSON.parse(jsonInput) : jsonInput
        const checksumOfInput = () => md5(typeof jsonInput === "string" ? jsonInput : JSON.stringify(jsonInput))

        if (isWrappedCCFile(parsed)) {
            const unwrapped = parsed.data
            unwrapped.fileChecksum = parsed.checksum || md5(JSON.stringify(parsed.data))
            return unwrapped
        }
        if (isCcJson2(parsed)) {
            parsed.meta.checksum ||= checksumOfInput()
            return parsed
        }
        parsed.fileChecksum ||= checksumOfInput()
        return parsed
    } catch {
        return null
    }
}

function isWrappedCCFile(content: ExportWrappedCCFile | ExportCCFile | CcJson2): content is ExportWrappedCCFile {
    return "data" in content && "checksum" in content
}
