import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { PathToBuildingActions, setPathToBuilding } from "./pathToBuilding.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"
import { CodeMapMeshChangedSubscriber, ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"
import { CodeMapMesh } from "../../../../ui/codeMap/rendering/codeMapMesh"

export interface PathToBuildingSubscriber {
	onPathToBuildingChanged(pathToBuilding: Map<string, CodeMapBuilding>)
}

export class PathToBuildingService implements StoreSubscriber, CodeMapMeshChangedSubscriber {
	private static PATH_TO_BUILDING_CHANGED_EVENT = "path-to-building-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		ThreeSceneService.subscribeToCodeMapMeshChangedEvent(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, PathToBuildingActions)) {
			this.notify(this.select())
		}
	}

	public onCodeMapMeshChanged(mapMesh: CodeMapMesh) {
		const map = new Map<string, CodeMapBuilding>()
		mapMesh.getMeshDescription().buildings.forEach(x => {
			map.set(x.node.path, x)
		})

		this.storeService.dispatch(setPathToBuilding(map))
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
