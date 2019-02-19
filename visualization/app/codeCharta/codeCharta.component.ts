import { NameDataPair, UrlService } from "./core/url/url.service"
import { IRootScopeService } from "angular"
import "./codeCharta.component.scss"
import { DialogService } from "./ui/dialog/dialog.service"
import { ThreeOrbitControlsService } from "./ui/codeMap/threeViewer/threeOrbitControlsService"
import { NodeContextMenuController } from "./ui/nodeContextMenu/nodeContextMenu.component"
import { CodeMapActionsService } from "./ui/codeMap/codeMap.actions.service"
import { CodeChartaService } from "./codeCharta.service"

/**
 * This is the main controller of the CodeCharta application
 */
export class CodeChartaController {
	public viewModel = {
		version: require("../../package.json").version,
		numberOfLoadingTasks: 0
	}

	/* @ngInject */
	constructor(
		private urlService: UrlService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private $rootScope: IRootScopeService,
		private dialogService: DialogService,
		private codeMapActionsService: CodeMapActionsService,
		private codeChartaService: CodeChartaService
	) {
		this.subscribeToLoadingEvents($rootScope)
		this.loadFileOrSample()
		this.initContextMenuCloseHandler()
	}

	public fitMapToView() {
		this.threeOrbitControlsService.autoFitTo()
	}

	public removeFocusedNode() {
		this.codeMapActionsService.removeFocusedNode()
	}

	public loadFileOrSample() {
		this.viewModel.numberOfLoadingTasks++
		return this.urlService.getFileDataFromQueryParam().then((data: NameDataPair[]) => {
			if (data.length > 0) {
				this.tryLoadingFiles(data)
			} else {
				this.tryLoadingSampleFiles()
			}
		}, this.tryLoadingSampleFiles.bind(this))
	}

	public tryLoadingSampleFiles() {
		if (this.urlService.getParam("file")) {
			this.dialogService.showErrorDialog(
				"One or more files from the given file URL parameter could not be loaded. Loading sample files instead."
			)
		}
		this.tryLoadingFiles([
            { name: "sample1.json", data: require("./assets/sample1.json") },
            { name: "sample2.json", data: require("./assets/sample2.json") }
        ]);
    }
    
    private tryLoadingFiles(values: NameDataPair[]) {
        this.codeChartaService
        .loadFiles(
            values
        )
        .then(() => this.viewModel.numberOfLoadingTasks--)
        .catch(e => {
            this.viewModel.numberOfLoadingTasks--
            this.printErrors(e)
        })
    }

	public printErrors(errors: Object) {
		this.dialogService.showErrorDialog(JSON.stringify(errors, null, "\t"))
	}

	private initContextMenuCloseHandler() {
		document.body.addEventListener("click", () => NodeContextMenuController.broadcastHideEvent(this.$rootScope), true)
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
