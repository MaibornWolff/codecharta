import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { InvertColorRangeActions } from "./invertColorRange.actions"
import _ from "lodash"

export interface InvertColorRangeSubscriber {
	onInvertColorRangeChanged(invertColorRange: boolean)
}

export class InvertColorRangeService implements StoreSubscriber {
	private static INVERT_COLOR_RANGE_CHANGED_EVENT = "invert-color-range-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(InvertColorRangeActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.invertColorRange
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(InvertColorRangeService.INVERT_COLOR_RANGE_CHANGED_EVENT, { invertColorRange: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: InvertColorRangeSubscriber) {
		$rootScope.$on(InvertColorRangeService.INVERT_COLOR_RANGE_CHANGED_EVENT, (event, data) => {
			subscriber.onInvertColorRangeChanged(data.invertColorRange)
		})
	}
}
