import { FileValidator } from "./util/fileValidator"
import { AttributeTypes, CCFile, NameDataPair, BlacklistType, BlacklistItem, ExportCCFile } from "./codeCharta.model"
import { FileStateService } from "./state/fileState.service"
import _ from "lodash"
import { NodeDecorator } from "./util/nodeDecorator"

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
					let ccFile = this.getCCFile(nameDataPair.fileName, nameDataPair.content)
					ccFile = NodeDecorator.preDecorateFile(ccFile)
					this.fileStateService.addFile(ccFile)
				} else {
					reject(errors)
				}
			})

			this.fileStateService.setSingle(this.fileStateService.getCCFiles()[0])
			resolve()
		})
	}

	private getCCFile(fileName: string, fileContent: ExportCCFile): CCFile {
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
		if (_.isEmpty(attributeTypes) || !attributeTypes) {
			return {
				nodes: [],
				edges: []
			}
		}
		return {
			nodes: !attributeTypes.nodes ? [] : attributeTypes.nodes,
			edges: !attributeTypes.edges ? [] : attributeTypes.edges
		}
	}

	private potentiallyUpdateBlacklistTypes(blacklist): BlacklistItem[] {
		blacklist.forEach(x => {
			if (x.type === "hide") {
				x.type = BlacklistType.flatten
			}
		})
		return blacklist
	}
}
