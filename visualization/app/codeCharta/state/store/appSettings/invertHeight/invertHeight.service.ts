import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { InvertHeightActions } from "./invertHeight.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface InvertHeightSubscriber {
	onInvertHeightChanged(invertHeight: boolean)
}

export class InvertHeightService implements StoreSubscriber {
	private static INVERT_HEIGHT_CHANGED_EVENT = "invert-height-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, InvertHeightActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.invertHeight
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(InvertHeightService.INVERT_HEIGHT_CHANGED_EVENT, { invertHeight: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: InvertHeightSubscriber) {
		$rootScope.$on(InvertHeightService.INVERT_HEIGHT_CHANGED_EVENT, (event, data) => {
			subscriber.onInvertHeightChanged(data.invertHeight)
		})
	}
}
