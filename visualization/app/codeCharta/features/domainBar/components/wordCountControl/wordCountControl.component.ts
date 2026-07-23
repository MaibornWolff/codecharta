import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { SliderNumberInputComponent } from "../../../shared/facade"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { DomainBarWriteStore } from "../../stores/domainBar.write.store"

@Component({
    selector: "cc-word-count-control",
    templateUrl: "./wordCountControl.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [SliderNumberInputComponent]
})
export class WordCountControlComponent {
    private readonly readStore = inject(DomainBarReadStore)
    private readonly writeStore = inject(DomainBarWriteStore)

    readonly settings = this.readStore.settings

    readonly wordCountBounds = { min: 10, max: 1000, step: 10 }

    onTopNChange(value: number) {
        this.writeStore.setTopN(value)
    }
}
