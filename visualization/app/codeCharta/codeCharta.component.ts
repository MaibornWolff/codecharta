import "./codeCharta.component.scss"
import { StoreService } from "./state/store.service"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import packageJson from "../../package.json"
import { LoadInitialFileService } from "./services/loadFile/loadInitialFile/loadInitialFile.service"

export class CodeChartaController {
	private _viewModel: {
		version: string
	} = {
		version: "version unavailable"
	}

	constructor(private storeService: StoreService, private loadInitialFileService: LoadInitialFileService) {
		"ngInject"
		this._viewModel.version = packageJson.version
		this.storeService.dispatch(setIsLoadingFile(true))
		this.loadInitialFileService.loadFileOrSample()
	}
}

export const codeChartaComponent = {
	selector: "codeChartaComponent",
	template: require("./codeCharta.component.html"),
	controller: CodeChartaController
}
