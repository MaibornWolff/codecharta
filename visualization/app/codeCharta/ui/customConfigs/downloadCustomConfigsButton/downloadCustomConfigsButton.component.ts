import { Component, Inject, OnDestroy, OnInit } from "@angular/core"
import { ExportCustomConfig } from "../../../model/customConfig/customConfig.api.model"
import { downloadableCustomConfigsSelector } from "../selectors/downloadableCustomConfigs.selector"

import { Subscription } from "rxjs"
import { Store } from "../../../state/angular-redux/store"
import { downloadCustomConfigs } from "./downloadCustomConfigHelper"

@Component({ template: require("./downloadCustomConfigsButton.component.html") })
export class DownloadCustomConfigsButtonComponent implements OnInit, OnDestroy {
	private downloadableConfigs: Map<string, ExportCustomConfig>
	subscription: Subscription

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.subscription = this.store.select(downloadableCustomConfigsSelector).subscribe(downloadableConfigs => {
			this.downloadableConfigs = downloadableConfigs
		})
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
