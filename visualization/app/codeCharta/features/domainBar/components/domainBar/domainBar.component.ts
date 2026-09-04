import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { WordCloudSizingMode, wordCloudShapeLabels } from "../../../../model/wordCloud.model"
import { BAR_BOTTOM_ABOVE_BOTTOM_BAR, BarShellDirective } from "../../../shared/facade"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { DomainSegmentComponent } from "../domainSegment/domainSegment.component"
import { RotationSettingsPopoverComponent } from "../rotationSettingsPopover/rotationSettingsPopover.component"
import { ShapeSettingsPopoverComponent } from "../shapeSettingsPopover/shapeSettingsPopover.component"
import { WordSizingSettingsPopoverComponent } from "../wordSizingSettingsPopover/wordSizingSettingsPopover.component"

@Component({
    selector: "cc-domain-bar",
    templateUrl: "./domainBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DomainSegmentComponent, ShapeSettingsPopoverComponent, WordSizingSettingsPopoverComponent, RotationSettingsPopoverComponent],
    standalone: true,
    hostDirectives: [BarShellDirective],
    host: { "[style.bottom]": "barBottom" }
})
export class DomainBarComponent {
    readonly barBottom = BAR_BOTTOM_ABOVE_BOTTOM_BAR

    private readonly readStore = inject(DomainBarReadStore)

    readonly settings = this.readStore.settings

    readonly shapeLabel = computed(() => wordCloudShapeLabels[this.settings().shape])

    readonly sizingModeLabel = computed(() => (this.settings().sizingMode === WordCloudSizingMode.tfidf ? "TF-IDF" : "Frequency"))

    readonly rotationRangeLabel = computed(() => {
        const [minRotation, maxRotation] = this.settings().rotationRange
        return `${minRotation}° – ${maxRotation}°`
    })
}
