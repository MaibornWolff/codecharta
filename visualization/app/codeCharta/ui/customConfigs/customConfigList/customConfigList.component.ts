import "./customConfigList.component.scss"
import { Component, Inject, OnInit } from "@angular/core"
import { CustomConfigGroups, CustomConfigHelper } from "../../../util/customConfigHelper"
import { State } from "../../../state/angular-redux/state"
import { CustomConfigFileStateConnector } from "../customConfigFileStateConnector"
import { Subscription } from "rxjs"
import { DownloadCustomConfigService } from "../downloadCustomConfigsButton/downloadCustomConfig.service"

@Component({
	template: require("./customConfigList.component.html")
})
export class CustomConfigListComponent implements OnInit {
	customConfigFileStateConnector: CustomConfigFileStateConnector
	dropDownCustomConfigItemGroups: CustomConfigGroups
	subscription: Subscription

	constructor(
		@Inject(State) private state: State,
		@Inject(DownloadCustomConfigService) private customConfigService: DownloadCustomConfigService
	) {}

	ngOnInit() {
		this.subscription = this.customConfigService.downloadableCustomConfigs$.subscribe(() => {
			this.loadCustomConfigs()
		})
		this.customConfigFileStateConnector = new CustomConfigFileStateConnector(this.state.getValue().files)
		this.loadCustomConfigs()
	}

	loadCustomConfigs() {
		this.dropDownCustomConfigItemGroups = CustomConfigHelper.getCustomConfigItemGroups(this.customConfigFileStateConnector)
		//this._viewModel.dropDownCustomConfigItemGroups.sort(CustomConfigHelper.sortCustomConfigDropDownGroupList)
	}
}
