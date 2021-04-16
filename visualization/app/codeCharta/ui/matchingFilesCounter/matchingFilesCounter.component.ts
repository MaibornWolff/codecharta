import "./matchingFilesCounter.component.scss"
import { BlacklistType, CodeMapNode } from "../../codeCharta.model"
import {getAllNodes, isLeaf, isPathBlacklisted} from "../../util/codeMapHelper"
import { IRootScopeService } from "angular"
import { NodeSearchService, NodeSearchSubscriber } from "../../state/nodeSearch.service"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { StoreService } from "../../state/store.service"
import {CodeMapPreRenderService} from "../codeMap/codeMap.preRender.service";

export class MatchingFilesCounterController implements NodeSearchSubscriber, BlacklistSubscriber {
	private _viewModel: {
		fileCount: string
		flattenCount: string
		excludeCount: string
		searchPattern: string
	} = {
		fileCount: "",
		flattenCount: "",
		excludeCount: "",
		searchPattern: ""
	}

	private searchedNodeLeaves: CodeMapNode[] = []
	private allNodes: CodeMapNode[] = []

	constructor(private $rootScope: IRootScopeService,
				private storeService: StoreService,
				private codeMapPreRenderService: CodeMapPreRenderService
	) {
		NodeSearchService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
	}

	onNodeSearchComplete(searchedNodes: CodeMapNode[], searchPattern: string) {
		this.searchedNodeLeaves = searchedNodes.filter(node => isLeaf(node))
		this.allNodes = getAllNodes(this.codeMapPreRenderService.getRenderMap());
		this._viewModel.searchPattern = searchPattern
		this.updateViewModel()
	}

	onBlacklistChanged() {
		this.updateViewModel()
	}

	private updateViewModel() {
		if(this._viewModel.searchPattern.length === 0) {
			this._viewModel.fileCount = `${this.allNodes.length}`
			this._viewModel.flattenCount = `${this.getBlacklistedFileCount(BlacklistType.flatten, this.allNodes)}`
			this._viewModel.excludeCount = `${this.getBlacklistedFileCount(BlacklistType.exclude, this.allNodes)}`
		}
		this._viewModel.fileCount = `${this.searchedNodeLeaves.length  }/${  this.allNodes.length}`
		this._viewModel.flattenCount = `${this.getBlacklistedFileCount(BlacklistType.flatten, this.searchedNodeLeaves)  }/${  this.getBlacklistedFileCount(BlacklistType.flatten, this.allNodes)}`
		this._viewModel.excludeCount = `${this.getBlacklistedFileCount(BlacklistType.exclude, this.searchedNodeLeaves)  }/${  this.getBlacklistedFileCount(BlacklistType.exclude, this.allNodes)}`
	}

	private getBlacklistedFileCount(blacklistType: BlacklistType, nodes: CodeMapNode[]) {
		const blacklist = this.storeService.getState().fileSettings.blacklist
		return nodes.reduce((count, { path }) => {
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
