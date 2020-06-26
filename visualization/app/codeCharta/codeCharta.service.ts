import { validate, CCValidationResult } from "./util/fileValidator"
import { AttributeTypes, CCFile, NameDataPair, BlacklistType, BlacklistItem } from "./codeCharta.model"
import _ from "lodash"
import { NodeDecorator } from "./util/nodeDecorator"
import { OldAttributeTypes, ExportBlacklistType, ExportCCFile } from "./codeCharta.api.model"
import { StoreService } from "./state/store.service"
import { addFile, setSingle } from "./state/store/files/files.actions"
import { getCCFiles } from "./model/files/files.helper"
import { DialogService } from "./ui/dialog/dialog.service"

export class CodeChartaService {
	public static ROOT_NAME = "root"
	public static ROOT_PATH = "/" + CodeChartaService.ROOT_NAME
	public static readonly CC_FILE_EXTENSION = ".cc.json"

	constructor(private storeService: StoreService, private dialogService: DialogService) {}

	public loadFiles(nameDataPairs: NameDataPair[]): Promise<void> {
		return new Promise((resolve, reject) => {
			nameDataPairs.forEach((nameDataPair: NameDataPair) => {
				try {
					validate(nameDataPair.content)
				} catch (e) {
					if (e.warning.length > 0) {
						this.printWarnings(e)
					} else {
						reject(e)
					}
				}
				this.addFile(nameDataPair.fileName, nameDataPair.content)
			})
			this.storeService.dispatch(setSingle(getCCFiles(this.storeService.getState().files)[0]))
			resolve()
		})
	}

	private addFile(fileName: string, migratedFile: ExportCCFile) {
		const ccFile: CCFile = this.getCCFile(fileName, migratedFile)
		NodeDecorator.preDecorateFile(ccFile)
		this.storeService.dispatch(addFile(ccFile))
	}

	private getCCFile(fileName: string, fileContent: ExportCCFile): CCFile {
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
					blacklist: this.potentiallyUpdateBlacklistTypes(fileContent.blacklist || []),
					markedPackages: fileContent.markedPackages || []
				}
			},
			map: fileContent.nodes[0]
		}
	}

	private getAttributeTypes(attributeTypes: AttributeTypes | OldAttributeTypes): AttributeTypes {
		if (_.isEmpty(attributeTypes) || !attributeTypes) {
			return {
				nodes: {},
				edges: {}
			}
		}

		if (_.isArray(attributeTypes.nodes) || _.isArray(attributeTypes.edges)) {
			return this.migrateAttributeTypes(attributeTypes as OldAttributeTypes)
		}

		return {
			nodes: !attributeTypes.nodes ? {} : attributeTypes.nodes,
			edges: !attributeTypes.edges ? {} : attributeTypes.edges
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

	private migrateAttributeTypes(attributeTypes: OldAttributeTypes): AttributeTypes {
		const result = { nodes: {}, edges: {} }
		attributeTypes.nodes.forEach(x => {
			result.nodes[Object.keys(x)[0]] = Object.values(x)[0]
		})
		attributeTypes.edges.forEach(x => {
			result.edges[Object.keys(x)[0]] = Object.values(x)[0]
		})

		return result
	}

	private printWarnings(validationResult: CCValidationResult) {
		const warningSymbol = '<i class="fa fa-exclamation-triangle"></i> '
		const lineBreak = "<br>"

		const warningMessage = validationResult.warning.map(message => warningSymbol + message).join(lineBreak)

		const htmlMessage = "<p>" + warningMessage + "</p>"

		this.dialogService.showErrorDialog(htmlMessage, validationResult.title)
	}
}
