import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { PresentationModeActions } from "./isPresentationMode.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface IsPresentationModeSubscriber {
	onPresentationModeChanged(isPresentationMode: boolean)
}

export class IsPresentationModeService implements StoreSubscriber {
	private static PRESENTATION_MODE_CHANGED_EVENT = "presentation-mode-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, PresentationModeActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.isPresentationMode
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(IsPresentationModeService.PRESENTATION_MODE_CHANGED_EVENT, {
			isPresentationMode: newState
		})
	}

	static subscribe($rootScope: IRootScopeService, subscriber: IsPresentationModeSubscriber) {
		$rootScope.$on(IsPresentationModeService.PRESENTATION_MODE_CHANGED_EVENT, (_event_, data) => {
			subscriber.onPresentationModeChanged(data.isPresentationMode)
		})
	}
}
