import { FileToValue } from "./getFilenamesWithHighestMetrics"

function getLineFromItem(item: FileToValue): string {
    return `\t• ${item.filePath} (${item.value})` + `\n`
}

function getStringHeaderFromAttribute(title: string): string {
    return `${title.toUpperCase()}\n`
}

export function buildTextOfFiles(attributeToFiles: Map<string, FileToValue[]>): string {
    let result = ""
    for (const [key, files] of attributeToFiles.entries()) {
        result += getStringHeaderFromAttribute(key)
        for (const file of files) {
            result += getLineFromItem(file)
        }
    }

    return result
}
