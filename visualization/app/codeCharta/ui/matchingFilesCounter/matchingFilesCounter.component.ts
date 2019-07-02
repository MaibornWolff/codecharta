import "./matchingFilesCounter.component.scss"
import { BlacklistType, BlacklistItem, CodeMapNode, Settings, RecursivePartial } from "../../codeCharta.model";
import { SettingsServiceSubscriber, SettingsService } from "../../state/settings.service";
import { CodeMapHelper } from "../../util/codeMapHelper";
import * as d3 from "d3"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service";
import { IRootScopeService } from "angular";

export class MatchingFilesCounterController implements SettingsServiceSubscriber {

    private _viewModel: {
		fileCount: number
		hideCount: number
		excludeCount: number
		searchPattern: string
	} = {
		fileCount: 0,
		hideCount: 0,
		excludeCount: 0,
		searchPattern: ""
	}

	private searchedNodes: CodeMapNode[] = [] // TODO: geht das in die DynamicSettings oder service

	constructor(
		$rootScope: IRootScopeService,
		private codeMapPreRenderService: CodeMapPreRenderService
		) {
			SettingsService.subscribe($rootScope, this)
		}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: angular.IAngularEvent) {
		if(this.isSearchPatternUpdated(update)){
			this._viewModel.searchPattern = update.dynamicSettings.searchPattern
			this.searchedNodes = this.getSearchedNodes(update.dynamicSettings.searchPattern)
			const searchedNodeLeaves: CodeMapNode[] = this.getSearchedNodeLeaves()
			this.updateViewModel(searchedNodeLeaves, settings.fileSettings.blacklist)
		}	
	}

	private isSearchPatternUpdated(update: RecursivePartial<Settings>) {
		return update.dynamicSettings && update.dynamicSettings.searchPattern !== undefined
	}

	private getSearchedNodes(searchPattern: string): CodeMapNode[] {
		if (searchPattern.length == 0) {
			return []
		} else {
			const nodes = d3
				.hierarchy(this.codeMapPreRenderService.getRenderMap())
				.descendants()
				.map(d => d.data)
			return CodeMapHelper.getNodesByGitignorePath(nodes, this._viewModel.searchPattern)
		}
	}

	private updateViewModel(searchedNodeLeaves: CodeMapNode[], blacklist: BlacklistItem[]) {
		this._viewModel.fileCount = searchedNodeLeaves.length
		this._viewModel.hideCount = this.getBlacklistedFileCount(searchedNodeLeaves, blacklist, BlacklistType.hide)
		this._viewModel.excludeCount = this.getBlacklistedFileCount(searchedNodeLeaves, blacklist, BlacklistType.exclude)
	}

	private getSearchedNodeLeaves(): CodeMapNode[] {
		return this.searchedNodes.filter(node => !(node.children && node.children.length > 0))
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