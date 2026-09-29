import { ChangeDetectionStrategy, Component, computed, input, output, viewChild } from "@angular/core"
import { AxisCardComponent, SettingsPopoverShellComponent } from "../../../shared/facade"

export interface Choice {
    value: string
    label: string
    hint: string
    isDisabled?: boolean
}

/** A bar card naming the current choice; a click on it opens the list to pick another, and whatever the bar puts
 * inside below it. */
@Component({
    selector: "cc-choice-segment",
    templateUrl: "./choiceSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, SettingsPopoverShellComponent]
})
export class ChoiceSegmentComponent {
    readonly label = input.required<string>()
    readonly idPrefix = input.required<string>()
    readonly choices = input.required<Choice[]>()
    readonly chosen = input.required<string>()
    readonly choose = output<string>()

    private readonly popoverShell = viewChild.required(SettingsPopoverShellComponent)

    readonly popoverId = computed(() => `${this.idPrefix()}-popover`)
    readonly anchorName = computed(() => `${this.idPrefix()}-card`)
    readonly chosenLabel = computed(() => this.choices().find(choice => choice.value === this.chosen())?.label ?? null)

    pick(value: string): void {
        this.choose.emit(value)
        const popover = this.popoverShell().popover().nativeElement
        if (popover.matches(":popover-open")) {
            popover.hidePopover()
        }
    }
}
