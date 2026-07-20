import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { HoveredPathStore } from "../../stores/hoveredPath.store"

@Component({
    selector: "cc-hovered-path",
    templateUrl: "./hoveredPath.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoveredPathComponent {
    private readonly hoveredPathStore = inject(HoveredPathStore)

    /**
     * Views with no hoverable map (the domain word cloud) opt in to showing the SELECTED node's path
     * whenever nothing is hovered, so the bar always states what is on screen. The map view keeps the
     * hover-only default.
     */
    readonly showSelectedWhenNotHovered = input(false)

    private readonly hoveredPathData = toSignal(this.hoveredPathStore.hoveredPathData$)
    private readonly selectedPathData = toSignal(this.hoveredPathStore.selectedPathData$)

    pathData = computed(() => this.hoveredPathData() ?? (this.showSelectedWhenNotHovered() ? this.selectedPathData() : undefined))

    breadcrumbs = computed(
        () =>
            this.pathData()?.path.map((segment, index, array) => ({
                key: `${index}-${segment}`,
                segment,
                isLast: index === array.length - 1
            })) ?? []
    )

    isFile = computed(() => this.pathData()?.isFile ?? false)

    /**
     * Only the selection-driven variant announces: there the breadcrumb is the sole statement of which node
     * is on screen, so a change is meaningful status. Hover-driven updates would spam a screen reader.
     */
    ariaLive = computed(() => (this.showSelectedWhenNotHovered() ? "polite" : null))
}
