import { Component, ViewEncapsulation } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { CustomConfigListComponent } from "./customConfigList/customConfigList.component"
import { CustomConfigMapSelectionMode } from "../../model/customConfig/customConfig.api.model"
import { MapColors, PrimaryMetrics } from "../../codeCharta.model"

type CustomConfigColors = Pick<MapColors, "positive" | "neutral" | "negative" | "selected" | "positiveDelta" | "negativeDelta">

export interface CustomConfigItem {
	id: string
	name: string
	assignedMaps: Map<string, string>
	mapSelectionMode: CustomConfigMapSelectionMode
	metrics: Pick<PrimaryMetrics, "areaMetric" | "heightMetric" | "colorMetric" | "edgeMetric">
	mapColors: CustomConfigColors
	isApplicable: boolean
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
	styleUrls: ["./customConfigs.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class CustomConfigsComponent {
	constructor(private dialog: MatDialog) {}

	openCustomConfigDialog() {
		this.dialog.open(CustomConfigListComponent, {
			panelClass: "cc-custom-config-list"
		})
	}
}
