import { Component, OnDestroy, OnInit } from "@angular/core"
import { DownloadableConfigs } from "./getDownloadableCustomConfigs"

import { downloadCustomConfigs } from "./downloadCustomConfigHelper"
import { CustomConfigHelperService } from "../customConfigHelper.service"
import { Subscription } from "rxjs"

@Component({
    selector: "cc-download-custom-configs-button",
    templateUrl: "./downloadCustomConfigsButton.component.html",
    styleUrls: ["../customConfigButtons.scss"]
})
export class DownloadCustomConfigsButtonComponent implements OnInit, OnDestroy {
    downloadableConfigs: DownloadableConfigs
    subscription: Subscription

    constructor(private downloadCustomConfigService: CustomConfigHelperService) {}

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
