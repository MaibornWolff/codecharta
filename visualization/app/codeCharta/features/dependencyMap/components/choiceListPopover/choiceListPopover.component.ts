import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core"
import { SettingsPopoverShellComponent } from "../../../shared/facade"
import { Choice } from "../choiceRow/choiceRow.component"

@Component({
    selector: "cc-choice-list-popover",
    templateUrl: "./choiceListPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [SettingsPopoverShellComponent]
})
export class ChoiceListPopoverComponent<Value extends string> {
    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()
    readonly title = input.required<string>()
    readonly idPrefix = input.required<string>()
    readonly choices = input.required<Choice<Value>[]>()
    readonly chosen = input.required<Value>()
    readonly choose = output<Value>()

    readonly chosenLabel = computed(() => this.choices().find(choice => choice.value === this.chosen())?.label ?? "")
}
