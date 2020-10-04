import { StoreService } from "../../../store.service"
import { IRootScopeService } from "angular"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../../../../ui/codeMap/codeMap.preRender.service"
import { CodeMapNode } from "../../../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { setIdToNode } from "./idToNode.actions"

export class IdToNodeService implements CodeMapPreRenderServiceSubscriber {
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	onRenderMapChanged(map: CodeMapNode) {
		const idToNode: Map<number, CodeMapNode> = new Map([[map.id, map]])
		hierarchy(map).each(({ data }) => idToNode.set(data.id, data))

		this.storeService.dispatch(setIdToNode(idToNode), { silent: true })
	}
}
