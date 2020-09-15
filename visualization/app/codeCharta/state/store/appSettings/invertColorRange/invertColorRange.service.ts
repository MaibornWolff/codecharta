import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { InvertColorRangeActions } from "./invertColorRange.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface InvertColorRangeSubscriber {
	onInvertColorRangeChanged(invertColorRange: boolean)
}

export class InvertColorRangeService implements StoreSubscriber {
	private static INVERT_COLOR_RANGE_CHANGED_EVENT = "invert-color-range-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, InvertColorRangeActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.invertColorRange
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(InvertColorRangeService.INVERT_COLOR_RANGE_CHANGED_EVENT, {
			invertColorRange: newState
		})
	}

	static subscribe($rootScope: IRootScopeService, subscriber: InvertColorRangeSubscriber) {
		$rootScope.$on(InvertColorRangeService.INVERT_COLOR_RANGE_CHANGED_EVENT, (_event_, data) => {
			subscriber.onInvertColorRangeChanged(data.invertColorRange)
		})
	}
}
