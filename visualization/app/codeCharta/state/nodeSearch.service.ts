import { CodeMapNode } from "../codeCharta.model"
import { IRootScopeService } from "angular"
import { CodeMapHelper } from "../util/codeMapHelper"
import { CodeMapPreRenderService } from "../ui/codeMap/codeMap.preRender.service"
import { StoreService } from "./store.service"
import { setSearchedNodePaths } from "./store/dynamicSettings/searchedNodePaths/searchedNodePaths.actions"
import { SearchPatternService, SearchPatternSubscriber } from "./store/dynamicSettings/searchPattern/searchPattern.service"

export interface NodeSearchSubscriber {
	onNodeSearchComplete(searchedNodes: CodeMapNode[])
}

export class NodeSearchService implements SearchPatternSubscriber {
	private static NODE_SEARCH_COMPLETE_EVENT = "node-search-complete"

	private searchedNodes: CodeMapNode[] = []

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeMapPreRenderService: CodeMapPreRenderService
	) {
		SearchPatternService.subscribe(this.$rootScope, this)
	}

	onSearchPatternChanged(searchPattern: string) {
		this.searchedNodes = CodeMapHelper.getNodesByGitignorePath(this.codeMapPreRenderService.getRenderMap(), searchPattern)
		this.notifyNodeSearchComplete()
		this.applySettingsSearchedNodePaths()
	}

	private applySettingsSearchedNodePaths() {
		const newSearchedNodePaths = this.searchedNodes.map(x => x.path)
		this.storeService.dispatch(setSearchedNodePaths(new Set(newSearchedNodePaths)))
	}

	private notifyNodeSearchComplete() {
		this.$rootScope.$broadcast(NodeSearchService.NODE_SEARCH_COMPLETE_EVENT, this.searchedNodes)
	}

	static subscribe($rootScope: IRootScopeService, subscriber: NodeSearchSubscriber) {
		$rootScope.$on(NodeSearchService.NODE_SEARCH_COMPLETE_EVENT, (_event_, data) => {
			subscriber.onNodeSearchComplete(data)
		})
	}
}
