import { FileValidator } from "./util/fileValidator"
import { CCFile } from "./codeCharta.model"
import { NameDataPair } from "./util/urlUtils"
import { SettingsService } from "./state/settings.service"
import { IRootScopeService } from "angular"
import { FileStateService } from "./state/fileState.service";
import {ThreeOrbitControlsService} from "./ui/codeMap/threeViewer/threeOrbitControlsService";

export class CodeChartaService {

	// TODO: use ROOT_NAME and ROOT_PATH everywhere in project instead of individual strings
	public static ROOT_NAME = "root"
	public static ROOT_PATH =  "/" + CodeChartaService.ROOT_NAME

	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private fileStateService: FileStateService,
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {
	}

	public resetMaps(): any {
		throw new Error("Method not implemented.")
	}

	public loadFiles(nameDataPairs: NameDataPair[]): Promise<void> {
		return new Promise((resolve, reject) => {

			this.settingsService.updateSettings(this.settingsService.getDefaultSettings())

			nameDataPairs.forEach((nameDataPair: NameDataPair) => {
				const errors = FileValidator.validate(nameDataPair.content as any)
				if (errors.length === 0) {
					const ccFile = this.getCCFile(nameDataPair.fileName, nameDataPair.content)
					this.fileStateService.addFile(ccFile)
				} else {
					reject(errors)
				}
			})

			this.fileStateService.setSingle(this.fileStateService.getCCFiles()[0])
			// TODO this.settingsService.updateSettingsFromUrl();
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
				}
			},
			map: fileContent.nodes[0]
		}
	}
}
