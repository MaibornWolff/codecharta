import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { AmountOfTopLabelsActions } from "./amountOfTopLabels.actions"
import { isActionOfType } from "../../../../util/actionHelper"

export interface AmountOfTopLabelsSubscriber {
	onAmountOfTopLabelsChanged(amountOfTopLabels: number)
}

export class AmountOfTopLabelsService implements StoreSubscriber {
	private static AMOUNT_OF_TOP_LABELS_CHANGED_EVENT = "amount-of-top-labels-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, AmountOfTopLabelsActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.amountOfTopLabels
	}

	private notify(newState: number) {
		this.$rootScope.$broadcast(AmountOfTopLabelsService.AMOUNT_OF_TOP_LABELS_CHANGED_EVENT, { amountOfTopLabels: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: AmountOfTopLabelsSubscriber) {
		$rootScope.$on(AmountOfTopLabelsService.AMOUNT_OF_TOP_LABELS_CHANGED_EVENT, (event, data) => {
			subscriber.onAmountOfTopLabelsChanged(data.amountOfTopLabels)
		})
	}
}
