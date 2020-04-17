import { StoreService } from "../../../store.service"
import { IRootScopeService } from "angular"
import { setPathToBuilding } from "./pathToBuilding.actions"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"
import { CodeMapMeshChangedSubscriber, ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"
import { CodeMapMesh } from "../../../../ui/codeMap/rendering/codeMapMesh"

export class PathToBuildingService implements CodeMapMeshChangedSubscriber {
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		ThreeSceneService.subscribeToCodeMapMeshChangedEvent(this.$rootScope, this)
	}

	public onCodeMapMeshChanged(mapMesh: CodeMapMesh) {
		const map = new Map<string, CodeMapBuilding>()
		mapMesh.getMeshDescription().buildings.forEach(x => {
			map.set(x.node.path, x)
		})

		this.storeService.dispatch(setPathToBuilding(map), true)
	}
}
