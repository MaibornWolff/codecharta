import "./searchBar.component.scss"
import { SettingsService } from "../../state/settings.service";
import { BlacklistType } from "../../codeCharta.model";
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service";

export class SearchBarController {

    private _viewModel: {
		searchPattern: string
	} = {
		searchPattern: ""
	}

    /* @ngInject */
    constructor(private settingsService: SettingsService,
        private codeMapActionsService: CodeMapActionsService) {

    }

    public applySettingsSearchPattern() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				searchPattern: this._viewModel.searchPattern
			}
		})
    }
    
    public onClickBlacklistPattern(blacklistType: BlacklistType) {
		this.codeMapActionsService.pushItemToBlacklist({ path: this._viewModel.searchPattern, type: blacklistType })
		this.resetSearchPattern()
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