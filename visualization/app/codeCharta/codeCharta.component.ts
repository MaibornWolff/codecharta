import { UrlExtractor } from "./util/urlExtractor"
import { IHttpService, ILocationService } from "angular"
import "./codeCharta.component.scss"
import { LoadFileService } from "./loadFile.service"
import { NameDataPair } from "./codeCharta.model"
import { StoreService } from "./state/store.service"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import packageJson from "../../package.json"
import { setDelta, setStandard } from "./state/store/files/files.actions"
import { getCCFiles } from "./model/files/files.helper"
import sample1 from "./assets/sample1.cc.json"
import sample2 from "./assets/sample2.cc.json"
import { ExportCCFile } from "./codeCharta.api.model"
import { GlobalSettingsHelper } from "./util/globalSettingsHelper"
import { MatDialog } from "@angular/material/dialog"
import { ErrorDialogComponent } from "./ui/dialogs/errorDialog/errorDialog.component"

export class CodeChartaController {
	private _viewModel: {
		version: string
	} = {
		version: "version unavailable"
	}

	private urlUtils: UrlExtractor

	constructor(
		private $location: ILocationService,
		private $http: IHttpService,
		private storeService: StoreService,
		private dialog: MatDialog,
		private loadFileService: LoadFileService
	) {
		"ngInject"
		this._viewModel.version = packageJson.version
		this.urlUtils = new UrlExtractor(this.$location, this.$http)
		this.storeService.dispatch(setIsLoadingFile(true))
		this.loadFileOrSample()
	}

	async loadFileOrSample() {
		try {
			const data = await this.urlUtils.getFileDataFromQueryParam()
			this.tryLoadingFiles(data)
			this.setRenderStateFromUrl()
		} catch (error) {
			this.tryLoadingSampleFiles(error)
		}
	}

	private tryLoadingSampleFiles(error: Error & { statusText?: string; status?: number }) {
		if (this.urlUtils.getParameterByName("file")) {
			const message = "One or more files from the given file URL parameter could not be loaded. Loading sample files instead."
			let title = "Error"
			if (error.message) {
				title += ` (${error.message})`
			} else if (error.statusText && error.status) {
				title += ` (${error.status}: ${error.statusText})`
			}
			this.dialog.open(ErrorDialogComponent, {
				data: { title, message }
			})
		}
		this.tryLoadingFiles([
			{ fileName: "sample1.cc.json", fileSize: 3 * 1024, content: sample1 as ExportCCFile },
			{ fileName: "sample2.cc.json", fileSize: 2 * 1024, content: sample2 as ExportCCFile }
		])
	}

	private tryLoadingFiles(values: NameDataPair[]) {
		GlobalSettingsHelper.setGlobalSettingsOfLocalStorageIfExists(this.storeService)
		this.loadFileService.loadFiles(values)
	}

	// TODO: Please make sure that this function works fine on Github pages with
	//  the updated file selection (no more single mode!)
	private setRenderStateFromUrl() {
		const renderState = this.urlUtils.getParameterByName("mode")
		const files = getCCFiles(this.storeService.getState().files)

		if (renderState === "Delta" && files.length >= 2) {
			this.storeService.dispatch(setDelta(files[0], files[1]))
		} else {
			this.storeService.dispatch(setStandard(files))
		}
	}
}

export const codeChartaComponent = {
	selector: "codeChartaComponent",
	template: require("./codeCharta.component.html"),
	controller: CodeChartaController
}
