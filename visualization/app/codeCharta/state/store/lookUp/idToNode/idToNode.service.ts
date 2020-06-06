import { StoreService } from "../../../store.service"
import { IRootScopeService } from "angular"
import {
	CodeMapPreRenderService,
	CodeMapPreRenderServiceSubscriber
} from "../../../../ui/codeMap/codeMap.preRender.service"
import { CodeMapNode } from "../../../../codeCharta.model"
import { hierarchy } from "d3"
import { setIdToNode } from "./idToNode.actions"

export class IdToNodeService implements CodeMapPreRenderServiceSubscriber {
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	public onRenderMapChanged(map: CodeMapNode) {
		const idToNode = new Map<number, CodeMapNode>()
		idToNode.set(map.id, map)
		hierarchy(map).each(x => {
			idToNode.set(x.data.id, x.data)
		})

		this.storeService.dispatch(setIdToNode(idToNode), true)
	}
}
