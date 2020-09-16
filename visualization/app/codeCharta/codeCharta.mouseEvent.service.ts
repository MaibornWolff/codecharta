import { StoreService } from "./state/store.service"
import { PanelSelection, SearchPanelMode } from "./codeCharta.model"
import { setPanelSelection } from "./state/store/appSettings/panelSelection/panelSelection.actions"
import { setSearchPanelMode } from "./state/store/appSettings/searchPanelMode/searchPanelMode.actions"

export class CodeChartaMouseEventService {
	constructor(private storeService: StoreService) {}

	// TODO: Do not use `Function` as type. See the eslint description for further
	// informations.
	// eslint-disable-next-line @typescript-eslint/ban-types
	closeComponentsExceptCurrent(currentCloseFunction?: Function) {
		if (currentCloseFunction !== this.closeRibbonBarSections) {
			this.closeRibbonBarSections()
		}

		if (currentCloseFunction !== this.closeSearchPanel) {
			this.closeSearchPanel()
		}
	}

	closeRibbonBarSections() {
		if (this.storeService.getState().appSettings.panelSelection !== PanelSelection.NONE) {
			this.storeService.dispatch(setPanelSelection(PanelSelection.NONE))
		}
	}

	closeSearchPanel() {
		if (this.storeService.getState().appSettings.searchPanelMode !== SearchPanelMode.minimized) {
			this.storeService.dispatch(setSearchPanelMode(SearchPanelMode.minimized))
		}
	}
}
