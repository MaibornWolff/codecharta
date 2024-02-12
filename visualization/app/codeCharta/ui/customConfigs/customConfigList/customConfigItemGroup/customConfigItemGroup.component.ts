import { Component, Input, OnChanges, ViewEncapsulation } from "@angular/core"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { CustomConfigItemGroup } from "../../customConfigs.component"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../codeMap/threeViewer/threeOrbitControls.service"
import { Store } from "@ngrx/store"

@Component({
	selector: "cc-custom-config-item-group",
	templateUrl: "./customConfigItemGroup.component.html",
	styleUrls: ["./customConfigItemGroup.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class CustomConfigItemGroupComponent implements OnChanges {
	@Input() customConfigItemGroups: Map<string, CustomConfigItemGroup>
	@Input() searchTerm = ""
	expandedStates: { [key: string]: boolean } = {}

	constructor(
		private store: Store,
		private threeCameraService: ThreeCameraService,
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {}

	ngOnChanges(): void {
		this.expandedStates = {}
	}

	isGroupExpanded(groupKey: string): boolean {
		return this.expandedStates[groupKey] || false
	}

	toggleGroupExpansion(groupKey: string): void {
		this.expandedStates[groupKey] = !this.isGroupExpanded(groupKey)
	}
	removeCustomConfig(configId: string, groupKey: string) {
		CustomConfigHelper.deleteCustomConfig(configId)
		this.expandedStates[groupKey] = true
	}

	applyCustomConfig(configId: string) {
		CustomConfigHelper.applyCustomConfig(configId, this.store, this.threeCameraService, this.threeOrbitControlsService)
	}
}
