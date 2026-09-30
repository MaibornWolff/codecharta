import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core"

export interface Choice<Value extends string> {
    value: Value
    label: string
    hint: string
}

@Component({
    selector: "cc-choice-row",
    templateUrl: "./choiceRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex flex-col gap-1" }
})
export class ChoiceRowComponent<Value extends string> {
    readonly label = input.required<string>()
    readonly idPrefix = input.required<string>()
    readonly choices = input.required<Choice<Value>[]>()
    readonly chosen = input.required<Value>()
    readonly choose = output<Value>()

    readonly chosenHint = computed(() => this.choices().find(choice => choice.value === this.chosen())?.hint ?? "")
}
