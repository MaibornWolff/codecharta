import { FileValidator, CCValidationResult } from "./util/fileValidator"
import { AttributeTypes, CCFile, NameDataPair, BlacklistType, BlacklistItem } from "./codeCharta.model"
import _ from "lodash"
import { NodeDecorator } from "./util/nodeDecorator"
import { StoreService } from "./state/store.service"
import { addFile, setSingle } from "./state/store/files/files.actions"
import { Blacklist } from "./model/blacklist"

export class CodeChartaService {
	public static ROOT_NAME = "root"
	public static ROOT_PATH = "/" + CodeChartaService.ROOT_NAME
	public static readonly CC_FILE_EXTENSION = ".cc.json"

	constructor(private storeService: StoreService) {}

	public loadFiles(nameDataPairs: NameDataPair[]): Promise<void> {
		return new Promise((resolve, reject) => {
			nameDataPairs.forEach((nameDataPair: NameDataPair) => {
				const validationResult: CCValidationResult = FileValidator.validate(nameDataPair.content)
				if (validationResult.error.length === 0) {
					const ccFile = this.getCCFile(nameDataPair.fileName, nameDataPair.content)
					NodeDecorator.preDecorateFile(ccFile)
					this.storeService.dispatch(addFile(ccFile))
					if (validationResult.warning.length !== 0) {
						reject(validationResult)
					}
				} else {
					reject(validationResult)
				}
			})
			this.storeService.dispatch(setSingle(this.storeService.getState().files.getCCFiles()[0]))
			resolve()
		})
	}

	private getCCFile(fileName: string, fileContent: any): CCFile {
		return {
			fileMeta: {
				fileName,
				projectName: fileContent.projectName,
				apiVersion: fileContent.apiVersion
			},
			settings: {
				fileSettings: {
					edges: fileContent.edges || [],
					attributeTypes: this.getAttributeTypes(fileContent.attributeTypes),
					blacklist: new Blacklist(this.potentiallyUpdateBlacklistTypes(fileContent.blacklist || [])),
					markedPackages: fileContent.markedPackages || []
				}
			},
			map: fileContent.nodes[0]
		}
	}

	private getAttributeTypes(attributeTypes: AttributeTypes): AttributeTypes {
		const newAttributeTypes: any = {}

		if (_.isEmpty(attributeTypes) || !attributeTypes) {
			return {
				nodes: {},
				edges: {}
			}
		} else {
			if (!attributeTypes.nodes) {
				newAttributeTypes.nodes = {}
			} else {
				newAttributeTypes.nodes = attributeTypes.nodes
			}

			if (!attributeTypes.edges) {
				newAttributeTypes.edges = {}
			} else {
				newAttributeTypes.edges = attributeTypes.edges
			}
		}
		return newAttributeTypes
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
