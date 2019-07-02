import "./matchingFilesCounter.component.scss"
import { BlacklistType, BlacklistItem, CodeMapNode, Settings, RecursivePartial } from "../../codeCharta.model";
import { SettingsServiceSubscriber } from "../../state/settings.service";
import { CodeMapHelper } from "../../util/codeMapHelper";

export class MatchingFilesCounterController implements SettingsServiceSubscriber {

    private _viewModel: {
		fileCount: number
		hideCount: number
		excludeCount: number
	} = {
		fileCount: 0,
		hideCount: 0,
		excludeCount: 0,
	}

	private searchedNodes: CodeMapNode[] = []

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: angular.IAngularEvent) {
		const searchedNodeLeaves: CodeMapNode[] = this.getSearchedNodeLeaves()
		this.updateViewModel(searchedNodeLeaves, settings.fileSettings.blacklist)
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