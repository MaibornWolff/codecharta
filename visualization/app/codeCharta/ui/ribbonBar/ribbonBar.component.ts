import "./ribbonBar.component.scss"
import { IRootScopeService } from "angular"
import $ from "jquery"
import { StoreService } from "../../state/store.service"
import { PanelSelection } from "../../codeCharta.model"
import { setPanelSelection } from "../../state/store/appSettings/panelSelection/panelSelection.actions"
import { PanelSelectionService, PanelSelectionSubscriber } from "../../state/store/appSettings/panelSelection/panelSelection.service"
import { CodeChartaMouseEventService } from "../../codeCharta.mouseEvent.service"

export class RibbonBarController implements PanelSelectionSubscriber {
	constructor(
		private storeService: StoreService,
		private $rootScope: IRootScopeService,
		private codeChartaMouseEventService: CodeChartaMouseEventService
	) {
		PanelSelectionService.subscribe(this.$rootScope, this)
	}

	private _viewModel: {
		panelSelection: PanelSelection
		panelSelectionValues: typeof PanelSelection
	} = {
		panelSelection: PanelSelection.NONE,
		panelSelectionValues: PanelSelection
	}

	public onPanelSelectionChanged(panelSelection: PanelSelection) {
		this._viewModel.panelSelection = panelSelection
	}

	public toggle(panelSelection: PanelSelection) {
		$(document.activeElement).blur()

		const newSelection = this._viewModel.panelSelection !== panelSelection ? panelSelection : PanelSelection.NONE
		this.storeService.dispatch(setPanelSelection(newSelection))

		this.codeChartaMouseEventService.closeComponentsExceptCurrent(this.codeChartaMouseEventService.closeRibbonBarSections)
	}
}

export const ribbonBarComponent = {
	selector: "ribbonBarComponent",
	template: require("./ribbonBar.component.html"),
	controller: RibbonBarController
}
