import { Component, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { CustomConfigItemGroup } from "../../customConfigs.component"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../codeMap/threeViewer/threeMapControls.service"
import { Store } from "@ngrx/store"
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion"
import { ThreeRendererService } from "../../../codeMap/threeViewer/threeRenderer.service"
import { MatList, MatListItem } from "@angular/material/list"
import { MatDialogClose } from "@angular/material/dialog"
import { CustomConfigNoteDialogButtonComponent } from "../../customConfigNoteDialogButton/customConfigNoteDialogButton.component"
import { ApplyCustomConfigButtonComponent } from "./customConfigDescription/applyCustomConfigButton.component"
import { TitleCasePipe, KeyValuePipe } from "@angular/common"
import { TruncateTextPipe } from "../../../../util/pipes/truncateText.pipe"
import { CustomConfig2ApplicableMessage } from "./customConfig2ApplicableMessage.pipe"
import { FilterCustomConfigDataBySearchTermPipe } from "./customConfigDescription/filterCustomConfigDataBySearchTerm.pipe"

@Component({
    selector: "cc-custom-config-item-group",
    templateUrl: "./customConfigItemGroup.component.html",
    styleUrls: ["./customConfigItemGroup.component.scss"],
    standalone: true,
    imports: [
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatList,
        MatListItem,
        MatDialogClose,
        CustomConfigNoteDialogButtonComponent,
        ApplyCustomConfigButtonComponent,
        TitleCasePipe,
        KeyValuePipe,
        TruncateTextPipe,
        CustomConfig2ApplicableMessage,
        FilterCustomConfigDataBySearchTermPipe
    ]
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
        private threeOrbitControlsService: ThreeMapControlsService,
        private threeRendererService: ThreeRendererService
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
        CustomConfigHelper.applyCustomConfig(
            configId,
            this.store,
            this.threeCameraService,
            this.threeOrbitControlsService,
            this.threeRendererService
        )
    }
}
