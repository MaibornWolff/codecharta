import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core"
import { WordCloudShape, wordCloudShapeLabels } from "../../../../model/wordCloud.model"
import { ResetSettingsButtonComponent, SettingsPopoverShellComponent } from "../../../shared/facade"
import { CustomShapeMaskStore } from "../../stores/customShapeMask.store"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { DomainBarWriteStore } from "../../stores/domainBar.write.store"
import { shapeMaskFromSvg } from "../../util/shapeMaskSvg"

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
    private readonly customShapeMaskStore = inject(CustomShapeMaskStore)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly settings = this.readStore.settings
    readonly shapes = Object.values(WordCloudShape)
    readonly shapeLabels = wordCloudShapeLabels

    readonly resetKeys = ["domainState.shape"]

    protected readonly isCustomShape = computed(() => this.settings().shape === WordCloudShape.custom)
    protected readonly uploadedMask = this.customShapeMaskStore.mask
    protected readonly rejection = signal<string | null>(null)

    onShapeChange(value: string) {
        this.writeStore.setShape(value as WordCloudShape)
    }

    /** A file the cloud cannot be laid out inside is refused with its reason, and the shape already in
     * use is left alone rather than replaced by something that would not draw. */
    protected async onShapeFileChosen(event: Event): Promise<void> {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (!file) {
            return
        }
        const mask = shapeMaskFromSvg(await file.text())
        if ("rejection" in mask) {
            this.rejection.set(mask.rejection)
            return
        }
        this.rejection.set(null)
        this.customShapeMaskStore.accept({ fileName: file.name, dataUri: mask.dataUri })
    }
}
