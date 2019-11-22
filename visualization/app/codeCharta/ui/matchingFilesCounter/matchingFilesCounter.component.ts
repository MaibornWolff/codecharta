import "./matchingFilesCounter.component.scss"
import { BlacklistType, BlacklistItem, CodeMapNode } from "../../codeCharta.model"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { IRootScopeService } from "angular"
import { NodeSearchService, NodeSearchSubscriber } from "../../state/nodeSearch.service"
import { BlacklistSubscriber } from "../../state/settingsService/settings.service.events"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"

export class MatchingFilesCounterController implements NodeSearchSubscriber, BlacklistSubscriber {
	private _viewModel: {
		fileCount: number
		hideCount: number
		excludeCount: number
		searchPattern: string
		blacklist: BlacklistItem[]
	} = {
		fileCount: 0,
		hideCount: 0,
		excludeCount: 0,
		searchPattern: "",
		blacklist: []
	}

	private searchedNodeLeaves: CodeMapNode[] = []

	constructor($rootScope: IRootScopeService) {
		NodeSearchService.subscribe($rootScope, this)
		BlacklistService.subscribeToBlacklist($rootScope, this)
	}

	public onNodeSearchComplete(searchedNodes: CodeMapNode[]) {
		this.searchedNodeLeaves = this.getSearchedNodeLeaves(searchedNodes)
		this.updateViewModel(this.searchedNodeLeaves, this._viewModel.blacklist)
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this._viewModel.blacklist = blacklist
		this.updateViewModel(this.searchedNodeLeaves, this._viewModel.blacklist)
	}

	private updateViewModel(searchedNodeLeaves: CodeMapNode[], blacklist: BlacklistItem[]) {
		this._viewModel.fileCount = searchedNodeLeaves.length
		this._viewModel.hideCount = this.getBlacklistedFileCount(searchedNodeLeaves, blacklist, BlacklistType.hide)
		this._viewModel.excludeCount = this.getBlacklistedFileCount(searchedNodeLeaves, blacklist, BlacklistType.exclude)
	}

	private getSearchedNodeLeaves(searchedNodes: CodeMapNode[]): CodeMapNode[] {
		return searchedNodes.filter(node => !(node.children && node.children.length > 0))
	}

	private getBlacklistedFileCount(searchedNodeLeaves: CodeMapNode[], blacklist: BlacklistItem[], blacklistType: BlacklistType): number {
		return searchedNodeLeaves.filter(node => CodeMapHelper.isBlacklisted(node, blacklist, blacklistType)).length
	}
}

export const matchingFilesCounterComponent = {
	selector: "matchingFilesCounterComponent",
	template: require("./matchingFilesCounter.component.html"),
	controller: MatchingFilesCounterController
}
