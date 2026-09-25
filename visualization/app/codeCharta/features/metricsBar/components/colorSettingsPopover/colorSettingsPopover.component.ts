import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { SettingsPopoverShellComponent } from "../../../shared/facade"
import { ColorBandsSectionComponent } from "./colorBandsSection.component"
import { ColorRangeSectionComponent } from "./colorRangeSection.component"
import { ColorSettingsHeaderComponent } from "./colorSettingsHeader.component"
import { FolderOverridesComponent } from "./folderOverrides.component"
import { GradientModePickerComponent } from "./gradientModePicker.component"
import { InvertResetRowComponent } from "./invertResetRow.component"

@Component({
    selector: "cc-color-settings-popover",
    templateUrl: "./colorSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [
        SettingsPopoverShellComponent,
        ColorSettingsHeaderComponent,
        ColorRangeSectionComponent,
        GradientModePickerComponent,
        ColorBandsSectionComponent,
        InvertResetRowComponent,
        FolderOverridesComponent
    ]
})
export class ColorSettingsPopoverComponent {
    constructor(
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly fileStoreReadWindow: FileStoreReadWindow
    ) {}

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    private readonly colorMetric = toSignal(this.mapStateReadWindow.colorMetric$, { initialValue: "" })
    private readonly isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { initialValue: false })

    readonly hasRangeSection = computed(() => !this.isDeltaState() && this.colorMetric() !== "unary")
}
