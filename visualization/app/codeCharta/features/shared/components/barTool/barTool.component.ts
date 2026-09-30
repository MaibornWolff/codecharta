import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core"

const BUTTON_CLASSES =
    "group inline-flex h-[22px] cursor-pointer items-center rounded px-1.5 transition-colors hover:bg-base-200 " +
    "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary " +
    "disabled:cursor-not-allowed disabled:opacity-40"
const PRESSED_CLASSES = "bg-primary/15 text-secondary hover:bg-primary/20"
const HIGHLIGHTED_CLASSES = "text-secondary"

@Component({
    selector: "cc-bar-tool",
    templateUrl: "./barTool.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "grid transition-[grid-template-columns] duration-120 ease-out motion-reduce:transition-none",
        "[style.grid-template-columns]": "revealed() ? '1fr' : '0fr'",
        "[attr.inert]": "revealed() ? null : ''"
    }
})
export class BarToolComponent {
    readonly label = input.required<string>()
    readonly icon = input.required<string>()
    readonly tooltip = input<string | null>(null)
    readonly disabled = input(false, { transform: booleanAttribute })
    readonly pressed = input<boolean | null>(null)
    readonly highlighted = input(false, { transform: booleanAttribute })
    readonly revealed = input(true)
    readonly testId = input<string | null>(null)

    readonly activated = output<void>()

    protected readonly buttonClasses = computed(() => {
        if (this.pressed()) {
            return `${BUTTON_CLASSES} ${PRESSED_CLASSES}`
        }
        return this.highlighted() ? `${BUTTON_CLASSES} ${HIGHLIGHTED_CLASSES}` : BUTTON_CLASSES
    })
}
