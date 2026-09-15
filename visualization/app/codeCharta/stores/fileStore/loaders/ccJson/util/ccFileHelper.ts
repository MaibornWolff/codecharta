import { ungzip } from "pako"
import { CcJson2 } from "../../../../../model/ccjson2.model"
import { ExportCCFile, ExportWrappedCCFile, NameDataPair } from "../../../../../model/codeCharta.api.model"
import { CCFile } from "../../../../../model/codeCharta.model"
import { parseGameObjectsFile } from "../../gameObjects/gameObjectsImporter"
import { validateGameObjects } from "../../gameObjects/gameObjectsValidator"
import { mapCcJson2ToCCFile } from "./ccJson2/ccJson2ToCCFile"
import { normalizeExportCCFileToCcJson2 } from "./ccJson2/normalizeToCcJson2"
import { isCcJson2 } from "./fileValidator"
import { parseJsonBytes } from "./jsonBytes"

const GZIP_FIRST_BYTE = 0x1f
const GZIP_SECOND_BYTE = 0x8b
const HEX_RADIX = 16
const HEX_DIGITS_PER_BYTE = 2

type ParsedCcFile = ExportWrappedCCFile | ExportCCFile | CcJson2

export function getContentChecksum(content: ExportCCFile | CcJson2): string {
    return isCcJson2(content) ? content.meta.checksum : content.fileChecksum
}

export function getCCFile(file: NameDataPair): CCFile {
    // Legacy 1.x content is normalized to 2.0 first, so there is a single mapping path (no version branch).
    const project = isCcJson2(file.content) ? file.content : normalizeExportCCFileToCcJson2(file.content)
    return mapCcJson2ToCCFile(project, file)
}

export async function parseCcFileBytes(fileBytes: Uint8Array): Promise<ExportCCFile | CcJson2 | null> {
    try {
        const jsonBytes = isGzipped(fileBytes) ? ungzip(fileBytes) : fileBytes
        const parsed = parseJsonBytes(jsonBytes)
        if (typeof parsed !== "object" || parsed === null) {
            return null
        }
        const content = unwrap(convertGameObjects(parsed))
        if (!getContentChecksum(content) && canComputeChecksum()) {
            setContentChecksum(content, await sha256Hex(jsonBytes))
        }
        return content
    } catch {
        return null
    }
}

function isGzipped(bytes: Uint8Array): boolean {
    return bytes[0] === GZIP_FIRST_BYTE && bytes[1] === GZIP_SECOND_BYTE
}

function convertGameObjects(parsed: object): ParsedCcFile {
    if ("gameObjectPositions" in parsed && validateGameObjects(parsed)) {
        return parseGameObjectsFile(parsed)
    }
    return parsed as ParsedCcFile
}

function unwrap(parsed: ParsedCcFile): ExportCCFile | CcJson2 {
    if (!isWrappedCCFile(parsed)) {
        return parsed
    }
    parsed.data.fileChecksum = parsed.checksum
    return parsed.data
}

function isWrappedCCFile(content: ParsedCcFile): content is ExportWrappedCCFile {
    return "data" in content && "checksum" in content
}

function setContentChecksum(content: ExportCCFile | CcJson2, checksum: string) {
    if (isCcJson2(content)) {
        content.meta.checksum = checksum
    } else {
        content.fileChecksum = checksum
    }
}

function canComputeChecksum(): boolean {
    return globalThis.crypto?.subtle !== undefined
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", bytes as Uint8Array<ArrayBuffer>)
    return Array.from(new Uint8Array(digest), byte => byte.toString(HEX_RADIX).padStart(HEX_DIGITS_PER_BYTE, "0")).join("")
}
