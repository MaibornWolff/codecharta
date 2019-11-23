import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import _ from "lodash"
import { PresentationModeActions } from "./isPresentationMode.actions"

export interface IsPresentationModeSubscriber {
	onPresentationModeChanged(isPresentationMode: boolean)
}

export class IsPresentationModeService implements StoreSubscriber {
	private static PRESENTATION_MODE_CHANGED_EVENT = "presentation-mode-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(PresentationModeActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.isPresentationMode
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(IsPresentationModeService.PRESENTATION_MODE_CHANGED_EVENT, { isPresentationMode: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: IsPresentationModeSubscriber) {
		$rootScope.$on(IsPresentationModeService.PRESENTATION_MODE_CHANGED_EVENT, (event, data) => {
			subscriber.onPresentationModeChanged(data.isPresentationMode)
		})
	}
}
