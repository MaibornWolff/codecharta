import { ExportBlacklistType, OldAttributeTypes } from "../codeCharta.api.model"
import { AttributeTypes, BlacklistItem, BlacklistType, CCFile, NameDataPair } from "../codeCharta.model"
import { FileSelectionState, FileState } from "../model/files/files"

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

function potentiallyUpdateBlacklistTypes(blacklist): BlacklistItem[] {
	for (const entry of blacklist) {
		if (entry.type === ExportBlacklistType.hide) {
			entry.type = BlacklistType.flatten
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
