import { FileValidator } from "./util/fileValidator"
import { CCFile, NameDataPair } from "./codeCharta.model"
import { FileStateService } from "./state/fileState.service"

export class CodeChartaService {
	public static ROOT_NAME = "root"
	public static ROOT_PATH = "/" + CodeChartaService.ROOT_NAME
	public static SELECTOR = "codeChartaService"

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
					attributeTypes: fileContent.attributeTypes || {},
					blacklist: fileContent.blacklist || [],
					markedPackages: []
				}
			},
			map: fileContent.nodes[0]
		}
	}
}
