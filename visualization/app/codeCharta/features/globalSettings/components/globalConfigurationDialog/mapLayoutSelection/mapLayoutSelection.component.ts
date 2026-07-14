import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { LayoutAlgorithm } from "../../../../../model/codeCharta.model"
import { MapStateReadWindow } from "../../../../../stores/mapState/mapState.read.facade"
import { PreferencesReadWindow } from "../../../../../stores/preferences/preferences.read.facade"
import { debounce } from "../../../../../util/debounce"
import { GlobalSettingsWriteStore } from "../../../stores/globalSettings.write.store"

@Component({
    selector: "cc-map-layout-selection",
    templateUrl: "./mapLayoutSelection.component.html",
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapLayoutSelectionComponent {
    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly preferencesReadWindow = inject(PreferencesReadWindow)
    private readonly globalSettingsWriteStore = inject(GlobalSettingsWriteStore)

    layoutAlgorithms = Object.values(LayoutAlgorithm)
    layoutAlgorithm = toSignal(this.mapStateReadWindow.layoutAlgorithm$, { requireSync: true })
    maxTreeMapFiles = toSignal(this.preferencesReadWindow.maxTreeMapFiles$, { requireSync: true })

    showTreeMapSlider = computed(() => this.layoutAlgorithm() === "TreeMapStreet")

    handleSelectedLayoutAlgorithmChanged(event: Event) {
        const value = (event.target as HTMLSelectElement).value as LayoutAlgorithm
        this.globalSettingsWriteStore.setLayoutAlgorithm(value)
    }

    handleMaxTreeMapFilesRangeInput(event: Event) {
        const value = Number((event.target as HTMLInputElement).value)
        this.debouncedSetMaxTreeMapFiles(value)
    }

    handleMaxTreeMapFilesNumberInput(event: Event) {
        const input = event.target as HTMLInputElement
        const value = Number(input.value)

        if (value >= 1 && value <= 1000) {
            this.debouncedSetMaxTreeMapFiles(value)
        }
    }

    private readonly debouncedSetMaxTreeMapFiles = debounce((value: number) => {
        this.globalSettingsWriteStore.setMaxTreeMapFiles(value)
    }, 400)
}
