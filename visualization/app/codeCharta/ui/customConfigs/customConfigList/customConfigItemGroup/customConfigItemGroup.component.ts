import { Component, Input, OnChanges, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { CustomConfigItemGroup } from "../../customConfigs.component"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../codeMap/threeViewer/threeOrbitControls.service"
import { Store } from "@ngrx/store"
import { MatExpansionPanel } from "@angular/material/expansion"

@Component({
    selector: "cc-custom-config-item-group",
    templateUrl: "./customConfigItemGroup.component.html",
    styleUrls: ["./customConfigItemGroup.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class CustomConfigItemGroupComponent implements OnChanges {
    @Input() customConfigItemGroups: Map<string, CustomConfigItemGroup>
    @ViewChild("matExpansionPanel") matExpansionPanel: MatExpansionPanel
    @Input() searchTerm = ""
    expandedStates: { [key: string]: boolean } = {}
    manuallyToggled: Set<string> = new Set()

    constructor(
        private store: Store,
        private threeCameraService: ThreeCameraService,
        private threeOrbitControlsService: ThreeOrbitControlsService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.searchTerm) {
            if (changes.searchTerm.currentValue.length > 0) {
                for (const groupKey of Object.keys(this.expandedStates)) {
                    this.expandedStates[groupKey] = true
                }
            } else {
                for (const groupKey of Object.keys(this.expandedStates)) {
                    if (!this.manuallyToggled.has(groupKey)) {
                        this.expandedStates[groupKey] = false
                    }
                }
            }
        }
    }

    isGroupExpanded(groupKey: string): boolean {
        return this.searchTerm.length > 0
            ? !this.manuallyToggled.has(groupKey) || this.expandedStates[groupKey]
            : this.expandedStates[groupKey] || false
    }

    toggleGroupExpansion(groupKey: string): void {
        this.expandedStates[groupKey] = !this.isGroupExpanded(groupKey)
        this.manuallyToggled.add(groupKey)
    }
    removeCustomConfig(configId: string, groupKey: string) {
        CustomConfigHelper.deleteCustomConfig(configId)
        this.expandedStates[groupKey] = true
    }

    applyCustomConfig(configId: string) {
        CustomConfigHelper.applyCustomConfig(configId, this.store, this.threeCameraService, this.threeOrbitControlsService)
    }
}
