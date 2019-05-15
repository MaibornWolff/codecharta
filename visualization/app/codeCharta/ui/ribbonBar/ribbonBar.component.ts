import "./ribbonBar.component.scss"
import $ from "jquery"
import { IRootScopeService } from "angular"
import { FileState } from "../../codeCharta.model"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { FileStateHelper } from "../../util/fileStateHelper"
import { FileDownloader } from "../../util/fileDownloader"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"

export class RibbonBarController implements FileStateServiceSubscriber {
	private collapsingElements = $(
		"code-map-component #codeMap, ribbon-bar-component #header, ribbon-bar-component .section-body, #toggle-ribbon-bar-fab"
	)
	private toggleElements = $("ribbon-bar-component .section-title")
	private isExpanded: boolean = false

	private _viewModel: {
		isDeltaState: boolean
	} = {
		isDeltaState: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private codeMapPreRenderService: CodeMapPreRenderService) {
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {}

	public downloadFile() {
		FileDownloader.downloadCurrentMap(this.codeMapPreRenderService.getRenderFile())
	}

	public toggle() {
		if (!this.isExpanded) {
			this.expand()
		} else {
			this.collapse()
		}
	}

	public expand() {
		this.isExpanded = true
		this.collapsingElements.addClass("expanded")
	}

	public collapse() {
		this.isExpanded = false
		this.collapsingElements.removeClass("expanded")
	}

	public hoverToggle() {
		this.toggleElements.addClass("toggle-hovered")
	}

	public unhoverToggle() {
		this.toggleElements.removeClass("toggle-hovered")
	}
}

export const ribbonBarComponent = {
	selector: "ribbonBarComponent",
	template: require("./ribbonBar.component.html"),
	controller: RibbonBarController
}
