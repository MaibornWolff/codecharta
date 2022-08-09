import { FileToValue } from "./getFilenamesWithHighestMetrics"

function getStringLineFromItem(item: FileToValue): string {
	return `\t${String.fromCodePoint(8226)} ${item.name} (${item.value})` + `\n`
}

function getStringHeaderFromAttribute(title: string): string {
	return `${title.toUpperCase()}\n`
}

export function buildTextOfFiles(filenames: Map<string, FileToValue[]>): string {
	let clipboardText = ""
	for (const [key, files] of filenames.entries()) {
		clipboardText += getStringHeaderFromAttribute(key)
		for (const file of files) {
			clipboardText += getStringLineFromItem(file)
		}
	}

	return clipboardText
}
