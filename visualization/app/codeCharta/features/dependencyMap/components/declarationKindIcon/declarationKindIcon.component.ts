import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { declarationKindLookOf, KIND_ICON_COLORS } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"

@Component({
    selector: "cc-declaration-kind-icon",
    template: `{{ look().letter }}`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border text-[10px] leading-none font-bold",
        "[style.background-color]": "look().tint",
        "[style.border-color]": "colors.stroke",
        "[style.color]": "colors.letter",
        "[attr.title]": "look().label",
        "aria-hidden": "true"
    }
})
export class DeclarationKindIconComponent {
    readonly kind = input.required<string | undefined>()

    protected readonly look = computed(() => declarationKindLookOf(this.kind()))
    protected readonly colors = KIND_ICON_COLORS
}
