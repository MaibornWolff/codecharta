import { ExportBlacklistType, ExportCCFile, OldAttributeTypes } from "../codeCharta.api.model"
import { AttributeTypes, BlacklistItem, BlacklistType, CCFile } from "../codeCharta.model"

export function getCCFile(fileName: string, fileContent: ExportCCFile): CCFile {
	return {
		fileMeta: {
			fileName,
			fileChecksum: fileContent.fileChecksum,
			projectName: fileContent.projectName,
			apiVersion: fileContent.apiVersion
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
