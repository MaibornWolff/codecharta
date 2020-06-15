import { UrlExtractor } from "./util/urlExtractor"
import { IHttpService, ILocationService } from "angular"
import "./codeCharta.component.scss"
import { CodeChartaService } from "./codeCharta.service"
import { ScenarioHelper } from "./util/scenarioHelper"
import { DialogService } from "./ui/dialog/dialog.service"
import { NameDataPair } from "./codeCharta.model"
import { InjectorService } from "./state/injector.service"
import { StoreService } from "./state/store.service"
import { setState } from "./state/store/state.actions"
import { setAppSettings } from "./state/store/appSettings/appSettings.actions"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import packageJson from "../../package.json"
import { setDelta, setMultiple, setSingle } from "./state/store/files/files.actions"
import { getCCFiles } from "./model/files/files.helper"
import sample1 from "./assets/sample1.cc.json"
import sample2 from "./assets/sample2.cc.json"

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
		this._viewModel.version = packageJson.version
		this.urlUtils = new UrlExtractor(this.$location, this.$http)
		this.storeService.dispatch(setIsLoadingFile(true))
		this.loadFileOrSample()
	}

	public loadFileOrSample() {
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
		this.tryLoadingFiles([{ fileName: "sample1.cc.json", content: sample1 }, { fileName: "sample2.cc.json", content: sample2 }])
	}

	private tryLoadingFiles(values: NameDataPair[]) {
		this.storeService.dispatch(setAppSettings())

		this.codeChartaService
			.loadFiles(values)
			.then(() => {
				this.storeService.dispatch(setState(ScenarioHelper.getDefaultScenarioSetting()))
			})
			.catch(e => {
				this.storeService.dispatch(setIsLoadingFile(false))
				console.error(e)
				this.printErrors(e)
			})
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

	private printErrors(errors: Object) {
		this.dialogService.showErrorDialog(JSON.stringify(errors, null, "\t"))
	}
}

export const codeChartaComponent = {
	selector: "codeChartaComponent",
	template: require("./codeCharta.component.html"),
	controller: CodeChartaController
}
