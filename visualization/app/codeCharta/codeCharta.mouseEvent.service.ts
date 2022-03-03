import { StoreService } from "./state/store.service"
import { PanelSelection } from "./codeCharta.model"
import { setPanelSelection } from "./state/store/appSettings/panelSelection/panelSelection.actions"

export class CodeChartaMouseEventService {
	constructor(private storeService: StoreService) {
		"ngInject"
	}

	// TODO: Do not use `Function` as type. See the eslint description for further
	// informations.
	// eslint-disable-next-line @typescript-eslint/ban-types
	closeComponentsExceptCurrent(currentCloseFunction?: Function) {
		if (currentCloseFunction !== this.closeRibbonBarSections) {
			this.closeRibbonBarSections()
		}
	}

	closeRibbonBarSections() {
		if (this.storeService.getState().appSettings.panelSelection !== PanelSelection.NONE) {
			this.storeService.dispatch(setPanelSelection(PanelSelection.NONE))
		}
	}
}
