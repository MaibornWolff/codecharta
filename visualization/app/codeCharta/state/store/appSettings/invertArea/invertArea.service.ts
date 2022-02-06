import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { InvertAreaActions } from "./invertArea.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface InvertAreaSubscriber {
	onInvertAreaChanged(invertArea: boolean)
}

export class InvertAreaService implements StoreSubscriber {
	private static INVERT_AREA_CHANGED_EVENT = "invert-area-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, InvertAreaActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.invertArea
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(InvertAreaService.INVERT_AREA_CHANGED_EVENT, { invertArea: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: InvertAreaSubscriber) {
		$rootScope.$on(InvertAreaService.INVERT_AREA_CHANGED_EVENT, (_event_, data) => {
			subscriber.onInvertAreaChanged(data.invertArea)
		})
	}
}
