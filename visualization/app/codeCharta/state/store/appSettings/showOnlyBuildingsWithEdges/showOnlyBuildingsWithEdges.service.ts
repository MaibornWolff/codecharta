import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ShowOnlyBuildingsWithEdgesActions } from "./showOnlyBuildingsWithEdges.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface ShowOnlyBuildingsWithEdgesSubscriber {
	onShowOnlyBuildingsWithEdgesChanged(showOnlyBuildingsWithEdges: boolean)
}

export class ShowOnlyBuildingsWithEdgesService implements StoreSubscriber {
	private static SHOW_ONLY_BUILDINGS_WITH_EDGES_CHANGED_EVENT = "show-only-buildings-with-edges-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ShowOnlyBuildingsWithEdgesActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.showOnlyBuildingsWithEdges
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(ShowOnlyBuildingsWithEdgesService.SHOW_ONLY_BUILDINGS_WITH_EDGES_CHANGED_EVENT, {
			showOnlyBuildingsWithEdges: newState
		})
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: ShowOnlyBuildingsWithEdgesSubscriber) {
		$rootScope.$on(ShowOnlyBuildingsWithEdgesService.SHOW_ONLY_BUILDINGS_WITH_EDGES_CHANGED_EVENT, (_event_, data) => {
			subscriber.onShowOnlyBuildingsWithEdgesChanged(data.showOnlyBuildingsWithEdges)
		})
	}
}
