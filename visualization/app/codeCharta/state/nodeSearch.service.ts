import { CodeMapNode } from "../codeCharta.model"
import { IRootScopeService } from "angular"
import { getNodesByGitignorePath } from "../util/codeMapHelper"
import { CodeMapPreRenderService } from "../ui/codeMap/codeMap.preRender.service"
import { StoreService } from "./store.service"
import { setSearchedNodePaths } from "./store/dynamicSettings/searchedNodePaths/searchedNodePaths.actions"
import { SearchPatternService, SearchPatternSubscriber } from "./store/dynamicSettings/searchPattern/searchPattern.service"

export interface NodeSearchSubscriber {
	onNodeSearchComplete(searchedNodes: CodeMapNode[], searchPattern: string)
}

export class NodeSearchService implements SearchPatternSubscriber {
	private static NODE_SEARCH_COMPLETE_EVENT = "node-search-complete"

	private searchedNodes: CodeMapNode[] = []

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeMapPreRenderService: CodeMapPreRenderService
	) {
		"ngInject"
		SearchPatternService.subscribe(this.$rootScope, this)
	}

	onSearchPatternChanged(searchPattern: string) {
		this.searchedNodes = getNodesByGitignorePath(this.codeMapPreRenderService.getRenderMap(), searchPattern)
		this.notifyNodeSearchComplete(searchPattern)
		this.storeService.dispatch(setSearchedNodePaths(new Set(this.searchedNodes.map(x => x.path))))
	}

	private notifyNodeSearchComplete(searchPattern: string) {
		this.$rootScope.$broadcast(NodeSearchService.NODE_SEARCH_COMPLETE_EVENT, this.searchedNodes, searchPattern)
	}

	static subscribe($rootScope: IRootScopeService, subscriber: NodeSearchSubscriber) {
		$rootScope.$on(NodeSearchService.NODE_SEARCH_COMPLETE_EVENT, (_event_, searchedNodes, searchPattern) => {
			subscriber.onNodeSearchComplete(searchedNodes, searchPattern)
		})
	}
}
