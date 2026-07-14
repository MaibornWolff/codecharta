import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ColorCategoryCountsStore } from "../../../../renderer/threeViewer/threeViewer.facade"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { ColorBandRowComponent } from "./colorBandRow.component"

@Component({
    selector: "cc-color-bands-section",
    templateUrl: "./colorBandsSection.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ColorBandRowComponent]
})
export class ColorBandsSectionComponent {
    constructor(
        private readonly fileStoreReadWindow: FileStoreReadWindow,
        private readonly colorCategoryCountsStore: ColorCategoryCountsStore
    ) {}

    readonly isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { initialValue: false })
    readonly colorCategoryCounts = toSignal(this.colorCategoryCountsStore.colorCategoryCounts$, {
        initialValue: { positive: 0, neutral: 0, negative: 0 }
    })
}
