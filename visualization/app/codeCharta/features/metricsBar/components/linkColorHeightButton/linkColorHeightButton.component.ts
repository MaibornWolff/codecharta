import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { IsHeightAndColorMetricLinkedService } from "../../services/isHeightAndColorMetricLinked.service"

@Component({
    selector: "cc-link-color-height-button",
    templateUrl: "./linkColorHeightButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "self-center px-1" }
})
export class LinkColorHeightButtonComponent {
    private readonly isHeightAndColorMetricLinkedService = inject(IsHeightAndColorMetricLinkedService)

    readonly isLinked = toSignal(this.isHeightAndColorMetricLinkedService.isHeightAndColorMetricLinked$(), { initialValue: false })

    readonly iconClass = computed(() => (this.isLinked() ? "fa fa-link" : "fa fa-unlink"))
    readonly title = computed(() => (this.isLinked() ? "Unlink Height and Color Metric" : "Link Height and Color Metric"))
    readonly buttonClass = computed(() =>
        this.isLinked()
            ? "btn btn-circle btn-sm ring-2 ring-primary text-primary bg-primary/10 border-0"
            : "btn btn-circle btn-sm ring-1 ring-base-300 text-base-content/60 border-0 cc-link-button-dashed"
    )

    toggle() {
        this.isHeightAndColorMetricLinkedService.toggleIsHeightAndColorMetricLinked()
    }
}
