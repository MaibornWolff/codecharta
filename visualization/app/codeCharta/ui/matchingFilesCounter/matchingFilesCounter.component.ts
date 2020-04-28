import "./matchingFilesCounter.component.scss"
import { BlacklistType, CodeMapNode } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { NodeSearchService, NodeSearchSubscriber } from "../../state/nodeSearch.service"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { StoreService } from "../../state/store.service"
import { Blacklist } from "../../model/blacklist"

export class MatchingFilesCounterController implements NodeSearchSubscriber, BlacklistSubscriber {
	private _viewModel: {
		fileCount: number
		flattenCount: number
		excludeCount: number
		searchPattern: string
	} = {
		fileCount: 0,
		flattenCount: 0,
		excludeCount: 0,
		searchPattern: ""
	}

	private searchedNodeLeaves: CodeMapNode[] = []

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		NodeSearchService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
	}

	public onNodeSearchComplete(searchedNodes: CodeMapNode[]) {
		this.searchedNodeLeaves = this.getSearchedNodeLeaves(searchedNodes)
		this.updateViewModel()
	}

	public onBlacklistChanged(blacklist: Blacklist) {
		this.updateViewModel()
	}

	private updateViewModel() {
		this._viewModel.fileCount = this.searchedNodeLeaves.length
		this._viewModel.flattenCount = this.getBlacklistedFileCount(BlacklistType.flatten)
		this._viewModel.excludeCount = this.getBlacklistedFileCount(BlacklistType.exclude)
	}

	private getSearchedNodeLeaves(searchedNodes: CodeMapNode[]): CodeMapNode[] {
		return searchedNodes.filter(node => !(node.children && node.children.length > 0))
	}

	private getBlacklistedFileCount(blacklistType: BlacklistType): number {
		return this.searchedNodeLeaves.filter(node =>
			this.storeService.getState().fileSettings.blacklist.isPathBlacklisted(node.path, blacklistType)
		).length
	}
}

export const matchingFilesCounterComponent = {
	selector: "matchingFilesCounterComponent",
	template: require("./matchingFilesCounter.component.html"),
	controller: MatchingFilesCounterController
}
