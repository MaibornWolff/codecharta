import "./customConfigs.component.scss"
import { Component, Inject } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { CustomConfigListComponent } from "./customConfigList/customConfigList.component"
import { CustomConfigMapSelectionMode } from "../../model/customConfig/customConfig.api.model"

export interface CustomConfigItem {
	id: string
	name: string
	assignedMaps: Map<string, string>
	mapSelectionMode: CustomConfigMapSelectionMode
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
	template: require("./customConfigs.component.html")
})
export class CustomConfigsComponent {
	constructor(@Inject(MatDialog) private dialog: MatDialog) {}

	openCustomConfigDialog() {
		this.dialog.open(CustomConfigListComponent, {
			panelClass: "cc-custom-config-list"
		})
	}
}
