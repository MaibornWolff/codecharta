import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { InvertDeltaColorsActions } from "./invertDeltaColors.actions"
import _ from "lodash"

export interface InvertDeltaColorsSubscriber {
	onInvertDeltaColorsChanged(invertDeltaColors: boolean)
}

export class InvertDeltaColorsService implements StoreSubscriber {
	private static INVERT_DELTA_COLORS_CHANGED_EVENT = "invert-delta-colors-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(InvertDeltaColorsActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.invertDeltaColors
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(InvertDeltaColorsService.INVERT_DELTA_COLORS_CHANGED_EVENT, { invertDeltaColors: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: InvertDeltaColorsSubscriber) {
		$rootScope.$on(InvertDeltaColorsService.INVERT_DELTA_COLORS_CHANGED_EVENT, (event, data) => {
			subscriber.onInvertDeltaColorsChanged(data.invertDeltaColors)
		})
	}
}
