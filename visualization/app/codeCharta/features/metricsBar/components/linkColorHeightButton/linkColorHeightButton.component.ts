import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { toggleIsColorMetricLinkedToHeightMetric } from "../../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"

@Component({
    selector: "cc-link-color-height-button",
    templateUrl: "./linkColorHeightButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "self-center px-1" }
})
export class LinkColorHeightButtonComponent {
    private readonly store = inject(Store<CcState>)

    readonly isLinked = toSignal(this.store.select(isColorMetricLinkedToHeightMetricSelector), { initialValue: false })

    readonly iconClass = computed(() => (this.isLinked() ? "fa fa-link" : "fa fa-unlink"))
    readonly title = computed(() => (this.isLinked() ? "Unlink Height and Color Metric" : "Link Height and Color Metric"))
    readonly buttonClass = computed(() =>
        this.isLinked()
            ? "btn btn-circle btn-sm ring-2 ring-primary text-primary bg-primary/10 border-0"
            : "btn btn-circle btn-sm ring-1 ring-base-300 text-base-content/60 border-0 cc-link-button-dashed"
    )

    toggle() {
        this.store.dispatch(toggleIsColorMetricLinkedToHeightMetric())
    }
}
