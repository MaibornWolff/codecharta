import { StoreService } from "./state/store.service"
import { PanelSelection, SearchPanelMode } from "./codeCharta.model"
import { setPanelSelection } from "./state/store/appSettings/panelSelection/panelSelection.actions"
import { setSearchPanelMode } from "./state/store/appSettings/searchPanelMode/searchPanelMode.actions"

export class CodeChartaMouseEventService {
	constructor(private storeService: StoreService) {}

	public closeComponentExcept(fun?: Function) {
		const functions: Function[] = [this.closeRibbonBarSections, this.closeSearchPanel]

		functions
			.filter(x => x !== fun)
			.forEach(fn => {
				fn.call(this)
			})
	}

	public closeRibbonBarSections() {
		if (this.storeService.getState().appSettings.panelSelection !== PanelSelection.NONE) {
			this.storeService.dispatch(setPanelSelection(PanelSelection.NONE))
		}
	}

	public closeSearchPanel() {
		if (this.storeService.getState().appSettings.searchPanelMode !== SearchPanelMode.minimized) {
			this.storeService.dispatch(setSearchPanelMode(SearchPanelMode.minimized))
		}
	}
}
