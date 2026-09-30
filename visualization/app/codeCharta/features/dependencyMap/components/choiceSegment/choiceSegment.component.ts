import { ChangeDetectionStrategy, Component, computed, input, output, viewChild } from "@angular/core"
import { AxisCardComponent, SettingsPopoverShellComponent } from "../../../shared/facade"

export interface Choice<Value extends string> {
    value: Value
    label: string
    hint: string
}

@Component({
    selector: "cc-choice-segment",
    templateUrl: "./choiceSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, SettingsPopoverShellComponent]
})
export class ChoiceSegmentComponent<Value extends string> {
    readonly label = input.required<string>()
    readonly idPrefix = input.required<string>()
    readonly choices = input.required<Choice<Value>[]>()
    readonly chosen = input.required<Value>()
    readonly choose = output<Value>()

    private readonly popoverShell = viewChild.required(SettingsPopoverShellComponent)

    readonly popoverId = computed(() => `${this.idPrefix()}-popover`)
    readonly anchorName = computed(() => `${this.idPrefix()}-card`)
    readonly chosenLabel = computed(() => this.choices().find(choice => choice.value === this.chosen())?.label ?? null)

    pick(value: Value): void {
        this.choose.emit(value)
        const popover = this.popoverShell().popover().nativeElement
        if (popover.matches(":popover-open")) {
            popover.hidePopover()
        }
    }
}
