import { Component, computed } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { LayoutAlgorithm, CcState } from "../../../../../codeCharta.model"
import { setLayoutAlgorithm } from "../../../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { setMaxTreeMapFiles } from "../../../../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { GlobalSettingsFacade } from "../../../../../features/globalSettings/facade"
import { debounce } from "../../../../../util/debounce"

@Component({
    selector: "cc-map-layout-selection",
    templateUrl: "./mapLayoutSelection.component.html",
    imports: []
})
export class MapLayoutSelectionComponent {
    layoutAlgorithms = Object.values(LayoutAlgorithm)
    layoutAlgorithm = toSignal(this.globalSettingsFacade.layoutAlgorithm$(), { requireSync: true })
    maxTreeMapFiles = toSignal(this.globalSettingsFacade.maxTreeMapFiles$(), { requireSync: true })

    showTreeMapSlider = computed(() => this.layoutAlgorithm() === "TreeMapStreet")

    constructor(
        private readonly store: Store<CcState>,
        private readonly globalSettingsFacade: GlobalSettingsFacade
    ) {}

    handleSelectedLayoutAlgorithmChanged(event: Event) {
        const value = (event.target as HTMLSelectElement).value as LayoutAlgorithm
        this.store.dispatch(setLayoutAlgorithm({ value }))
    }

    handleMaxTreeMapFilesRangeInput(event: Event) {
        const value = Number((event.target as HTMLInputElement).value)
        this.debouncedSetMaxTreeMapFiles(value)
    }

    handleMaxTreeMapFilesNumberInput(event: Event) {
        const input = event.target as HTMLInputElement
        const value = Number(input.value)

        // Validate the number is within bounds
        if (value >= 1 && value <= 1000) {
            this.debouncedSetMaxTreeMapFiles(value)
        }
    }

    private readonly debouncedSetMaxTreeMapFiles = debounce((value: number) => {
        this.store.dispatch(setMaxTreeMapFiles({ value }))
    }, 400)
}
