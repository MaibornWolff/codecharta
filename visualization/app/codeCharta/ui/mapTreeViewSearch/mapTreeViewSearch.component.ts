import { SettingsService, SettingsServiceSubscriber } from "../../core/settings/settings.service"
import { ITimeoutService, IRootScopeService } from "angular"
import "./mapTreeViewSearch.component.scss"
import * as d3 from "d3"
import { CodeMapUtilService } from "../codeMap/codeMap.util.service"
import { CodeMapNode, BlacklistType, Settings, CCFile, RecursivePartial } from "../../codeCharta.model"
import { ImportedFilesChangedSubscriber, CodeChartaService } from "../../codeCharta.service"

export class MapTreeViewSearchController implements SettingsServiceSubscriber, ImportedFilesChangedSubscriber {
	private static TIMEOUT_DELAY_MS = 100

	public mapRoot: CodeMapNode = null

	public viewModel = {
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
		private $timeout: ITimeoutService,
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private codeChartaService: CodeChartaService
	) {
		SettingsService.subscribe(this.$rootScope, this)
		CodeChartaService.subscribe(this.$rootScope, this)
		this.updateMapRoot()
	}

	public onImportedFilesChanged(importedFiles: CCFile[], metrics: string[]) {
		this.viewModel.searchPattern = ""
	}

	public onSettingsChanged(s: Settings) {
		this.updateMapRoot()
		this.updateViewModel()
	}

	public onSearchChange() {
		this.setSearchedNodePathnames()
		this.updateViewModel()
	}

	public onClickBlacklistPattern(blacklistType: BlacklistType) {
		this.settingsService.updateSettings({
			dynamicSettings: {
				blacklist: [
					...this.settingsService.getSettings().dynamicSettings.blacklist,
					{ path: this.viewModel.searchPattern, type: blacklistType }
				]
			}
		})
		this.viewModel.searchPattern = ""
		this.onSearchChange()
	}

	private updateViewModel() {
		const blacklist = this.settingsService.getSettings().dynamicSettings.blacklist
		this.viewModel.isPatternExcluded = this.isPatternBlacklisted(BlacklistType.exclude)
		this.viewModel.isPatternHidden = this.isPatternBlacklisted(BlacklistType.hide)

		this.viewModel.fileCount = this.searchedFiles.length
		this.viewModel.hideCount = this.searchedFiles.filter(node =>
			CodeMapUtilService.isBlacklisted(node, blacklist, BlacklistType.hide)
		).length
		this.viewModel.excludeCount = this.searchedFiles.filter(node =>
			CodeMapUtilService.isBlacklisted(node, blacklist, BlacklistType.exclude)
		).length
	}

	private isPatternBlacklisted(blacklistType: BlacklistType) {
		return (
			this.settingsService.getSettings().dynamicSettings.blacklist.filter(item => {
				return this.viewModel.searchPattern == item.path && blacklistType == item.type
			}).length != 0
		)
	}

	private setSearchedNodePathnames() {
		const nodes = d3
			.hierarchy(this.codeChartaService.getRenderMap())
			.descendants()
			.map(d => d.data)
		const searchedNodes = CodeMapUtilService.getNodesByGitignorePath(nodes, this.viewModel.searchPattern)

		this.searchedFiles = searchedNodes.filter(node => !(node.children && node.children.length > 0))

		this.settingsService.updateSettings({
			dynamicSettings: {
				searchedNodePaths: searchedNodes.map(n => n.path),
				searchPattern: this.viewModel.searchPattern
			}
		})
	}

	private updateMapRoot(map: CodeMapNode = this.codeChartaService.getRenderMap()) {
		if (map) {
			this.$timeout(() => {
				this.mapRoot = map
			}, MapTreeViewSearchController.TIMEOUT_DELAY_MS)
		}
	}
}

export const mapTreeViewSearchComponent = {
	selector: "mapTreeViewSearchComponent",
	template: require("./mapTreeViewSearch.component.html"),
	controller: MapTreeViewSearchController
}
