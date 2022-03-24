import "./downloadCustomConfigsButton.component.scss"
import { Component, Inject, OnDestroy, OnInit } from "@angular/core"
import { ExportCustomConfig } from "../../../model/customConfig/customConfig.api.model"
import { getDownloadableCustomConfigs } from "./downloadableCustomConfigsHelper"

import { combineLatest, Subscription } from "rxjs"
import { Store } from "../../../state/angular-redux/store"
import { downloadCustomConfigs } from "./downloadCustomConfigHelper"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { visibleFileStatesSelector } from "../../../state/selectors/visibleFileStates.selector"

@Component({ template: require("./downloadCustomConfigsButton.component.html") })
export class DownloadCustomConfigsButtonComponent implements OnInit, OnDestroy {
	private downloadableConfigs: Map<string, ExportCustomConfig> = new Map<string, ExportCustomConfig>()
	getDownloadableConfigsSubscription: Subscription

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.getDownloadableConfigsSubscription = combineLatest([
			this.store.select(visibleFileStatesSelector),
			CustomConfigHelper.customConfigChange$
		]).subscribe(([visibleFileStates]) => {
			this.downloadableConfigs = getDownloadableCustomConfigs(visibleFileStates)
		})
	}

	ngOnDestroy(): void {
		this.getDownloadableConfigsSubscription.unsubscribe()
	}

	downloadPreloadedCustomConfigs() {
		if (this.downloadableConfigs.size === 0) {
			return
		}
		downloadCustomConfigs(this.downloadableConfigs)
	}
}
