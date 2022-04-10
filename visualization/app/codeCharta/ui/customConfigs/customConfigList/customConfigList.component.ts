import "./customConfigList.component.scss"
import { Component, Inject, OnDestroy, OnInit } from "@angular/core"
import { CustomConfigGroups } from "../../../util/customConfigHelper"
import { CustomConfigFileStateConnector } from "../customConfigFileStateConnector"
import { Subscription } from "rxjs"
import { CustomConfigHelperService } from "../customConfigHelper.service"

@Component({
	template: require("./customConfigList.component.html")
})
export class CustomConfigListComponent implements OnInit, OnDestroy {
	customConfigFileStateConnector: CustomConfigFileStateConnector
	dropDownCustomConfigItemGroups: CustomConfigGroups
	isCollapsed = true
	subscription: Subscription

	constructor(@Inject(CustomConfigHelperService) private customConfigService: CustomConfigHelperService) {}

	ngOnInit() {
		this.subscription = this.customConfigService.customConfigItemGroups$.subscribe(customConfigItemGroups => {
			this.dropDownCustomConfigItemGroups = customConfigItemGroups
		})
	}

	ngOnDestroy() {
		this.subscription.unsubscribe()
	}

	toggleNonApplicableCustomConfigsList() {
		this.isCollapsed = !this.isCollapsed
	}
}
