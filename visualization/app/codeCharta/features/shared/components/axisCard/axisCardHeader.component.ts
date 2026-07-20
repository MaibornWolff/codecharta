import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"

@Component({
    selector: "cc-axis-card-header",
    templateUrl: "./axisCardHeader.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class AxisCardHeaderComponent {
    readonly label = input.required<string>()
    readonly hasCog = input(false)
    readonly cogPopoverId = input<string | null>(null)
    readonly cogAnchorName = input<string | null>(null)
    readonly cogTestId = input<string | null>(null)

    readonly cogAnchorStyle = computed(() => {
        const anchor = this.cogAnchorName()
        return anchor ? `--${anchor}` : null
    })
}
