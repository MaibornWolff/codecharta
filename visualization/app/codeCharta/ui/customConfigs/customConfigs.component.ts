import { Component } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { CustomConfigListComponent } from "./customConfigList/customConfigList.component"
import { CustomConfigMapSelectionMode } from "../../model/customConfig/customConfig.api.model"
import { MapColors, PrimaryMetrics } from "../../codeCharta.model"
import { AddCustomConfigDialogComponent } from "./addCustomConfigButton/addCustomConfigDialog/addCustomConfigDialog.component"

type CustomConfigColors = Pick<MapColors, "positive" | "neutral" | "negative" | "selected" | "positiveDelta" | "negativeDelta">

export interface CustomConfigItem {
    id: string
    name: string
    assignedMaps: Map<string, string>
    mapSelectionMode: CustomConfigMapSelectionMode
    metrics: PrimaryMetrics
    mapColors: CustomConfigColors
    isApplicable: boolean
    note?: string
}

export interface CustomConfigItemGroup {
    mapNames: string
    mapSelectionMode: CustomConfigMapSelectionMode
    hasApplicableItems: boolean
    customConfigItems: CustomConfigItem[]
}

@Component({
    selector: "cc-custom-configs",
    templateUrl: "./customConfigs.component.html",
    styleUrls: ["./customConfigs.component.scss"]
})
export class CustomConfigsComponent {
    constructor(private dialog: MatDialog) {}

    openCustomConfigDialog() {
        this.dialog.open(CustomConfigListComponent, {
            panelClass: "cc-custom-config-list"
        })
    }

    showAddCustomConfigDialog() {
        this.dialog.open(AddCustomConfigDialogComponent, {
            panelClass: "cc-add-custom-config-dialog"
        })
    }
}
