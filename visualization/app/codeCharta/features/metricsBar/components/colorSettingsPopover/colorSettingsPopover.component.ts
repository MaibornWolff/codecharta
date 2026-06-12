import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ColorMetricService } from "../../services/colorMetric.service"
import { IsDeltaStateService } from "../../services/isDeltaState.service"
import { SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"
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
        private readonly colorMetricService: ColorMetricService,
        private readonly isDeltaStateService: IsDeltaStateService
    ) {}

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    private readonly colorMetric = toSignal(this.colorMetricService.colorMetric$(), { initialValue: "" })
    private readonly isDeltaState = toSignal(this.isDeltaStateService.isDeltaState$(), { initialValue: false })

    readonly hasRangeSection = computed(() => !this.isDeltaState() && this.colorMetric() !== "unary")
}
