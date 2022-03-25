import "./downloadCustomConfigsButton.component.scss"
import { Component, Inject, OnDestroy, OnInit } from "@angular/core"
import { DownloadableConfigs } from "./downloadableCustomConfigsHelper"

import { downloadCustomConfigs } from "./downloadCustomConfigHelper"
import { DownloadCustomConfigService } from "./downloadCustomConfig.service"
import { Subscription } from "rxjs"

@Component({ template: require("./downloadCustomConfigsButton.component.html") })
export class DownloadCustomConfigsButtonComponent implements OnInit, OnDestroy {
	downloadableConfigs: DownloadableConfigs
	subscription: Subscription

	constructor(@Inject(DownloadCustomConfigService) private downloadCustomConfigService: DownloadCustomConfigService) {}

	ngOnInit(): void {
		this.subscription = this.downloadCustomConfigService.downloadableCustomConfig$.subscribe(
			downloadableConfigs => (this.downloadableConfigs = downloadableConfigs)
		)
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe()
	}

	downloadPreloadedCustomConfigs() {
		if (this.downloadableConfigs.size === 0) {
			return
		}
		downloadCustomConfigs(this.downloadableConfigs)
	}
}
