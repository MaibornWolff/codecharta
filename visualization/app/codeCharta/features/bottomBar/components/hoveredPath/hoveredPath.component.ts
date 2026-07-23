import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { of, switchMap } from "rxjs"
import { HoveredPathStore } from "../../stores/hoveredPath.store"

@Component({
    selector: "cc-hovered-path",
    templateUrl: "./hoveredPath.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoveredPathComponent {
    private readonly hoveredPathStore = inject(HoveredPathStore)

    readonly showSelectedWhenNotHovered = input(false)

    readonly selectedNodePath = input<string | null | undefined>(undefined)

    private readonly hoveredPathData = toSignal(this.hoveredPathStore.hoveredPathData$)
    private readonly globalSelectedPathData = toSignal(this.hoveredPathStore.selectedPathData$)
    private readonly ownedSelectedPathData = toSignal(
        toObservable(this.selectedNodePath).pipe(
            switchMap(path => (path === undefined ? of(undefined) : this.hoveredPathStore.selectedPathDataFor(path)))
        )
    )

    private readonly selectedPathData = computed(() =>
        this.selectedNodePath() === undefined ? this.globalSelectedPathData() : this.ownedSelectedPathData()
    )

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

    ariaLive = computed(() => (this.showSelectedWhenNotHovered() ? "polite" : null))
}
