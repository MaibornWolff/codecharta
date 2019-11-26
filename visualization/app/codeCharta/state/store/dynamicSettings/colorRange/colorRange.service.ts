import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ColorRangeActions } from "./colorRange.actions"
import _ from "lodash"
import { ColorRange } from "../../../../codeCharta.model"

export interface ColorRangeSubscriber {
	onColorRangeChanged(colorRange: ColorRange)
}

export class ColorRangeService implements StoreSubscriber {
	private static COLOR_RANGE_CHANGED_EVENT = "color-range-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(ColorRangeActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.colorRange
	}

	private notify(newState: ColorRange) {
		this.$rootScope.$broadcast(ColorRangeService.COLOR_RANGE_CHANGED_EVENT, { colorRange: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: ColorRangeSubscriber) {
		$rootScope.$on(ColorRangeService.COLOR_RANGE_CHANGED_EVENT, (event, data) => {
			subscriber.onColorRangeChanged(data.colorRange)
		})
	}
}
