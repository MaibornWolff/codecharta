import { ChangeDetectionStrategy, Component, input, output } from "@angular/core"
import { MarkedPackageWithCount } from "../../selectors/markedPackagesWithCounts.selector"
import { InlineColorPickerComponent } from "./inlineColorPicker.component"

@Component({
    selector: "cc-folder-override-row",
    templateUrl: "./folderOverrideRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [InlineColorPickerComponent]
})
export class FolderOverrideRowComponent {
    readonly override = input.required<MarkedPackageWithCount>()

    readonly recolorOverride = output<string>()
    readonly unpinOverride = output<void>()
}
