import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core"
import { withRangeMax, withRangeMin } from "../../../../model/wordCloud.model"
import { ResetSettingsButtonComponent, SettingsPopoverShellComponent, SliderNumberInputComponent } from "../../../shared/facade"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { DomainBarWriteStore } from "../../stores/domainBar.write.store"

@Component({
    selector: "cc-rotation-settings-popover",
    templateUrl: "./rotationSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ResetSettingsButtonComponent, SettingsPopoverShellComponent, SliderNumberInputComponent]
})
export class RotationSettingsPopoverComponent {
    private readonly readStore = inject(DomainBarReadStore)
    private readonly writeStore = inject(DomainBarWriteStore)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly settings = this.readStore.settings

    readonly resetKeys = ["domainState.rotationRange", "domainState.rotationStep"]

    onRotationStepChange(value: number) {
        this.writeStore.setRotationStep(value)
    }

    onRotationRangeMinChange(value: number) {
        this.writeStore.setRotationRange(withRangeMin(this.settings().rotationRange, value))
    }

    onRotationRangeMaxChange(value: number) {
        this.writeStore.setRotationRange(withRangeMax(this.settings().rotationRange, value))
    }
}
