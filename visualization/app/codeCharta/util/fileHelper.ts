import { ExportBlacklistType, ExportCCFile, OldAttributeTypes } from "../codeCharta.api.model"
import { AttributeTypes, BlacklistItem, BlacklistType, CCFile } from "../codeCharta.model"
import _ from "lodash"

export function getCCFile(fileName: string, fileContent: ExportCCFile): CCFile {
	return {
		fileMeta: {
			fileName,
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
	if (_.isEmpty(attributeTypes) || !attributeTypes || Array.isArray(attributeTypes.nodes) || Array.isArray(attributeTypes.edges)) {
		return {
			nodes: {},
			edges: {}
		}
	}

	return {
		nodes: !attributeTypes.nodes ? {} : attributeTypes.nodes,
		edges: !attributeTypes.edges ? {} : attributeTypes.edges
	}
}

function potentiallyUpdateBlacklistTypes(blacklist): BlacklistItem[] {
	blacklist.forEach(x => {
		if (x.type === ExportBlacklistType.hide) {
			x.type = BlacklistType.flatten
		}
	})
	return blacklist
}
