import { SettingsService, SettingsServiceSubscriber } from "../../core/settings/settings.service"
import { ITimeoutService, IRootScopeService } from "angular"
import "./mapTreeViewSearch.component.scss"
import * as d3 from "d3"
import { CodeMapUtilService } from "../codeMap/codeMap.util.service"
import { CodeMapNode, BlacklistType, Settings, CCFile } from "../../codeCharta.model"
import { ImportedFilesChangedSubscriber, CodeChartaService } from "../../codeCharta.service"

export class MapTreeViewSearchController implements SettingsServiceSubscriber, ImportedFilesChangedSubscriber {
	private _viewModel = {
		searchPattern: "",
		fileCount: 0,
		hideCount: 0,
		excludeCount: 0,
		isPatternExcluded: true,
		isPatternHidden: true
	}

	private searchedFiles: CodeMapNode[] = []

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private codeChartaService: CodeChartaService
	) {
		SettingsService.subscribe(this.$rootScope, this)
		CodeChartaService.subscribe(this.$rootScope, this)
	}

	public onImportedFilesChanged(importedFiles: CCFile[], metrics: string[]) {
		this._viewModel.searchPattern = ""
	}

	public onSettingsChanged(s: Settings) {
		this.updateViewModel()
	}

	public onSearchChange() {
		this.setSearchedNodePathnames()
		this.updateViewModel()
	}

	public onClickBlacklistPattern(blacklistType: BlacklistType) {
		this.settingsService.updateSettings({
			fileSettings: {
				blacklist: [
					...this.settingsService.getSettings().fileSettings.blacklist,
					{ path: this._viewModel.searchPattern, type: blacklistType }
				]
			}
		})
		this._viewModel.searchPattern = ""
		this.onSearchChange()
	}

	private updateViewModel() {
		const blacklist = this.settingsService.getSettings().fileSettings.blacklist
		this._viewModel.isPatternExcluded = this.isPatternBlacklisted(BlacklistType.exclude)
		this._viewModel.isPatternHidden = this.isPatternBlacklisted(BlacklistType.hide)

		this._viewModel.fileCount = this.searchedFiles.length
		this._viewModel.hideCount = this.searchedFiles.filter(node =>
			CodeMapUtilService.isBlacklisted(node, blacklist, BlacklistType.hide)
		).length
		this._viewModel.excludeCount = this.searchedFiles.filter(node =>
			CodeMapUtilService.isBlacklisted(node, blacklist, BlacklistType.exclude)
		).length
	}

	private isPatternBlacklisted(blacklistType: BlacklistType) {
		return (
			this.settingsService.getSettings().fileSettings.blacklist.filter(item => {
				return this._viewModel.searchPattern == item.path && blacklistType == item.type
			}).length != 0
		)
	}

	private setSearchedNodePathnames() {
		const nodes = d3
			.hierarchy(this.codeChartaService.getRenderMap())
			.descendants()
			.map(d => d.data)
		const searchedNodes = CodeMapUtilService.getNodesByGitignorePath(nodes, this._viewModel.searchPattern)

		this.searchedFiles = searchedNodes.filter(node => !(node.children && node.children.length > 0))

		this.settingsService.updateSettings({
			dynamicSettings: {
				searchedNodePaths: searchedNodes.map(n => n.path),
				searchPattern: this._viewModel.searchPattern
			}
		})
	}
}

export const mapTreeViewSearchComponent = {
	selector: "mapTreeViewSearchComponent",
	template: require("./mapTreeViewSearch.component.html"),
	controller: MapTreeViewSearchController
}
