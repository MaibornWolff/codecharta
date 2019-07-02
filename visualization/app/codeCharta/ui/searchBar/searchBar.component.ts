import "./searchBar.component.scss"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service";
import { BlacklistType, CodeMapNode, BlacklistItem, Settings, RecursivePartial, FileState } from "../../codeCharta.model";
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service";
import { IRootScopeService, IAngularEvent } from "angular";
import * as d3 from "d3"
import { CodeMapHelper } from "../../util/codeMapHelper";
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service";
import { NodeSearchService, NodeSearchSubscriber } from "../../state/nodeSearch.service";

export class SearchBarController implements SettingsServiceSubscriber, NodeSearchSubscriber{

    private _viewModel: {
		searchPattern: string
		isPatternHidden: boolean
		isPatternExcluded: boolean
	} = {
		searchPattern: "",
		isPatternHidden: true,
		isPatternExcluded: true
	}

	private searchedNodes: CodeMapNode[] = []

    /* @ngInject */
    constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private codeMapActionsService: CodeMapActionsService) {
			SettingsService.subscribe(this.$rootScope, this)
			NodeSearchService.subscribe(this.$rootScope, this)

    }

    public applySettingsSearchPattern() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				searchPattern: this._viewModel.searchPattern
			}
		})
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this.resetSearchPattern()
	}

	public onNodeSearchComplete(searchedNodes: CodeMapNode[], event: IAngularEvent) {
		this.searchedNodes = searchedNodes
	}
	
	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: angular.IAngularEvent) {
		this.updateViewModel(settings.fileSettings.blacklist)
	}
    
    public onClickBlacklistPattern(blacklistType: BlacklistType) {
		this.codeMapActionsService.pushItemToBlacklist({ path: this._viewModel.searchPattern, type: blacklistType })
		this.resetSearchPattern()
	}
	
	private updateViewModel(blacklist: BlacklistItem[]) {
		this._viewModel.isPatternExcluded = this.isPatternBlacklisted(blacklist, BlacklistType.exclude)
		this._viewModel.isPatternHidden = this.isPatternBlacklisted(blacklist, BlacklistType.hide)
	}

	private isPatternBlacklisted(blacklist: BlacklistItem[], blacklistType: BlacklistType): boolean {
		return !!blacklist.find(x => this._viewModel.searchPattern == x.path && blacklistType == x.type)
	}

    private resetSearchPattern() {
		this._viewModel.searchPattern = ""
		this.applySettingsSearchPattern()
	}

}

export const searchBarComponent = {
    selector: "searchBarComponent",
    template: require("./searchBar.component.html"),
    controller: SearchBarController
}