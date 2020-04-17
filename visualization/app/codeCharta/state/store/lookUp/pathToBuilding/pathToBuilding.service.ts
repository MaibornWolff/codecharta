import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { PathToBuildingActions } from "./pathToBuilding.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"

export interface PathToBuildingSubscriber {
	onPathToBuildingChanged(pathToBuilding: Map<string, CodeMapBuilding>)
}

export class PathToBuildingService implements StoreSubscriber {
	private static PATH_TO_BUILDING_CHANGED_EVENT = "path-to-building-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, PathToBuildingActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().lookUp.pathToBuilding
	}

	private notify(newState: Map<string, CodeMapBuilding>) {
		this.$rootScope.$broadcast(PathToBuildingService.PATH_TO_BUILDING_CHANGED_EVENT, { pathToBuilding: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: PathToBuildingSubscriber) {
		$rootScope.$on(PathToBuildingService.PATH_TO_BUILDING_CHANGED_EVENT, (event, data) => {
			subscriber.onPathToBuildingChanged(data.pathToBuilding)
		})
	}
}
