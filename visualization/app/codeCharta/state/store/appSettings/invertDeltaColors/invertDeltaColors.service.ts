import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { InvertDeltaColorsActions } from "./invertDeltaColors.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface InvertDeltaColorsSubscriber {
	onInvertDeltaColorsChanged(invertDeltaColors: boolean)
}

export class InvertDeltaColorsService implements StoreSubscriber {
	private static INVERT_DELTA_COLORS_CHANGED_EVENT = "invert-delta-colors-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, InvertDeltaColorsActions)) {
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
