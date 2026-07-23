import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core"
import { WordCloudShape, wordCloudShapeLabels } from "../../../../model/wordCloud.model"
import { ResetSettingsButtonComponent, SettingsPopoverShellComponent } from "../../../shared/facade"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { DomainBarWriteStore } from "../../stores/domainBar.write.store"

@Component({
    selector: "cc-shape-settings-popover",
    templateUrl: "./shapeSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ResetSettingsButtonComponent, SettingsPopoverShellComponent]
})
export class ShapeSettingsPopoverComponent {
    private readonly readStore = inject(DomainBarReadStore)
    private readonly writeStore = inject(DomainBarWriteStore)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly settings = this.readStore.settings
    readonly shapes = Object.values(WordCloudShape)
    readonly shapeLabels = wordCloudShapeLabels

    readonly resetKeys = ["domainState.shape"]

    onShapeChange(value: string) {
        this.writeStore.setShape(value as WordCloudShape)
    }
}
