import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { SliderNumberInputComponent } from "../../../shared/facade"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { DomainBarWriteStore } from "../../stores/domainBar.write.store"

@Component({
    selector: "cc-word-spacing-control",
    templateUrl: "./wordSpacingControl.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [SliderNumberInputComponent]
})
export class WordSpacingControlComponent {
    private readonly readStore = inject(DomainBarReadStore)
    private readonly writeStore = inject(DomainBarWriteStore)

    readonly settings = this.readStore.settings

    readonly wordSpacingBounds = { min: 4, max: 16, step: 4 }

    onGridSizeChange(value: number) {
        this.writeStore.setGridSize(value)
    }
}
