import { UrlExtractor } from "./util/urlExtractor"
import { IHttpService, ILocationService } from "angular"
import "./codeCharta.component.scss"
import { CodeChartaService } from "./codeCharta.service"
import { DialogService } from "./ui/dialog/dialog.service"
import { LocalStorageGlobalSettings, NameDataPair } from "./codeCharta.model"
import { InjectorService } from "./state/injector.service"
import { StoreService } from "./state/store.service"
import { setAppSettings } from "./state/store/appSettings/appSettings.actions"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import packageJson from "../../package.json"
import { setDelta, setMultiple, setSingle } from "./state/store/files/files.actions"
import { getCCFiles } from "./model/files/files.helper"
import sample1 from "./assets/sample1.cc.json"
import sample2 from "./assets/sample2.cc.json"
import { ExportCCFile } from "./codeCharta.api.model"
import { DialogGlobalSettingsController } from "./ui/dialog/dialog.globalSettings.component"
import { setLayoutAlgorithm } from "./state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { setIsWhiteBackground } from "./state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { setResetCameraIfNewFileIsLoaded } from "./state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setExperimentalFeaturesEnabled } from "./state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setHideFlatBuildings } from "./state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { GlobalSettingsHelper } from "./util/globalSettingsHelper"

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

	async loadFileOrSample() {
		try {
			const data = await this.urlUtils.getFileDataFromQueryParam()
			this.tryLoadingFiles(data)
			this.setRenderStateFromUrl()
		} catch (error) {
			this.tryLoadingSampleFiles(error)
		}
	}

	tryLoadingSampleFiles(error: Error & { statusText?: string; status?: number }) {
		if (this.urlUtils.getParameterByName("file")) {
			const message = "One or more files from the given file URL parameter could not be loaded. Loading sample files instead."
			let title = "Error"
			if (error.message) {
				title += ` (${error.message})`
			} else if (error.statusText && error.status) {
				title += ` (${error.status}: ${error.statusText})`
			}
			this.dialogService.showErrorDialog(message, title)
		}
		this.tryLoadingFiles([
			{ fileName: "sample1.cc.json", fileSize: 3 * 1024, content: sample1 as ExportCCFile },
			{ fileName: "sample2.cc.json", fileSize: 2 * 1024, content: sample2 as ExportCCFile }
		])
	}

	private tryLoadingFiles(values: NameDataPair[]) {
		this.storeService.dispatch(setAppSettings())
		this.setLocalStorageGlobalSettingsIfExists()
		this.codeChartaService.loadFiles(values)
	}

	private setLocalStorageGlobalSettingsIfExists(){
		if(GlobalSettingsHelper.getGlobalSettings()){
			const ccLocalStorage: LocalStorageGlobalSettings = JSON.parse(localStorage.getItem(DialogGlobalSettingsController.GLOBALSETTINGS_LOCAL_STORAGE_ELEMENT))
			this.storeService.dispatch(setLayoutAlgorithm(ccLocalStorage.globalSettings.layoutAlgorithm))
			this.storeService.dispatch(setIsWhiteBackground(ccLocalStorage.globalSettings.isWhiteBackground))
			this.storeService.dispatch(setResetCameraIfNewFileIsLoaded(ccLocalStorage.globalSettings.resetCameraIfNewFileIsLoaded))
			this.storeService.dispatch(setExperimentalFeaturesEnabled(ccLocalStorage.globalSettings.experimentalFeaturesEnabled))
			this.storeService.dispatch(setHideFlatBuildings(ccLocalStorage.globalSettings.hideFlatBuilding))
		}
	}

	private setRenderStateFromUrl() {
		const renderState = this.urlUtils.getParameterByName("mode")
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
