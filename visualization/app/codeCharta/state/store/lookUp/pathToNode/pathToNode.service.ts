import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { PathToNodeActions, setPathToNode } from "./pathToNode.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { CodeMapNode } from "../../../../codeCharta.model"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../../../../ui/codeMap/codeMap.preRender.service"
import { hierarchy } from "d3"

export interface PathToNodeSubscriber {
	onPathToNodeChanged(pathToNode: Map<string, CodeMapNode>)
}

export class PathToNodeService implements StoreSubscriber, CodeMapPreRenderServiceSubscriber {
	private static PATH_TO_NODE_CHANGED_EVENT = "path-to-node-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, PathToNodeActions)) {
			this.notify(this.select())
		}
	}

	public onRenderMapChanged(map: CodeMapNode) {
		const pathToNode = new Map<string, CodeMapNode>()
		pathToNode.set(map.path, map)
		hierarchy(map)
			.leaves()
			.forEach(x => {
				pathToNode.set(x.data.path, x.data)
			})

		this.storeService.dispatch(setPathToNode(pathToNode))
	}

	private select() {
		return this.storeService.getState().lookUp.pathToNode
	}

	private notify(newState: Map<string, CodeMapNode>) {
		this.$rootScope.$broadcast(PathToNodeService.PATH_TO_NODE_CHANGED_EVENT, { pathToNode: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: PathToNodeSubscriber) {
		$rootScope.$on(PathToNodeService.PATH_TO_NODE_CHANGED_EVENT, (event, data) => {
			subscriber.onPathToNodeChanged(data.pathToNode)
		})
	}
}
