import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { HoveredPathStore } from "../../stores/hoveredPath.store"

@Component({
    selector: "cc-hovered-path",
    templateUrl: "./hoveredPath.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoveredPathComponent {
    private readonly hoveredPathStore = inject(HoveredPathStore)

    pathData = toSignal(this.hoveredPathStore.hoveredPathData$)

    breadcrumbs = computed(
        () =>
            this.pathData()?.path.map((segment, index, array) => ({
                key: `${index}-${segment}`,
                segment,
                isLast: index === array.length - 1
            })) ?? []
    )

    isFile = computed(() => this.pathData()?.isFile ?? false)
}
