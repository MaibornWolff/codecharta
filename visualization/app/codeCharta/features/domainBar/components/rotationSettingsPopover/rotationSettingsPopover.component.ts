import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core"
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

    readonly resetKeys = ["domainBar.rotationRange", "domainBar.rotationStep"]

    onRotationStepChange(value: number) {
        this.writeStore.setRotationStep(value)
    }

    onRotationRangeMinChange(value: number) {
        this.writeStore.setRotationRange([value, this.settings().rotationRange[1]])
    }

    onRotationRangeMaxChange(value: number) {
        this.writeStore.setRotationRange([this.settings().rotationRange[0], value])
    }
}
