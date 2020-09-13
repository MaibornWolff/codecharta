import { CodeMapNode } from "../codeCharta.model"
import { IRootScopeService } from "angular"
import { CodeMapHelper } from "../util/codeMapHelper"
import { CodeMapPreRenderService } from "../ui/codeMap/codeMap.preRender.service"
import { StoreService } from "./store.service"
import { setSearchedNodePaths } from "./store/dynamicSettings/searchedNodePaths/searchedNodePaths.actions"
import { SearchPatternService, SearchPatternSubscriber } from "./store/dynamicSettings/searchPattern/searchPattern.service"
import { hierarchy } from "d3-hierarchy"

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

	public onSearchPatternChanged(searchPattern: string) {
		this.searchedNodes = this.findSearchedNodes(searchPattern)
		this.notifyNodeSearchComplete()
		this.applySettingsSearchedNodePaths()
	}

	private findSearchedNodes(searchPattern: string) {
		if (searchPattern.length === 0) {
			return []
		}
		const nodes = hierarchy(this.codeMapPreRenderService.getRenderMap())
			.descendants()
			.map(d => d.data)
		return CodeMapHelper.getNodesByGitignorePath(nodes, searchPattern)
	}

	private applySettingsSearchedNodePaths() {
		const newSearchedNodePaths = this.searchedNodes.map(x => x.path)
		this.storeService.dispatch(setSearchedNodePaths(new Set(newSearchedNodePaths)))
	}

	private notifyNodeSearchComplete() {
		this.$rootScope.$broadcast(NodeSearchService.NODE_SEARCH_COMPLETE_EVENT, this.searchedNodes)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: NodeSearchSubscriber) {
		$rootScope.$on(NodeSearchService.NODE_SEARCH_COMPLETE_EVENT, (_event_, data) => {
			subscriber.onNodeSearchComplete(data)
		})
	}
}
