import { ChangeDetectionStrategy, Component, input, output } from "@angular/core"
import { RadialFolderStyle } from "../../../../model/codeCharta.model"
import { NEUTRAL_FOLDER_COLOR } from "../../../../util/radialFolderValues"
import { ResetSettingsButtonComponent, SettingsPopoverShellComponent, SliderNumberInputComponent } from "../../../shared/facade"

@Component({
    selector: "cc-folder-style-popover",
    templateUrl: "./folderStylePopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ResetSettingsButtonComponent, SettingsPopoverShellComponent, SliderNumberInputComponent]
})
export class FolderStylePopoverComponent {
    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()
    readonly isNeutral = input.required<boolean>()
    readonly tintPercent = input.required<number>()
    readonly tintedSwatch = input.required<string>()
    readonly styleSelected = output<RadialFolderStyle>()
    readonly tintPercentChange = output<number>()

    readonly Tinted = RadialFolderStyle.Tinted
    readonly Neutral = RadialFolderStyle.Neutral
    readonly neutralSwatch = NEUTRAL_FOLDER_COLOR
    readonly minTintPercent = 20
    readonly maxTintPercent = 100
    readonly tintPercentStep = 10
    readonly resetKeys = ["preferences.radialFolderValue", "preferences.radialFolderStyle", "preferences.radialFolderTint"]
}
