import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ConfirmDialogComponent } from "../../../../shared/facade"
import { FiltersResetStore } from "../../../stores/filtersReset.store"

@Component({
    selector: "cc-reset-filters-button",
    templateUrl: "./resetFiltersButton.component.html",
    imports: [ConfirmDialogComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetFiltersButtonComponent {
    private readonly filtersResetStore = inject(FiltersResetStore)

    readonly ruleCount = toSignal(this.filtersResetStore.ruleCount$, { initialValue: 0 })
    readonly hasRules = computed(() => this.ruleCount() > 0)

    readonly confirmMessage = computed(() => {
        const count = this.ruleCount()
        const rules = count === 1 ? "The 1 flatten or hide rule is" : `All ${count} flatten and hide rules are`
        return `${rules} removed and every file comes back onto the map. Metrics, colors and the camera are left alone.`
    })

    private readonly confirmDialog = viewChild.required<ConfirmDialogComponent>("confirmDialog")

    requestReset() {
        this.confirmDialog().open()
    }

    confirmReset() {
        this.filtersResetStore.resetFilters()
    }
}
