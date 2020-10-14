import "./matchingFilesCounter.component.scss"
import { BlacklistType, CodeMapNode } from "../../codeCharta.model"
import { isLeaf, isPathBlacklisted } from "../../util/codeMapHelper"
import { IRootScopeService } from "angular"
import { NodeSearchService, NodeSearchSubscriber } from "../../state/nodeSearch.service"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { StoreService } from "../../state/store.service"

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

	onNodeSearchComplete(searchedNodes: CodeMapNode[]) {
		this.searchedNodeLeaves = searchedNodes.filter(node => isLeaf(node))
		this.updateViewModel()
	}

	onBlacklistChanged() {
		this.updateViewModel()
	}

	private updateViewModel() {
		this._viewModel.fileCount = this.searchedNodeLeaves.length
		this._viewModel.flattenCount = this.getBlacklistedFileCount(BlacklistType.flatten)
		this._viewModel.excludeCount = this.getBlacklistedFileCount(BlacklistType.exclude)
	}

	private getBlacklistedFileCount(blacklistType: BlacklistType) {
		const blacklist = this.storeService.getState().fileSettings.blacklist
		return this.searchedNodeLeaves.reduce((count, { path }) => {
			if (isPathBlacklisted(path, blacklist, blacklistType)) {
				count++
			}
			return count
		}, 0)
	}
}

export const matchingFilesCounterComponent = {
	selector: "matchingFilesCounterComponent",
	template: require("./matchingFilesCounter.component.html"),
	controller: MatchingFilesCounterController
}
