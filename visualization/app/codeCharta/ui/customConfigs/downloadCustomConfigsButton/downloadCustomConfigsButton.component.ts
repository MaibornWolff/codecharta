import { Component, Inject, OnDestroy, OnInit } from "@angular/core"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { CustomConfigFileStateConnector } from "../customConfigFileStateConnector"
import { State } from "../../../state/angular-redux/state"
import { filesSelector } from "../../../state/store/files/files.selector"
import { ExportCustomConfig } from "../../../model/customConfig/customConfig.api.model"
import { downloadableCustomConfigsSelector } from "../selectors/downloadableCustomConfigs.selector"

import { Subscription } from "rxjs"
import { Store } from "../../../state/angular-redux/store"

@Component({ template: require("./downloadCustomConfigsButton.component.html") })
export class DownloadCustomConfigsButtonComponent implements OnInit, OnDestroy {
	private customConfigFileStateConnector: CustomConfigFileStateConnector
	private downloadableConfigs: Map<string, ExportCustomConfig>
	subscription: Subscription

	constructor(@Inject(State) private state: State, @Inject(Store) private store: Store) {}

	ngOnInit(): void {
		const files = filesSelector(this.state.getValue())
		this.subscription = this.store.select(downloadableCustomConfigsSelector).subscribe(downloadableConfigs => {
			this.downloadableConfigs = downloadableConfigs
		})

		this.customConfigFileStateConnector = new CustomConfigFileStateConnector(files)
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe()
	}

	downloadPreloadedCustomConfigs() {
		if (this.downloadableConfigs.size === 0) {
			return
		}
		CustomConfigHelper.downloadCustomConfigs(this.downloadableConfigs, this.customConfigFileStateConnector)
	}
}
