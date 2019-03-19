import { NameDataPair, UrlUtils } from "./util/urlUtils"
import {IHttpService, ILocationService, IRootScopeService} from "angular"
import "./codeCharta.component.scss"
import { CodeChartaService } from "./codeCharta.service"
import {SettingsService} from "./state/settings.service";
import {ScenarioHelper} from "./util/scenarioHelper";
import {DialogService} from "./ui/dialog/dialog.service";

/**
 * This is the main controller of the CodeCharta application
 */
export class CodeChartaController {
	public viewModel = {
		version: require("../../package.json").version,
		numberOfLoadingTasks: 0
	}
	private urlUtils: UrlUtils

	/* @ngInject */
	constructor(
		//private threeOrbitControlsService: ThreeOrbitControlsService,
		private $rootScope: IRootScopeService,
		private dialogService: DialogService,
		//private codeMapActionsService: CodeMapActionsService,
		private settingsService: SettingsService,
		private codeChartaService: CodeChartaService,
		private $location: ILocationService,
		private $http: IHttpService
	) {
		this.urlUtils = new UrlUtils(this.$location, this.$http)
		this.subscribeToLoadingEvents(this.$rootScope)
		this.loadFileOrSample()
	}

	public fitMapToView() {
		// this.threeOrbitControlsService.autoFitTo()
	}

	public removeFocusedNode() {
		//this.codeMapActionsService.removeFocusedNode()
	}

	public loadFileOrSample() {
		this.viewModel.numberOfLoadingTasks++
		return this.urlUtils.getFileDataFromQueryParam().then((data: NameDataPair[]) => {
			if (data.length > 0) {
				this.tryLoadingFiles(data)
			} else {
				this.tryLoadingSampleFiles()
			}
		}, this.tryLoadingSampleFiles.bind(this))
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
        this.codeChartaService
        .loadFiles(
            values
        )
        .then(() => {
        	this.viewModel.numberOfLoadingTasks--
			this.settingsService.updateSettings(ScenarioHelper.getDefaultScenario().settings)
		})
        .catch(e => {
			this.viewModel.numberOfLoadingTasks--
			console.error(e);
            this.printErrors(e)
        })
    }

	private printErrors(errors: Object) {
		//this.dialogService.showErrorDialog(JSON.stringify(errors, null, "\t"))
	}

	private subscribeToLoadingEvents($rootScope: angular.IRootScopeService) {
		$rootScope.$on("add-loading-task", () => {
			this.viewModel.numberOfLoadingTasks++
		})

		$rootScope.$on("remove-loading-task", () => {
			this.viewModel.numberOfLoadingTasks--
		})
	}
}

export const codeChartaComponent = {
	selector: "codeChartaComponent",
	template: require("./codeCharta.component.html"),
	controller: CodeChartaController
}
