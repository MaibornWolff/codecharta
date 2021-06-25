import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { LayoutAlgorithmActions } from "./layoutAlgorithm.actions"
import { LayoutAlgorithm } from "../../../../codeCharta.model"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface LayoutAlgorithmSubscriber {
	onLayoutAlgorithmChanged(layoutAlgorithm: LayoutAlgorithm)
}

export class LayoutAlgorithmService implements StoreSubscriber {
	private static LAYOUT_ALGORITHM_CHANGED_EVENT = "layout-algorithm-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, LayoutAlgorithmActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.layoutAlgorithm
	}

	private notify(newState: LayoutAlgorithm) {
		this.$rootScope.$broadcast(LayoutAlgorithmService.LAYOUT_ALGORITHM_CHANGED_EVENT, { layoutAlgorithm: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: LayoutAlgorithmSubscriber) {
		$rootScope.$on(LayoutAlgorithmService.LAYOUT_ALGORITHM_CHANGED_EVENT, (_event, data) => {
			subscriber.onLayoutAlgorithmChanged(data.layoutAlgorithm)
		})
	}
}
