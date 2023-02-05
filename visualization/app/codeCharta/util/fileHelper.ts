import { ExportBlacklistType, ExportCCFile, ExportWrappedCCFile, OldAttributeTypes } from "../codeCharta.api.model"
import { AttributeDescriptors, AttributeTypes, BlacklistItem, CCFile, NameDataPair } from "../codeCharta.model"
import { FileSelectionState, FileState } from "../model/files/files"
import { hash } from "./hash"

export function getCCFile(file: NameDataPair): CCFile {
	const fileContent = file.content
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
		map: fileContent.nodes[0]
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

export function getSelectedFilesSize(files: FileState[]) {
	let totalFileSize = 0
	for (const file of files) {
		if (file.selectedAs !== FileSelectionState.None) {
			totalFileSize += file.file.fileMeta.exportedFileSize
		}
	}

	return totalFileSize
}

export async function getCCFileAndDecorateFileChecksum(
	jsonInput: string | ExportWrappedCCFile | ExportCCFile
): Promise<ExportCCFile | null> {
	let mappedFile: ExportCCFile = null

	try {
		const fileContent: ExportCCFile | ExportWrappedCCFile =
			typeof jsonInput === "string"
				? (JSON.parse(jsonInput) as ExportWrappedCCFile | ExportCCFile)
				: (jsonInput as ExportWrappedCCFile | ExportCCFile)

		if ("data" in fileContent && "checksum" in fileContent) {
			mappedFile = fileContent.data
			mappedFile.fileChecksum = fileContent.checksum || (await hash(JSON.stringify(fileContent.data)))

			return mappedFile
		}

		if (!fileContent.fileChecksum) {
			const jsonInputString = typeof jsonInput === "string" ? jsonInput : JSON.stringify(jsonInput)
			fileContent.fileChecksum = await hash(jsonInputString)
		}
		return fileContent
	} catch {
		// Explicitly ignored
	}

	return mappedFile
}
