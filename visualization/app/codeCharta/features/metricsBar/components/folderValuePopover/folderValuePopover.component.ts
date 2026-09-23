import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core"
import { RadialFolderValue } from "../../../../model/codeCharta.model"
import { describeRadialFolderValue, RADIAL_FOLDER_VALUES, RadialFolderScale } from "../../../../util/radialFolderValues"
import { SettingsPopoverShellComponent } from "../../../shared/facade"

const SCALE_TITLES: Record<RadialFolderScale, string> = {
    [RadialFolderScale.FileThresholds]: "On the file thresholds",
    [RadialFolderScale.OwnScale]: "Own scale (not the file thresholds)"
}

@Component({
    selector: "cc-folder-value-popover",
    templateUrl: "./folderValuePopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [SettingsPopoverShellComponent]
})
export class FolderValuePopoverComponent {
    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()
    readonly selected = input.required<RadialFolderValue>()
    readonly isNeutral = input.required<boolean>()
    readonly colorMetric = input.required<string>()
    readonly valueSelected = output<RadialFolderValue>()

    readonly groups = Object.values(RadialFolderScale).map(scale => ({
        scale,
        title: SCALE_TITLES[scale],
        options: RADIAL_FOLDER_VALUES.filter(descriptor => descriptor.scale === scale)
    }))

    readonly title = computed(() => (this.isNeutral() ? "neutral" : describeRadialFolderValue(this.selected()).label))
    readonly footnote = computed(() =>
        this.isNeutral()
            ? "Folders are one grey. Pick a value to tint them again."
            : "Files keep their colour. Folders are tinted by this value; the cog sets neutral or the tint strength."
    )
}
