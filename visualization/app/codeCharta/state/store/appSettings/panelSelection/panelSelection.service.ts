import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { PanelSelectionActions } from "./panelSelection.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { PanelSelection } from "../../../../codeCharta.model"

export interface PanelSelectionSubscriber {
	onPanelSelectionChanged(panelSelection: PanelSelection)
}

export class PanelSelectionService implements StoreSubscriber {
	private static PANEL_SELECTION_CHANGED_EVENT = "panel-selection-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, PanelSelectionActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.panelSelection
	}

	private notify(newState: PanelSelection) {
		this.$rootScope.$broadcast(PanelSelectionService.PANEL_SELECTION_CHANGED_EVENT, { panelSelection: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: PanelSelectionSubscriber) {
		$rootScope.$on(PanelSelectionService.PANEL_SELECTION_CHANGED_EVENT, (event, data) => {
			subscriber.onPanelSelectionChanged(data.panelSelection)
		})
	}
}
