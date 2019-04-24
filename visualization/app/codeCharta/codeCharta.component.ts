import { UrlExtractor } from "./util/urlExtractor"
import { IHttpService, ILocationService, IRootScopeService, ITimeoutService } from "angular"
import "./codeCharta.component.scss"
import { CodeChartaService } from "./codeCharta.service"
import {SettingsService, SettingsServiceSubscriber} from "./state/settings.service";
import {ScenarioHelper} from "./util/scenarioHelper";
import {DialogService} from "./ui/dialog/dialog.service";
import {ThreeOrbitControlsService} from "./ui/codeMap/threeViewer/threeOrbitControlsService";
import {CodeMapActionsService} from "./ui/codeMap/codeMap.actions.service";
import { Settings, NameDataPair, RecursivePartial } from "./codeCharta.model"
import {FileStateService} from "./state/fileState.service";


export interface CodeChartaControllerSubscriber {
	onLoadingStatusChanged(isLoadingFile: boolean, event: angular.IAngularEvent)
}

export class CodeChartaController implements SettingsServiceSubscriber, CodeChartaControllerSubscriber {

	public static readonly LOADING_STATUS_EVENT = "loading-status-changed"

	private _viewModel: {
		version: string,
		isLoadingFile: boolean,
		focusedNodePath: string
	} = {
		version: require("../../package.json").version,
		isLoadingFile: true,
		focusedNodePath: ""
	}

	private urlUtils: UrlExtractor

	/* @ngInject */
	constructor(
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private $rootScope: IRootScopeService,
		private dialogService: DialogService,
		private codeMapActionsService: CodeMapActionsService,
		private settingsService: SettingsService,
		private codeChartaService: CodeChartaService,
		private fileStateService: FileStateService,
		private $location: ILocationService,
		private $http: IHttpService,
		private $timeout: ITimeoutService
	) {
		SettingsService.subscribe(this.$rootScope, this)
		CodeChartaController.subscribe(this.$rootScope, this)

		this.urlUtils = new UrlExtractor(this.$location, this.$http)
		this.onLoadingStatusChanged(true, undefined)
		this.loadFileOrSample()
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: angular.IAngularEvent) {
		this._viewModel.focusedNodePath = settings.dynamicSettings.focusedNodePath
	}

	public onLoadingStatusChanged(isLoadingFile: boolean, event: angular.IAngularEvent) {
		this._viewModel.isLoadingFile = isLoadingFile
		this.synchronizeAngularTwoWayBinding()
	}

	public fitMapToView() {
		this.threeOrbitControlsService.autoFitTo()
	}

	public removeFocusedNode() {
		this.codeMapActionsService.removeFocusedNode()
	}

	public loadFileOrSample() {
		return this.urlUtils.getFileDataFromQueryParam()
			.then((data: NameDataPair[]) => {
				if (data.length > 0) {
					this.tryLoadingFiles(data)
					this.setRenderStateFromUrl();
				} else {
					this.tryLoadingSampleFiles()
				}
			})
			.catch(
				() => {
					this.tryLoadingSampleFiles()
				}
			)
	}

	public tryLoadingSampleFiles() {
		if (this.urlUtils.getParameterByName("file")) {
			this.dialogService.showErrorDialog(
				"One or more files from the given file URL parameter could not be loaded. Loading sample files instead."
			)
		}
		this.tryLoadingFiles([
            { fileName: "sample1.json", content: require("./assets/sample1.json") },
            { fileName: "sample2.json", content: require("./assets/sample2.json") }
        ]);
    }
    
    private tryLoadingFiles(values: NameDataPair[]) {
		this.settingsService.updateSettings(this.settingsService.getDefaultSettings())

		this.codeChartaService.loadFiles(values)
			.then(() => {
				this.settingsService.updateSettings(ScenarioHelper.getDefaultScenario().settings)
			})
			.catch(e => {
				this.onLoadingStatusChanged(false, undefined)
				console.error(e);
				this.printErrors(e)
			})
    }

    private setRenderStateFromUrl() {
		const renderState: string = this.urlUtils.getParameterByName("mode")
		const files = this.fileStateService.getCCFiles()

		if (renderState === "Delta" && files.length >= 2) {
			this.fileStateService.setDelta(files[0], files[1])

		} else if (renderState === "Multiple") {
			this.fileStateService.setMultiple(files)

		} else {
			this.fileStateService.setSingle(files[0])
		}
	}

	private printErrors(errors: Object) {
		this.dialogService.showErrorDialog(JSON.stringify(errors, null, "\t"))
	}

	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: CodeChartaControllerSubscriber) {
		$rootScope.$on(CodeChartaController.LOADING_STATUS_EVENT, (event, data) => {
			subscriber.onLoadingStatusChanged(data, event)
		})
	}
}

export const codeChartaComponent = {
	selector: "codeChartaComponent",
	template: require("./codeCharta.component.html"),
	controller: CodeChartaController
}
