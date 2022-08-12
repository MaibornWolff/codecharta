import { FileToValue } from "./getFilenamesWithHighestMetrics"

function getStringLineFromItem(item: FileToValue): string {
	return `\t• ${item.name} (${item.value})` + `\n`
}

function getStringHeaderFromAttribute(title: string): string {
	return `${title.toUpperCase()}\n`
}

export function buildTextOfFiles(attributeToFiles: Map<string, FileToValue[]>): string {
	let clipboardText = ""
	for (const [key, files] of attributeToFiles.entries()) {
		clipboardText += getStringHeaderFromAttribute(key)
		for (const file of files) {
			clipboardText += getStringLineFromItem(file)
		}
	}

	return clipboardText
}
