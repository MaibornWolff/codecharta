import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { toggleEdgeMetricVisible } from "../../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"
import { isEdgeMetricVisibleSelector } from "../../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"

@Component({
    selector: "cc-edge-metric-toggle",
    templateUrl: "./edgeMetricToggle.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class EdgeMetricToggleComponent {
    private readonly store = inject(Store<CcState>)

    readonly isEdgeMetricVisible = toSignal(this.store.select(isEdgeMetricVisibleSelector), { initialValue: true })

    toggle() {
        this.store.dispatch(toggleEdgeMetricVisible())
    }
}
