import { FileValidator } from "./util/fileValidator"
import { AttributeTypes, CCFile, NameDataPair, BlacklistType, BlacklistItem } from "./codeCharta.model"
import { FileStateService } from "./state/fileState.service"
import _ from "lodash"

export class CodeChartaService {
	public static ROOT_NAME = "root"
	public static ROOT_PATH = "/" + CodeChartaService.ROOT_NAME
	public static readonly CC_FILE_EXTENSION = ".cc.json"

	constructor(private fileStateService: FileStateService) {}

	public loadFiles(nameDataPairs: NameDataPair[]): Promise<void> {
		return new Promise((resolve, reject) => {
			nameDataPairs.forEach((nameDataPair: NameDataPair) => {
				const errors = FileValidator.validate(nameDataPair.content)
				if (errors.length === 0) {
					const ccFile = this.getCCFile(nameDataPair.fileName, nameDataPair.content)
					this.fileStateService.addFile(ccFile)
				} else {
					reject(errors)
				}
			})

			this.fileStateService.setSingle(this.fileStateService.getCCFiles()[0])
			resolve()
		})
	}

	private getCCFile(fileName: string, fileContent: any): CCFile {
		return {
			fileMeta: {
				fileName: fileName,
				projectName: fileContent.projectName,
				apiVersion: fileContent.apiVersion
			},
			settings: {
				fileSettings: {
					edges: fileContent.edges || [],
					attributeTypes: this.getAttributeTypes(fileContent.attributeTypes),
					blacklist: this.potentiallyUpdateBlacklistTypes(fileContent.blacklist || []),
					markedPackages: []
				}
			},
			map: fileContent.nodes[0]
		}
	}

	private getAttributeTypes(attributeTypes: AttributeTypes): AttributeTypes {
		let newAttributeTypes: any = {}

		if (_.isEmpty(attributeTypes) || !attributeTypes) {
			return {
				nodes: [],
				edges: []
			}
		} else {
			if (!attributeTypes.nodes) {
				newAttributeTypes.nodes = []
			} else {
				newAttributeTypes.nodes = attributeTypes.nodes
			}

			if (!attributeTypes.edges) {
				newAttributeTypes.edges = []
			} else {
				newAttributeTypes.edges = attributeTypes.edges
			}
		}
		return newAttributeTypes
	}

	private potentiallyUpdateBlacklistTypes(blacklist: BlacklistItem[]): BlacklistItem[] {
		blacklist.forEach(x => {
			if (x.type === "hide") {
				x.type = BlacklistType.flatten
			}
		})
		return blacklist
	}
}
