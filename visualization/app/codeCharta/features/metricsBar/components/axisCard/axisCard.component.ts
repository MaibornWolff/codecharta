import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"

@Component({
    selector: "cc-axis-card",
    templateUrl: "./axisCard.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "group flex flex-col items-stretch px-3 py-2 transition-colors relative" }
})
export class AxisCardComponent {
    readonly label = input.required<string>()
    readonly metricName = input<string | null>(null)
    readonly hasCog = input(false)
    readonly cogPopoverId = input<string | null>(null)
    readonly cogAnchorName = input<string | null>(null)
    readonly searchPopoverId = input<string | null>(null)
    readonly searchAnchorName = input<string | null>(null)
    readonly disabled = input(false)
    readonly testId = input<string | null>(null)
    readonly cogTestId = input<string | null>(null)
    readonly minWidthClass = input("min-w-[120px]")

    readonly cardClasses = "flex flex-col items-stretch gap-1.5 px-2 py-1 rounded-md transition-colors max-w-[180px] min-w-0"

    readonly bodyAnchorStyle = computed(() => {
        const anchor = this.searchAnchorName()
        return anchor ? `--${anchor}` : null
    })

    readonly cogAnchorStyle = computed(() => {
        const anchor = this.cogAnchorName()
        return anchor ? `--${anchor}` : null
    })

    readonly contentButtonClasses = computed(() => {
        const classes = ["flex", "flex-col", "items-stretch", "gap-1", "bg-transparent", "border-0", "p-0", "rounded-sm", "text-current"]
        if (this.disabled()) {
            classes.push("cursor-default")
        } else {
            classes.push("cursor-pointer", "hover:bg-base-200")
        }
        return classes.join(" ")
    })
}
