import { StoreService } from "../../../store.service"
import { IRootScopeService } from "angular"
import { setPathToNode } from "./pathToNode.actions"
import { CodeMapNode } from "../../../../codeCharta.model"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../../../../ui/codeMap/codeMap.preRender.service"
import { hierarchy } from "d3"

export class PathToNodeService implements CodeMapPreRenderServiceSubscriber {
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	public onRenderMapChanged(map: CodeMapNode) {
		const pathToNode = new Map<number, CodeMapNode>()
		pathToNode.set(map.id, map)
		hierarchy(map)
			.descendants()
			.forEach(x => {
				pathToNode.set(x.data.id, x.data)
			})

		this.storeService.dispatch(setPathToNode(pathToNode), true)
	}
}
