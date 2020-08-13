import { UrlExtractor } from "./util/urlExtractor"
import { IHttpService, ILocationService } from "angular"
import "./codeCharta.component.scss"
import { CodeChartaService } from "./codeCharta.service"
import { DialogService } from "./ui/dialog/dialog.service"
import { NameDataPair, SearchPanelMode } from "./codeCharta.model"
import { InjectorService } from "./state/injector.service"
import { StoreService } from "./state/store.service"
import { setAppSettings } from "./state/store/appSettings/appSettings.actions"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import * as codeCharta from "../../package.json"
import { setDelta, setMultiple, setSingle } from "./state/store/files/files.actions"
import { getCCFiles } from "./model/files/files.helper"
import { setSearchPanelMode } from "./state/store/appSettings/searchPanelMode/searchPanelMode.actions"

export class CodeChartaController {
	private _viewModel: {
		version: string
	} = {
		version: "version unavailable"
	}

	private urlUtils: UrlExtractor

	/* @ngInject */
	constructor(
		private $location: ILocationService,
		private $http: IHttpService,
		private storeService: StoreService,
		private dialogService: DialogService,
		private codeChartaService: CodeChartaService,
		// @ts-ignore
		private injectorService: InjectorService // We have to inject it somewhere
	) {
		this._viewModel.version = codeCharta.version
		this.urlUtils = new UrlExtractor(this.$location, this.$http)
		this.storeService.dispatch(setIsLoadingFile(true))
		this.loadFileOrSample()
	}

	public loadFileOrSample() {
		console.log("abc")
		return this.urlUtils
			.getFileDataFromQueryParam()
			.then((data: NameDataPair[]) => {
				if (data.length > 0) {
					this.tryLoadingFiles(data)
					this.setRenderStateFromUrl()
				} else {
					this.tryLoadingSampleFiles()
				}
			})
			.catch(() => {
				this.tryLoadingSampleFiles()
			})
	}

	public tryLoadingSampleFiles() {
		if (this.urlUtils.getParameterByName("file")) {
			this.dialogService.showErrorDialog(
				"One or more files from the given file URL parameter could not be loaded. Loading sample files instead."
			)
		}
		this.tryLoadingFiles([
			{ fileName: "sample1.cc.json", content: require("./assets/sample1.cc.json") },
			{ fileName: "sample2.cc.json", content: require("./assets/sample2.cc.json") }
		])
	}

	public onClick() {
		if (this.storeService.getState().appSettings.searchPanelMode !== SearchPanelMode.minimized) {
			this.storeService.dispatch(setSearchPanelMode(SearchPanelMode.minimized))
		}
	}

	private tryLoadingFiles(values: NameDataPair[]) {
		this.storeService.dispatch(setAppSettings())
		this.codeChartaService.loadFiles(values)
	}

	private setRenderStateFromUrl() {
		const renderState: string = this.urlUtils.getParameterByName("mode")
		const files = getCCFiles(this.storeService.getState().files)

		if (renderState === "Delta" && files.length >= 2) {
			this.storeService.dispatch(setDelta(files[0], files[1]))
		} else if (renderState === "Multiple") {
			this.storeService.dispatch(setMultiple(files))
		} else {
			this.storeService.dispatch(setSingle(files[0]))
		}
	}
}

export const codeChartaComponent = {
	selector: "codeChartaComponent",
	template: require("./codeCharta.component.html"),
	controller: CodeChartaController
}
