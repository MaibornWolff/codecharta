import { StoreService } from "../../../store.service"
import { IRootScopeService } from "angular"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"
import { CodeMapMeshChangedSubscriber, ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"
import { CodeMapMesh } from "../../../../ui/codeMap/rendering/codeMapMesh"
import { setIdToBuilding } from "./idToBuilding.actions"

export class IdToBuildingService implements CodeMapMeshChangedSubscriber {
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		ThreeSceneService.subscribeToCodeMapMeshChangedEvent(this.$rootScope, this)
	}

	onCodeMapMeshChanged(mapMesh: CodeMapMesh) {
		const idToBuilding: Map<number, CodeMapBuilding> = new Map()

		for (const building of mapMesh.getMeshDescription().buildings) {
			idToBuilding.set(building.node.id, building)
		}

		this.storeService.dispatch(setIdToBuilding(idToBuilding), { silent: true })
	}
}
