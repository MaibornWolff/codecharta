import { Component, Inject, OnDestroy, OnInit } from "@angular/core"
import { DownloadableConfigs } from "./getDownloadableCustomConfigs"

import { downloadCustomConfigs } from "./downloadCustomConfigHelper"
import { CustomConfigHelperService } from "../customConfigHelper.service"
import { Subscription } from "rxjs"

@Component({
	selector: "cc-download-custom-configs-button",
	template: require("./downloadCustomConfigsButton.component.html")
})
export class DownloadCustomConfigsButtonComponent implements OnInit, OnDestroy {
	downloadableConfigs: DownloadableConfigs
	subscription: Subscription

	constructor(@Inject(CustomConfigHelperService) private downloadCustomConfigService: CustomConfigHelperService) {}

	ngOnInit(): void {
		this.subscription = this.downloadCustomConfigService.downloadableCustomConfigs$.subscribe(downloadableConfigs => {
			this.downloadableConfigs = downloadableConfigs
		})
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe()
	}

	downloadPreloadedCustomConfigs() {
		downloadCustomConfigs(this.downloadableConfigs)
	}
}
