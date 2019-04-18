import {SettingsService, SettingsServiceSubscriber} from "../../state/settings.service"
import {IRootScopeService} from "angular"
import "./mapTreeViewSearch.component.scss"
import {CodeMapHelper} from "../../util/codeMapHelper"
import {BlacklistType, CodeMapNode, FileState, RecursivePartial, Settings} from "../../codeCharta.model"
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service"
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service"
import {CodeMapRenderService} from "../codeMap/codeMap.render.service"
import * as d3 from "d3"

export class MapTreeViewSearchController implements SettingsServiceSubscriber, FileStateServiceSubscriber {
	private _viewModel: {
		searchPattern: string
		fileCount: number
		hideCount: number
		excludeCount: number
		isPatternExcluded: boolean
		isPatternHidden: boolean
	} = {
		searchPattern: "",
		fileCount: 0,
		hideCount: 0,
		excludeCount: 0,
		isPatternExcluded: true,
		isPatternHidden: true
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private codeMapActionsService: CodeMapActionsService,
		private codeMapRenderService: CodeMapRenderService
	) {
		SettingsService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this.resetSearchPattern()
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: angular.IAngularEvent) {
		let searchedNodeLeaves: CodeMapNode[]  = []
		if (update.dynamicSettings && update.dynamicSettings.searchPattern !== undefined) {
			let searchedNodes = (update.dynamicSettings.searchPattern.length == 0) ? [] : this.getSearchedNodeLeaves()
			searchedNodeLeaves = this.getOnlyNodeLeaves(searchedNodes)
			this.applySettingsSearchedNodePaths(searchedNodes)
		}
		this.updateViewModel(searchedNodeLeaves, settings)
	}

	public onSearchChange() {
		this.applySettingsSearchPattern()
	}

	public onClickBlacklistPattern(blacklistType: BlacklistType) {
		this.codeMapActionsService.pushItemToBlacklist({ path: this._viewModel.searchPattern, type: blacklistType })
		this.resetSearchPattern()
	}

	private resetSearchPattern() {
		this._viewModel.searchPattern = ""
		this.applySettingsSearchPattern()
	}

	private getSearchedNodeLeaves(): CodeMapNode[] {
		const nodes = d3.hierarchy(this.codeMapRenderService.getRenderFile().map).descendants().map(d => d.data)
		return CodeMapHelper.getNodesByGitignorePath(nodes, this._viewModel.searchPattern)
	}

	private updateViewModel(searchedNodeLeaves: CodeMapNode[], s: Settings) {
		this._viewModel.isPatternExcluded = this.isPatternBlacklisted(s, BlacklistType.exclude)
		this._viewModel.isPatternHidden = this.isPatternBlacklisted(s, BlacklistType.hide)

		this._viewModel.fileCount = searchedNodeLeaves.length
		this._viewModel.hideCount = this.getBlacklistedFileCount(searchedNodeLeaves, s, BlacklistType.hide)
		this._viewModel.excludeCount = this.getBlacklistedFileCount(searchedNodeLeaves, s, BlacklistType.exclude)
	}

	private getBlacklistedFileCount(searchedNodeLeaves: CodeMapNode[], s: Settings, blacklistType: BlacklistType): number {
		return searchedNodeLeaves.filter(node =>
			CodeMapHelper.isBlacklisted(node, s.fileSettings.blacklist, blacklistType)
		).length
	}

	private isPatternBlacklisted(s: Settings, blacklistType: BlacklistType): boolean {
		return !!s.fileSettings.blacklist.find(x =>
			this._viewModel.searchPattern == x.path && blacklistType == x.type
		)
	}

	private getOnlyNodeLeaves(nodes: CodeMapNode[]): CodeMapNode[] {
		return nodes.filter(node => !(node.children && node.children.length > 0))
	}

	private applySettingsSearchPattern() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				searchPattern: this._viewModel.searchPattern
			}
		})
	}

	private applySettingsSearchedNodePaths(searchedNodes: CodeMapNode[]) {
		this.settingsService.updateSettings({
			dynamicSettings: {
				searchedNodePaths: (searchedNodes.length == 0) ? [] : searchedNodes.map(x => x.path)
			}
		})
	}
}

export const mapTreeViewSearchComponent = {
	selector: "mapTreeViewSearchComponent",
	template: require("./mapTreeViewSearch.component.html"),
	controller: MapTreeViewSearchController
}
