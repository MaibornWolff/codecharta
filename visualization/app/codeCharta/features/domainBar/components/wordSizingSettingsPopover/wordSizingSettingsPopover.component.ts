import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { ResetSettingsButtonComponent, SettingsPopoverShellComponent } from "../../../shared/facade"
import { WordCountControlComponent } from "../wordCountControl/wordCountControl.component"
import { WordSizeRangeControlComponent } from "../wordSizeRangeControl/wordSizeRangeControl.component"
import { WordSizingModeControlComponent } from "../wordSizingModeControl/wordSizingModeControl.component"
import { WordSpacingControlComponent } from "../wordSpacingControl/wordSpacingControl.component"

@Component({
    selector: "cc-word-sizing-settings-popover",
    templateUrl: "./wordSizingSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [
        ResetSettingsButtonComponent,
        SettingsPopoverShellComponent,
        WordSizingModeControlComponent,
        WordCountControlComponent,
        WordSizeRangeControlComponent,
        WordSpacingControlComponent
    ]
})
export class WordSizingSettingsPopoverComponent {
    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly resetKeys = [
        "domainState.sizingMode",
        "domainState.topN",
        "domainState.sizeRange",
        "domainState.gridSize",
        "domainState.shrinkToFit",
        "domainState.drawOutOfBound"
    ]
}
