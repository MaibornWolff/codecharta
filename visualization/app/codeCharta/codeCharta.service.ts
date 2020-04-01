import { validate } from "./util/fileValidator"
import { AttributeTypes, CCFile, NameDataPair, BlacklistType, BlacklistItem } from "./codeCharta.model"
import _ from "lodash"
import { NodeDecorator } from "./util/nodeDecorator"
import { ExportBlacklistType, ExportCCFile } from "./codeCharta.api.model"
import { StoreService } from "./state/store.service"
import { addFile, setSingle } from "./state/store/files/files.actions"

export class CodeChartaService {
	public static ROOT_NAME = "root"
	public static ROOT_PATH = "/" + CodeChartaService.ROOT_NAME
	public static readonly CC_FILE_EXTENSION = ".cc.json"

	constructor(private storeService: StoreService) {}

	public loadFiles(nameDataPairs: NameDataPair[]): Promise<void> {
		return new Promise((resolve, reject) => {
			nameDataPairs.forEach((nameDataPair: NameDataPair) => {
				const errors = validate(nameDataPair.content)
				if (errors.length > 0) {
					reject(errors)
				}
				this.addFile(nameDataPair.fileName, nameDataPair.content)
			})
			this.storeService.dispatch(setSingle(this.storeService.getState().files.getCCFiles()[0]))
			resolve()
		})
	}

	private addFile(fileName: string, migratedFile: ExportCCFile) {
		const ccFile = this.getCCFile(fileName, migratedFile)
		NodeDecorator.preDecorateFile(ccFile)
		this.storeService.dispatch(addFile(ccFile))
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
					markedPackages: fileContent.markedPackages || []
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
			if (x.type === ExportBlacklistType.hide) {
				x.type = BlacklistType.flatten
			}
		})
		return blacklist
	}
}
