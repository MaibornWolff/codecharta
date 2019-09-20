import { CodeMapNode } from "../codeCharta.model"
import { IRootScopeService } from "angular"
import * as d3 from "d3"
import { CodeMapHelper } from "../util/codeMapHelper"
import { CodeMapPreRenderService } from "../ui/codeMap/codeMap.preRender.service"
import { SettingsService } from "./settingsService/settings.service"
import { SearchPatternSubscriber } from "./settingsService/settings.service.events"

export interface NodeSearchSubscriber {
	onNodeSearchComplete(searchedNodes: CodeMapNode[])
}

export class NodeSearchService implements SearchPatternSubscriber {
	private static NODE_SEARCH_COMPLETE_EVENT = "node-search-complete"

	private searchedNodes: CodeMapNode[] = []

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private codeMapPreRenderService: CodeMapPreRenderService,
		private settingsService: SettingsService
	) {
		SettingsService.subscribeToSearchPattern($rootScope, this)
	}

	public onSearchPatternChanged(searchPattern: string) {
		this.searchedNodes = this.findSearchedNodes(searchPattern)
		this.notifyNodeSearchComplete()
		this.applySettingsSearchedNodePaths()
	}

	private findSearchedNodes(searchPattern: string): CodeMapNode[] {
		if (searchPattern.length == 0) {
			return []
		} else {
			const nodes = d3
				.hierarchy(this.codeMapPreRenderService.getRenderMap())
				.descendants()
				.map(d => d.data)
			return CodeMapHelper.getNodesByGitignorePath(nodes, searchPattern)
		}
	}

	private applySettingsSearchedNodePaths() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				searchedNodePaths: this.searchedNodes.length == 0 ? [] : this.searchedNodes.map(x => x.path)
			}
		})
	}

	private notifyNodeSearchComplete() {
		this.$rootScope.$broadcast(NodeSearchService.NODE_SEARCH_COMPLETE_EVENT, this.searchedNodes)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: NodeSearchSubscriber) {
		$rootScope.$on(NodeSearchService.NODE_SEARCH_COMPLETE_EVENT, (event, data) => {
			subscriber.onNodeSearchComplete(data)
		})
	}
}
