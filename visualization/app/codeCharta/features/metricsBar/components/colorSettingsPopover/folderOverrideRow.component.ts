import { ChangeDetectionStrategy, Component, input, output } from "@angular/core"
import { InlineColorPickerComponent } from "../../../shared/facade"
import { MarkedPackageWithCount } from "../../selectors/markedPackagesWithCounts.selector"

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
