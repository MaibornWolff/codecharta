import "./ribbonBar.component.scss"
import { IRootScopeService } from "angular"
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
	} = {
		panelSelection: PanelSelection.NONE
	}

	public onPanelSelectionChanged(panelSelection: PanelSelection) {
		this._viewModel.panelSelection = panelSelection
	}

	public toggle(panelSelection: PanelSelection) {
		if (this._viewModel.panelSelection !== panelSelection) {
			this.storeService.dispatch(setPanelSelection(panelSelection))
		} else {
			this.storeService.dispatch(setPanelSelection(PanelSelection.NONE))
		}
		this.codeChartaMouseEventService.closeComponentExcept(this.codeChartaMouseEventService.closeRibbonBarSections)
	}
}

export const ribbonBarComponent = {
	selector: "ribbonBarComponent",
	template: require("./ribbonBar.component.html"),
	controller: RibbonBarController
}
